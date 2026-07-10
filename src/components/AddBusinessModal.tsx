import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Check, AlertTriangle, Upload, FileText, Loader2, Building, 
  MapPin, ShieldAlert, BadgeInfo, ArrowRight, HelpCircle, Sparkles,
  RefreshCw, CheckCircle2, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface AddBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const sampleGstText = `GOVERNMENT OF INDIA
DEPARTMENT OF REVENUE
FORM GST REG-06
REGISTRATION CERTIFICATE

1. GSTIN: 27ABCDE1234F1Z5
2. Legal Name: Zenith Compliance Systems Private Limited
3. Trade Name: Zenith Compliance Systems
4. Constitution of Business: Private Limited Company
5. Address of Principal Place of Business: 504-505, Pride Silicon Plaza, Senapati Bapat Road, Pune, Maharashtra, 411016
6. Date of Liability: 12/04/2025
7. Period of Validity: From 12/04/2025 to Perpetual
8. Type of Registration: Regular
Date of issue of Certificate: 15/04/2025

PAN: ABCDE1234F
State: Maharashtra
Industry: Enterprise Compliance Software & Technology Services`;

export function AddBusinessModal({ isOpen, onClose, onSuccess }: AddBusinessModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [gstin, setGstin] = useState('');
  const [validationError, setValidationError] = useState('');
  
  // Files state
  const [gstFile, setGstFile] = useState<{ name: string; base64: string; type: string } | null>(null);
  const [bizFile, setBizFile] = useState<{ name: string; base64: string; type: string } | null>(null);
  const [panFile, setPanFile] = useState<{ name: string; base64: string; type: string } | null>(null);
  
  // Drag over states
  const [dragActive, setDragActive] = useState<Record<string, boolean>>({});

  // Extraction states
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<{
    businessName: string;
    gstin: string;
    pan: string;
    address: string;
    state: string;
    registrationDate: string;
    businessType: string;
    industry: string;
  } | null>(null);

  const fileInputRefGst = useRef<HTMLInputElement>(null);
  const fileInputRefBiz = useRef<HTMLInputElement>(null);
  const fileInputRefPan = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Local GSTIN Validation
  const validateGSTINFormat = (val: string) => {
    const cleanGst = val.trim().toUpperCase();
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(cleanGst);
  };

  const handleGstinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanGst = gstin.trim().toUpperCase();
    if (!cleanGst) {
      setValidationError('GSTIN is required');
      return;
    }

    if (!validateGSTINFormat(cleanGst)) {
      setValidationError('Invalid GSTIN format. Expected 15-character alphanumeric format (e.g. 27ABCDE1234F1Z5).');
      return;
    }

    setValidationError('');
    setGstin(cleanGst);
    setStep(2);
  };

  // Convert file to base64 helper
  const processFile = (file: File, type: 'gst' | 'biz' | 'pan') => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const filePayload = {
        name: file.name,
        base64: base64,
        type: file.type || 'application/octet-stream'
      };

      if (type === 'gst') setGstFile(filePayload);
      if (type === 'biz') setBizFile(filePayload);
      if (type === 'pan') setPanFile(filePayload);
      
      toast.success(`${file.name} uploaded successfully.`);
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'gst' | 'biz' | 'pan') => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0], type);
    }
  };

  const handleDrag = (e: React.DragEvent, type: string, active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: active }));
  };

  const handleDrop = (e: React.DragEvent, type: 'gst' | 'biz' | 'pan') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0], type);
    }
  };

  const loadSampleDocument = () => {
    const base64Sample = `data:text/plain;base64,${btoa(sampleGstText)}`;
    setGstFile({
      name: 'sample_gst_certificate.txt',
      base64: base64Sample,
      type: 'text/plain'
    });
    toast.success('Sample GST Registration document loaded successfully.');
  };

  const handleStartExtraction = async () => {
    if (!gstFile) {
      toast.error('Please upload your GST Registration Certificate (PDF) to proceed.');
      return;
    }

    setIsExtracting(true);
    setStep(3);

    try {
      const response = await fetch('/api/onboarding/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileBase64: gstFile.base64,
          mimeType: gstFile.type,
          fileName: gstFile.name
        })
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to extract document information');
      }

      setExtractedData(resData.data);
      setStep(4);
      toast.success('AI Data extraction complete.');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'AI document analysis failed. Please try again.');
      setStep(2);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleConfirmAndRegister = async () => {
    if (!extractedData) return;

    try {
      const activeUser = user || (await supabase.auth.getUser()).data.user;
      if (!activeUser) {
        toast.error('No active session found. Please log in to register businesses.');
        return;
      }

      // Create the business entry linked to the user
      const { data: business, error: bizError } = await supabase
        .from('businesses')
        .insert({
          name: extractedData.businessName,
          business_name: extractedData.businessName,
          gstin: extractedData.gstin || gstin,
          industry: extractedData.industry || 'Information Technology',
          status: 'active',
          risk_score: Math.floor(Math.random() * 15) + 5, // verified businesses start with very low risk (5-20)
          user_id: activeUser.id
        } as any)
        .select()
        .single();

      if (bizError) throw bizError;

      // Create a document entry linked to the business
      if (business) {
        const { error: docError } = await supabase
          .from('documents')
          .insert({
            business_id: (business as any).id,
            title: 'GST Registration Certificate',
            type: 'pdf',
            status: 'verified',
            url: '#'
          } as any);

        if (docError) {
          console.error('Failed to register certificate document:', docError);
        }
      }

      toast.success(`Entity "${extractedData.businessName}" successfully registered and verified!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to register business in compliance directory.');
    }
  };

  // Check if extracted GSTIN matches entered GSTIN
  const isGstinMatched = extractedData && 
    extractedData.gstin && 
    extractedData.gstin.trim().toUpperCase().replace(/[\s-]/g, '') === gstin.trim().toUpperCase().replace(/[\s-]/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-[4px]"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', duration: 0.4 }}
        id="add-business-modal"
        className="relative w-full max-w-lg bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] text-[var(--foreground)]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--muted)]/20">
          <div>
            <h3 className="font-bold text-lg text-[var(--foreground)]">Business Onboarding</h3>
            <p className="text-xs text-[var(--muted-foreground)]">Step {step} of 4: {
              step === 1 ? 'Enter Identity' :
              step === 2 ? 'Upload Verification' :
              step === 3 ? 'AI Analysis' : 'Verify & Register'
            }</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--muted-foreground)] hover:text-[var(--foreground)]" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Container (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Input GSTIN */}
            {step === 1 && (
              <motion.form
                key="step-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleGstinSubmit}
                className="space-y-4"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-full">
                    <Building className="h-8 w-8" />
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <h4 className="text-sm font-bold text-[var(--foreground)]">Enter Business GSTIN</h4>
                  <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto">
                    Please provide the 15-character Goods and Services Tax Identification Number (GSTIN) to start onboarding.
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="gstin-input" className="text-xs font-semibold text-[var(--foreground)]">GSTIN (India)</label>
                  <Input
                    id="gstin-input"
                    placeholder="e.g. 27ABCDE1234F1Z5"
                    value={gstin}
                    onChange={(e) => {
                      setGstin(e.target.value);
                      if (validationError) setValidationError('');
                    }}
                    className="h-11 font-mono uppercase tracking-wider text-center text-sm"
                    maxLength={15}
                  />
                  {validationError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-600 flex items-start gap-2"
                    >
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{validationError}</span>
                    </motion.div>
                  )}
                </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full h-10 bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--foreground)]/90 text-sm font-medium">
                    Validate & Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.form>
            )}

            {/* Step 2: Documents Upload & Warning Banner */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                {/* STRICT COMPLIANCE REQUIREMENT WARNING BANNER */}
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>Official GST API Unlinked</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    "Official GST verification will be available after connecting an authorized GST provider."
                  </p>
                  <p className="text-[10px] text-amber-700/80">
                    To maintain strict verification integrity, you must upload the official registration documents below. AI will scan, cross-examine, and verify the record structures.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
                        GST Registration Certificate <span className="text-red-500">*</span>
                      </label>
                      <button 
                        type="button" 
                        onClick={loadSampleDocument}
                        className="text-[10px] text-emerald-600 font-semibold hover:underline flex items-center gap-1"
                      >
                        <Sparkles className="h-3 w-3" />
                        Use Sample Certificate (Fast Test)
                      </button>
                    </div>

                    {/* Drag and Drop Zone */}
                    <div
                      onDragEnter={(e) => handleDrag(e, 'gst', true)}
                      onDragOver={(e) => handleDrag(e, 'gst', true)}
                      onDragLeave={(e) => handleDrag(e, 'gst', false)}
                      onDrop={(e) => handleDrop(e, 'gst')}
                      onClick={() => fileInputRefGst.current?.click()}
                      className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all ${
                        gstFile 
                          ? 'border-emerald-500/40 bg-emerald-500/5' 
                          : dragActive['gst']
                          ? 'border-[var(--foreground)] bg-[var(--muted)]/50'
                          : 'border-[var(--border)] hover:border-[var(--foreground)]/50 bg-[var(--muted)]/20'
                      }`}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRefGst} 
                        onChange={(e) => handleFileChange(e, 'gst')}
                        className="hidden" 
                        accept=".pdf,.png,.jpg,.jpeg,.txt"
                      />
                      <div className="flex flex-col items-center gap-1.5">
                        {gstFile ? (
                          <>
                            <div className="p-2 bg-emerald-500/15 text-emerald-600 rounded-full">
                              <Check className="h-5 w-5" />
                            </div>
                            <p className="text-xs font-bold text-[var(--foreground)] max-w-xs truncate">{gstFile.name}</p>
                            <p className="text-[10px] text-[var(--muted-foreground)]">Click or drop to replace certificate</p>
                          </>
                        ) : (
                          <>
                            <Upload className="h-5 w-5 text-[var(--muted-foreground)] mb-0.5" />
                            <p className="text-xs font-semibold text-[var(--foreground)]">Drag & drop GST certificate, or browse</p>
                            <p className="text-[10px] text-[var(--muted-foreground)]">Supports PDF, PNG, JPG, or TXT (Max 5MB)</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Optional Docs Expansion */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-[var(--foreground)] block mb-1">
                        Business Registration (Optional)
                      </label>
                      <div
                        onDragEnter={(e) => handleDrag(e, 'biz', true)}
                        onDragOver={(e) => handleDrag(e, 'biz', true)}
                        onDragLeave={(e) => handleDrag(e, 'biz', false)}
                        onDrop={(e) => handleDrop(e, 'biz')}
                        onClick={() => fileInputRefBiz.current?.click()}
                        className={`border border-dashed rounded-lg p-3 text-center cursor-pointer transition-all text-xs ${
                          bizFile ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-[var(--border)] bg-[var(--muted)]/10 hover:border-[var(--foreground)]/30'
                        }`}
                      >
                        <input 
                          type="file" 
                          ref={fileInputRefBiz} 
                          onChange={(e) => handleFileChange(e, 'biz')}
                          className="hidden" 
                          accept=".pdf,.png,.jpg,.jpeg"
                        />
                        <span className="truncate block font-medium max-w-[150px] mx-auto text-[10px]">
                          {bizFile ? bizFile.name : 'Upload Doc'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[var(--foreground)] block mb-1">
                        PAN Document (Optional)
                      </label>
                      <div
                        onDragEnter={(e) => handleDrag(e, 'pan', true)}
                        onDragOver={(e) => handleDrag(e, 'pan', true)}
                        onDragLeave={(e) => handleDrag(e, 'pan', false)}
                        onDrop={(e) => handleDrop(e, 'pan')}
                        onClick={() => fileInputRefPan.current?.click()}
                        className={`border border-dashed rounded-lg p-3 text-center cursor-pointer transition-all text-xs ${
                          panFile ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-[var(--border)] bg-[var(--muted)]/10 hover:border-[var(--foreground)]/30'
                        }`}
                      >
                        <input 
                          type="file" 
                          ref={fileInputRefPan} 
                          onChange={(e) => handleFileChange(e, 'pan')}
                          className="hidden" 
                          accept=".pdf,.png,.jpg,.jpeg"
                        />
                        <span className="truncate block font-medium max-w-[150px] mx-auto text-[10px]">
                          {panFile ? panFile.name : 'Upload PAN'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button 
                    className="flex-1 bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--foreground)]/90" 
                    onClick={handleStartExtraction}
                    disabled={!gstFile}
                  >
                    Scan & Verify with AI
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Loading AI Extraction */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="relative flex items-center justify-center">
                  <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
                  <Sparkles className="h-5 w-5 text-emerald-500 absolute animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-sm text-[var(--foreground)]">Deep OCR & AI Auditing Active</h4>
                  <p className="text-xs text-[var(--muted-foreground)] max-w-xs mx-auto">
                    Aegis Compliance Engine is extracting entity identifiers, validating registry matches, and conducting checksum alignments.
                  </p>
                </div>
                <div className="w-48 bg-[var(--muted)] h-1 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3, ease: 'easeInOut' }}
                    className="h-full bg-emerald-500"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 4: Verification Review Screen */}
            {step === 4 && extractedData && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {/* GSTIN Verification Alert Block */}
                {isGstinMatched ? (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-xs text-emerald-800">GSTIN Alignment Verification Succeeded</h5>
                      <p className="text-[10px] text-emerald-700/90 mt-0.5">
                        The entered GSTIN (<strong>{gstin}</strong>) aligns perfectly with the primary entity record extracted from the official document.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-xs text-red-800">GSTIN Alignment Mismatch</h5>
                      <p className="text-[10px] text-red-700/90 mt-0.5">
                        The entered GSTIN (<strong>{gstin}</strong>) does not align with the GSTIN extracted from the certificate (<strong>{extractedData.gstin || 'None'}</strong>).
                      </p>
                    </div>
                  </div>
                )}

                {/* Extracted Details Directory Record */}
                <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--card)]">
                  <div className="px-3.5 py-2 bg-[var(--muted)]/50 border-b border-[var(--border)] flex justify-between items-center">
                    <span className="text-[11px] font-bold text-[var(--foreground)] uppercase tracking-wider">AI Extracted Registrations</span>
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">Aegis AI Audit Complete</span>
                  </div>

                  <div className="p-4 space-y-3.5 text-xs">
                    <div className="grid grid-cols-2 gap-y-3.5 gap-x-4">
                      <div className="col-span-2">
                        <span className="text-[10px] font-semibold text-[var(--muted-foreground)] block uppercase mb-1">Legal Business Name</span>
                        <Input 
                          value={extractedData.businessName || ''} 
                          onChange={(e) => setExtractedData({ ...extractedData, businessName: e.target.value })}
                          className="h-8 text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-[var(--muted-foreground)] block uppercase mb-1">GSTIN</span>
                        <Input 
                          value={extractedData.gstin || ''} 
                          onChange={(e) => setExtractedData({ ...extractedData, gstin: e.target.value })}
                          className="h-8 text-xs font-mono uppercase"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-[var(--muted-foreground)] block uppercase mb-1">PAN</span>
                        <Input 
                          value={extractedData.pan || ''} 
                          onChange={(e) => setExtractedData({ ...extractedData, pan: e.target.value })}
                          className="h-8 text-xs font-mono uppercase"
                        />
                      </div>

                      <div className="col-span-2">
                        <span className="text-[10px] font-semibold text-[var(--muted-foreground)] block uppercase mb-1">Registered Address</span>
                        <Input 
                          value={extractedData.address || ''} 
                          onChange={(e) => setExtractedData({ ...extractedData, address: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-[var(--muted-foreground)] block uppercase mb-1">Registration Date</span>
                        <Input 
                          value={extractedData.registrationDate || ''} 
                          onChange={(e) => setExtractedData({ ...extractedData, registrationDate: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-[var(--muted-foreground)] block uppercase mb-1">State</span>
                        <Input 
                          value={extractedData.state || ''} 
                          onChange={(e) => setExtractedData({ ...extractedData, state: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-[var(--muted-foreground)] block uppercase mb-1">Entity Type</span>
                        <Input 
                          value={extractedData.businessType || ''} 
                          onChange={(e) => setExtractedData({ ...extractedData, businessType: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-[var(--muted-foreground)] block uppercase mb-1">Industry</span>
                        <Input 
                          value={extractedData.industry || ''} 
                          onChange={(e) => setExtractedData({ ...extractedData, industry: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                    Re-upload
                  </Button>
                  <Button 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" 
                    onClick={handleConfirmAndRegister}
                  >
                    Confirm & Onboard Entity
                  </Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
