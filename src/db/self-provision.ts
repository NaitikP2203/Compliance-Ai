import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { Pool } = pg;

export async function runSelfProvisioning() {
  console.log('=== [COMPLIANCE PLATFORM SELF-PROVISIONING SYSTEM] ===');
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://msyrohztsiemtyqrxqhi.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const dbUrl = process.env.DATABASE_URL;

  // 1. Provision Storage Buckets using Supabase Service Role Client if available
  if (serviceRoleKey) {
    try {
      console.log('[SELF-PROVISION] Initializing Supabase Service Role Client...');
      const adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        }
      });

      console.log('[SELF-PROVISION] Verifying "compliance-vault" storage bucket...');
      const { data: buckets, error: listError } = await adminClient.storage.listBuckets();
      
      if (listError) {
        console.error('[SELF-PROVISION] Error listing storage buckets via REST API:', listError.message);
      } else {
        const vaultExists = buckets?.some(b => b.id === 'compliance-vault');
        if (!vaultExists) {
          console.log('[SELF-PROVISION] "compliance-vault" bucket not found. Attempting creation...');
          const { error: createError } = await adminClient.storage.createBucket('compliance-vault', {
            public: true,
            fileSizeLimit: 5242880, // 5MB
          });
          if (createError) {
            console.error('[SELF-PROVISION] Failed to create bucket via REST API:', createError.message);
          } else {
            console.log('[SELF-PROVISION] "compliance-vault" bucket created successfully via REST API!');
          }
        } else {
          console.log('[SELF-PROVISION] "compliance-vault" bucket already exists and is verified.');
        }
      }
    } catch (err: any) {
      console.error('[SELF-PROVISION] Error during storage bucket verification:', err.message || err);
    }
  } else {
    console.log('[SELF-PROVISION] Note: SUPABASE_SERVICE_ROLE_KEY is not set. Skipping bucket check via REST API.');
  }

  // 2. Database Schema Migrations & Direct PostgreSQL Verification
  if (!dbUrl) {
    console.log('\n[INFO] [SELF-PROVISION] DATABASE_URL is not set.');
    console.log('[INFO] Direct database migrations are currently paused. The application will run using the Supabase API.');
    console.log('[INFO] If you want to automatically provision/migrate your database schema, set the DATABASE_URL environment variable.');
    console.log('======================================================\n');
    return;
  }

  const hasPlaceholder = dbUrl.includes('[YOUR-PASSWORD]') || 
                         dbUrl.includes('[PASSWORD]') || 
                         dbUrl.includes('[PROJECT-REF]') || 
                         dbUrl.includes('YOUR-PASSWORD');

  if (hasPlaceholder) {
    console.log('\n[INFO] [SELF-PROVISION] DATABASE_URL contains a default placeholder password or project ref.');
    console.log('[INFO] Direct database migrations are currently paused. The application will run using the Supabase API.');
    console.log('[INFO] To run direct schema migrations, please configure your actual database password in the DATABASE_URL.');
    console.log('======================================================\n');
    return;
  }

  console.log('[SELF-PROVISION] Attempting direct PostgreSQL connection to execute schema sync...');
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false } // Required for Supabase secure connections
  });

  try {
    const client = await pool.connect();
    console.log('[SELF-PROVISION] PostgreSQL connection established successfully.');

    try {
      // Begin migration transaction
      await client.query('BEGIN');

      // 1. Enable uuid-ossp extension
      console.log('[SELF-PROVISION] Enabling uuid-ossp extension if not exists...');
      await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

      // 2. Create businesses table
      console.log('[SELF-PROVISION] Verifying "businesses" table...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS public.businesses (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
          gstin TEXT,
          business_name TEXT,
          name TEXT NOT NULL,
          industry TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
          risk_score INTEGER NOT NULL DEFAULT 0
        );
      `);

      // 3. Create documents table
      console.log('[SELF-PROVISION] Verifying "documents" table...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS public.documents (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          type TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('verified', 'pending', 'rejected')),
          url TEXT NOT NULL
        );
      `);

      // 4. Verification and dynamic column migration (just in case schema drifts in future)
      console.log('[SELF-PROVISION] Checking for table columns and sync integrity...');
      
      // Ensure risk_score column exists on businesses
      const { rows: bizCols } = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'businesses' AND column_name = 'risk_score';
      `);
      if (bizCols.length === 0) {
        console.log('[SELF-PROVISION] Migrating: Adding "risk_score" column to "businesses" table...');
        await client.query('ALTER TABLE public.businesses ADD COLUMN risk_score INTEGER NOT NULL DEFAULT 0;');
      }

      // Ensure user_id column exists on businesses (MUST default to auth.uid())
      const { rows: userIdCols } = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'businesses' AND column_name = 'user_id';
      `);
      if (userIdCols.length === 0) {
        console.log('[SELF-PROVISION] Migrating: Adding "user_id" column to "businesses" table...');
        await client.query('ALTER TABLE public.businesses ADD COLUMN user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;');
      }

      // Ensure gstin column exists on businesses
      const { rows: gstinCols } = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'businesses' AND column_name = 'gstin';
      `);
      if (gstinCols.length === 0) {
        console.log('[SELF-PROVISION] Migrating: Adding "gstin" column to "businesses" table...');
        await client.query('ALTER TABLE public.businesses ADD COLUMN gstin TEXT;');
      }

      // Ensure business_name column exists on businesses
      const { rows: bizNameCols } = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'businesses' AND column_name = 'business_name';
      `);
      if (bizNameCols.length === 0) {
        console.log('[SELF-PROVISION] Migrating: Adding "business_name" column to "businesses" table...');
        await client.query('ALTER TABLE public.businesses ADD COLUMN business_name TEXT;');
      }

      // Ensure name and business_name are synchronized
      await client.query(`
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
        $$ LANGUAGE plpgsql;
      `);

      await client.query(`
        DROP TRIGGER IF EXISTS trg_sync_business_name ON public.businesses;
        CREATE TRIGGER trg_sync_business_name
        BEFORE INSERT OR UPDATE ON public.businesses
        FOR EACH ROW
        EXECUTE FUNCTION public.sync_business_name();
      `);

      // 5. Create indexes for extreme read/query performance optimization
      console.log('[SELF-PROVISION] Creating database optimization indexes...');
      await client.query('CREATE INDEX IF NOT EXISTS idx_documents_business_id ON public.documents(business_id);');
      await client.query('CREATE INDEX IF NOT EXISTS idx_businesses_name ON public.businesses(name);');
      await client.query('CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON public.businesses(user_id);');

      // 6. Enforce Row Level Security (RLS) on both core tables
      console.log('[SELF-PROVISION] Enabling Row Level Security (RLS)...');
      await client.query('ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;');
      await client.query('ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;');

      // 7. Provision clean, secure RLS access policies (following strict Supabase best practices)
      console.log('[SELF-PROVISION] Reconciling Row Level Security (RLS) policies...');
      
      // Clean up legacy open/insecure policies
      await client.query(`
        DROP POLICY IF EXISTS "Allow authenticated and anon access" ON public.businesses;
        DROP POLICY IF EXISTS "Users can view their own businesses" ON public.businesses;
        DROP POLICY IF EXISTS "Users can insert their own businesses" ON public.businesses;
        DROP POLICY IF EXISTS "Users can update their own businesses" ON public.businesses;
        DROP POLICY IF EXISTS "Users can delete their own businesses" ON public.businesses;
      `);

      // 1. SELECT policy
      await client.query(`
        CREATE POLICY "Users can view their own businesses" ON public.businesses
        FOR SELECT TO authenticated USING (auth.uid() = user_id);
      `);

      // 2. INSERT policy
      await client.query(`
        CREATE POLICY "Users can insert their own businesses" ON public.businesses
        FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
      `);

      // 3. UPDATE policy
      await client.query(`
        CREATE POLICY "Users can update their own businesses" ON public.businesses
        FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
      `);

      // 4. DELETE policy
      await client.query(`
        CREATE POLICY "Users can delete their own businesses" ON public.businesses
        FOR DELETE TO authenticated USING (auth.uid() = user_id);
      `);

      // Clean up documents legacy open/insecure policies
      await client.query(`
        DROP POLICY IF EXISTS "Allow authenticated and anon access" ON public.documents;
        DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
        DROP POLICY IF EXISTS "Users can insert their own documents" ON public.documents;
        DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
        DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;
      `);

      // 1. SELECT policy
      await client.query(`
        CREATE POLICY "Users can view their own documents" ON public.documents
        FOR SELECT TO authenticated USING (
          EXISTS (
            SELECT 1 FROM public.businesses b
            WHERE b.id = documents.business_id AND b.user_id = auth.uid()
          )
        );
      `);

      // 2. INSERT policy
      await client.query(`
        CREATE POLICY "Users can insert their own documents" ON public.documents
        FOR INSERT TO authenticated WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.businesses b
            WHERE b.id = documents.business_id AND b.user_id = auth.uid()
          )
        );
      `);

      // 3. UPDATE policy
      await client.query(`
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
      `);

      // 4. DELETE policy
      await client.query(`
        CREATE POLICY "Users can delete their own documents" ON public.documents
        FOR DELETE TO authenticated USING (
          EXISTS (
            SELECT 1 FROM public.businesses b
            WHERE b.id = documents.business_id AND b.user_id = auth.uid()
          )
        );
      `);

      // 8. Provision fallback Storage Buckets directly via SQL in case REST client was skipped
      console.log('[SELF-PROVISION] Verifying storage bucket record in database...');
      await client.query(`
        INSERT INTO storage.buckets (id, name, public, file_size_limit)
        VALUES ('compliance-vault', 'compliance-vault', true, 5242880)
        ON CONFLICT (id) DO NOTHING;
      `);

      // 9. Create RLS policies on storage objects for compliance-vault bucket
      console.log('[SELF-PROVISION] Provisioning Storage RLS policies for "compliance-vault"...');
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access to compliance-vault'
          ) THEN
            CREATE POLICY "Public Access to compliance-vault" ON storage.objects
            FOR SELECT USING (bucket_id = 'compliance-vault');
          END IF;
        END
        $$;
      `);

      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Upload Access to compliance-vault'
          ) THEN
            CREATE POLICY "Upload Access to compliance-vault" ON storage.objects
            FOR INSERT WITH CHECK (bucket_id = 'compliance-vault');
          END IF;
        END
        $$;
      `);

      // Commit transaction
      await client.query('COMMIT');
      console.log('[SELF-PROVISION] Database schema is fully synced, optimized, and RLS policies are applied!');

    } catch (err: any) {
      await client.query('ROLLBACK');
      console.error('[SELF-PROVISION] Error executing migration transaction, rolled back:', err.message || err);
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.log('\n--- [SELF-PROVISION] Direct database migration is currently inactive ---');
    console.log('[INFO] Could not connect to direct PostgreSQL database via DATABASE_URL.');
    console.log('[INFO] This is expected in sandbox, local-dev, or serverless environments where direct TCP access');
    console.log('[INFO] is restricted, or when the correct password is not provided.');
    console.log('[INFO] The system continues normal operation using standard Supabase REST and Auth endpoints.');
    console.log(`[INFO] (Details: ${err.message || err})`);
    console.log('------------------------------------------------------------------------\n');
  } finally {
    try {
      await pool.end();
    } catch {
      // Ignore pool close errors
    }
  }
  console.log('======================================================\n');
}
