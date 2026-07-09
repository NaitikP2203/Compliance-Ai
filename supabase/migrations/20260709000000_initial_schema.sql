-- 20260709000000_initial_schema.sql
-- Complete Supabase Auto-Migration and Provisioning Script
-- Generated for full compliance local-dev and production synchronization

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- 2. Create Businesses Table
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    gstin TEXT,
    business_name TEXT,
    name TEXT NOT NULL,
    industry TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
    risk_score INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT businesses_user_id_fk FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 3. Create Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('verified', 'pending', 'rejected')),
    url TEXT NOT NULL,
    CONSTRAINT documents_business_id_fk FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE
);

-- 4. Sync Function and Trigger for Name & Business Name Compatibility
CREATE OR REPLACE FUNCTION public.sync_business_name()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.business_name IS NULL AND NEW.name IS NOT NULL THEN
        NEW.business_name := NEW.name;
    ELSIF NEW.name IS NULL AND NEW.business_name IS NOT NULL THEN
        NEW.name := NEW.business_name;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_business_name ON public.businesses;
CREATE TRIGGER trg_sync_business_name
BEFORE INSERT OR UPDATE ON public.businesses
FOR EACH ROW
EXECUTE FUNCTION public.sync_business_name();

-- 5. Performance Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON public.businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_business_id ON public.documents(business_id);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 7. Businesses Row Level Security Policies
DROP POLICY IF EXISTS "Users can view their own businesses" ON public.businesses;
CREATE POLICY "Users can view their own businesses" ON public.businesses
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own businesses" ON public.businesses;
CREATE POLICY "Users can insert their own businesses" ON public.businesses
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own businesses" ON public.businesses;
CREATE POLICY "Users can update their own businesses" ON public.businesses
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own businesses" ON public.businesses;
CREATE POLICY "Users can delete their own businesses" ON public.businesses
    FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 8. Documents Row Level Security Policies
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
CREATE POLICY "Users can view their own documents" ON public.documents
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.businesses b
            WHERE b.id = documents.business_id AND b.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert their own documents" ON public.documents;
CREATE POLICY "Users can insert their own documents" ON public.documents
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.businesses b
            WHERE b.id = documents.business_id AND b.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
CREATE POLICY "Users can update their own documents" ON public.documents
    FOR UPDATE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.businesses b
            WHERE b.id = documents.business_id AND b.user_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.businesses b
            WHERE b.id = documents.business_id AND b.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;
CREATE POLICY "Users can delete their own documents" ON public.documents
    FOR DELETE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.businesses b
            WHERE b.id = documents.business_id AND b.user_id = auth.uid()
        )
    );

-- 9. Storage Buckets & Storage Security Configuration
-- Ensure compliance-vault bucket exists in Supabase storage schema
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('compliance-vault', 'compliance-vault', false, 5242880, '{image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document}')
ON CONFLICT (id) DO UPDATE SET 
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage object policies for compliance-vault bucket
DROP POLICY IF EXISTS "Authenticated users can select objects in compliance-vault" ON storage.objects;
CREATE POLICY "Authenticated users can select objects in compliance-vault" ON storage.objects
    FOR SELECT TO authenticated USING (bucket_id = 'compliance-vault');

DROP POLICY IF EXISTS "Authenticated users can upload objects to compliance-vault" ON storage.objects;
CREATE POLICY "Authenticated users can upload objects to compliance-vault" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'compliance-vault');

DROP POLICY IF EXISTS "Authenticated users can update objects in compliance-vault" ON storage.objects;
CREATE POLICY "Authenticated users can update objects in compliance-vault" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'compliance-vault') WITH CHECK (bucket_id = 'compliance-vault');

DROP POLICY IF EXISTS "Authenticated users can delete objects in compliance-vault" ON storage.objects;
CREATE POLICY "Authenticated users can delete objects in compliance-vault" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'compliance-vault');
