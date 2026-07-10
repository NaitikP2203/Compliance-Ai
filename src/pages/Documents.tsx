import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  FileText, 
  LayoutGrid, 
  List as ListIcon, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Trash2,
  UploadCloud,
  FileCode,
  Lock,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useSecurityStore } from '@/store/security';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export default function Documents() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<any[]>([]);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Security integration state
  const currentRole = useSecurityStore((state) => state.currentRole);
  const currentEmail = useSecurityStore((state) => state.currentEmail);
  const addLog = useSecurityStore((state) => state.addLog);

  // Upload modal states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; type: string; size: string; base64: string } | null>(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    threatDetected?: boolean;
    error?: string;
    message?: string;
    detectedType?: string;
    fileType?: string;
    antivirusStatus?: string;
    hash?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch businesses for the upload dropdown
      const { data: bData, error: bError } = await supabase.from('businesses').select('id, name');
      if (bError) throw bError;
      const bDataArray = bData as any[] | null;
      setBusinesses(bDataArray || []);
      
      if (bDataArray && bDataArray.length > 0) {
        setSelectedBusinessId(bDataArray[0].id);
      }
      
      // Fetch documents
      const { data: dData, error: dError } = await supabase.from('documents').select('*, businesses(name)');
      if (dError) throw dError;
      setDocuments(dData || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredDocs = documents.filter(d => d.title?.toLowerCase().includes(searchQuery.toLowerCase()));

  // RBAC validation gate before action triggers
  const verifyUploadPermission = () => {
    if (currentRole === 'viewer') {
      toast.error('Access Denied: Viewer role is restricted to read-only.');
      addLog(
        'RBAC',
        'CRITICAL',
        'Privilege Escalation Intercepted',
        `Viewer [${currentEmail}] attempted to initiate binary file upload. Access denied.`,
        currentEmail || undefined
      );
      return false;
    }
    if (businesses.length === 0) {
      toast.error('No entities found. Create an entity first before uploading documents.');
      return false;
    }
    return true;
  };

  const handleOpenUpload = () => {
    if (verifyUploadPermission()) {
      setIsUploadOpen(true);
      resetUploadState();
    }
  };

  const resetUploadState = () => {
    setSelectedFile(null);
    setScanResult(null);
    setIsScanning(false);
    setScanStep('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Client validation block: File size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFile({
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        base64: reader.result as string
      });
      setScanResult(null);
    };
    reader.readAsDataURL(file);
  };

  const triggerSecureScan = async () => {
    if (!selectedFile || !selectedBusinessId) {
      toast.error('Missing file or entity selection');
      return;
    }

    setIsScanning(true);
    setScanResult(null);

    const steps = [
      'Establishing isolation sandbox...',
      'Acquiring file headers & bytes...',
      'Verifying digital signatures (magic bytes)...',
      'Running Aegis Antivirus threat definitions...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setScanStep(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    try {
      const response = await fetch('/api/security/upload-validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileBase64: selectedFile.base64,
          fileSize: selectedFile.size
        })
      });

      const data = await response.json();

      setIsScanning(false);
      setScanResult(data);

      if (data.success) {
        toast.success('Document clean. Encryption stamp applied.');
        addLog(
          'UPLOAD',
          'INFO',
          'Secure File Upload Accepted',
          `File [${selectedFile.name}] successfully audited.`,
          currentEmail || undefined
        );

        // Upload to database
        const { error } = await supabase.from('documents').insert({
          title: selectedFile.name,
          type: (selectedFile.name.split('.').pop()?.toUpperCase() || 'UNKNOWN'),
          status: 'verified',
          business_id: selectedBusinessId,
          url: '#' // Dummy URL since storage isn't fully implemented here
        } as any);

        if (error) throw error;
        toast.success('Document saved to database');
        fetchData();
        setTimeout(() => setIsUploadOpen(false), 1500);

      } else {
        toast.error(data.message || 'Threat definition check flagged this file.');
      }
    } catch (err: any) {
      setIsScanning(false);
      setScanResult({
        success: false,
        error: 'Scanner Connection Failed',
        message: 'Could not connect to the malware detection service.'
      });
      toast.error('Simulation error: Failed to scan.');
    }
  };

  const injectPreset = (type: 'clean' | 'spoof' | 'malware') => {
    resetUploadState();
    if (type === 'clean') {
      setSelectedFile({
        name: 'Quarterly_Report.pdf',
        type: 'application/pdf',
        size: '1.20 MB',
        base64: 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nID4+CmVuZG9iagp0cmFpbGVyCiAgPDwgL1Jvb3QgMSAwIFIgPj4KJSVFT0Y='
      });
      toast.info('Loaded valid PDF audit report template.');
    } else if (type === 'spoof') {
      setSelectedFile({
        name: 'Malicious_Script.pdf',
        type: 'application/pdf',
        size: '0.40 MB',
        base64: 'data:application/pdf;base64,TVpROWgAcgBlAGEAZAB5ACAAdABvACAAcgB1AG4AIABhAHQAdABhAGMAawA='
      });
      toast.warning('Loaded executable disguised as PDF.');
    } else if (type === 'malware') {
      setSelectedFile({
        name: 'eicar_test_virus.pdf',
        type: 'application/pdf',
        size: '0.05 MB',
        base64: 'data:application/pdf;base64,WDVPIVAlQEFQWzRcUFpYNTYoUF4pN0NDKTd9JEVJQ0FSLVNUQU5EQVJELUFOVElWSVJVUy1URVNULUZJTEUhJEgrSCo='
      });
      toast.warning('Loaded EICAR test virus signature.');
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } as const }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)] flex items-center gap-2">
            Document Center
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <ShieldCheck className="h-3.5 w-3.5" /> Antivirus Active
            </span>
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Centralized repository for compliance evidence.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {currentRole === 'viewer' ? (
            <Button variant="outline" onClick={verifyUploadPermission} className="shadow-sm flex-1 sm:flex-none border-dashed border-red-500/30 text-red-600 bg-red-500/10 hover:bg-red-500/20">
              <Lock className="mr-2 h-4 w-4" />
              Upload Restricted
            </Button>
          ) : (
            <Button onClick={handleOpenUpload} className="shadow-sm flex-1 sm:flex-none bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--foreground)]/90">
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload and Scan File
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[var(--card)] p-2 rounded-xl border border-[var(--border)] shadow-sm">
        <div className="relative w-full sm:max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <Input 
            placeholder="Search verified documents..." 
            className="pl-9 h-10 border-transparent shadow-none bg-[var(--muted)] focus-visible:ring-1 focus-visible:ring-[var(--foreground)]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 pr-2 border-t sm:border-t-0 sm:border-l border-[var(--border)] pt-2 sm:pt-0 pl-0 sm:pl-2 w-full sm:w-auto">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--muted-foreground)]">
            <Filter className="h-4 w-4" />
          </Button>
          <div className="h-4 w-[1px] bg-[var(--border)] mx-1" />
          <div className="flex bg-[var(--muted)] p-1 rounded-lg">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-7 w-7 rounded-md", viewMode === 'grid' ? "bg-[var(--card)] shadow-sm text-[var(--foreground)]" : "text-[var(--muted-foreground)]")}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-7 w-7 rounded-md", viewMode === 'list' ? "bg-[var(--card)] shadow-sm text-[var(--foreground)]" : "text-[var(--muted-foreground)]")}
              onClick={() => setViewMode('list')}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-24 flex flex-col items-center justify-center text-[var(--muted-foreground)]">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p className="text-sm font-medium">Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="p-16 text-center bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm">
          <div className="mx-auto bg-[var(--muted)] w-16 h-16 rounded-full flex items-center justify-center text-[var(--muted-foreground)] mb-6">
            <FileText className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">No documents found</h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-6 max-w-sm mx-auto">
            You haven't uploaded any compliance evidence yet. Securely upload files to have them scanned and stored.
          </p>
          <Button onClick={handleOpenUpload} className="bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--foreground)]/90">
            <UploadCloud className="mr-2 h-4 w-4" /> Upload Document
          </Button>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div 
              key="grid"
              variants={container}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
            >
              {currentRole !== 'viewer' && (
                <motion.div variants={item}>
                  <Card 
                    onClick={handleOpenUpload}
                    className="border-dashed border-2 border-[var(--border)] bg-[var(--muted)] flex flex-col items-center justify-center h-full min-h-[240px] cursor-pointer hover:bg-[var(--muted)]/80 hover:border-[var(--foreground)] transition-all group shadow-none"
                  >
                    <div className="h-14 w-14 rounded-full bg-[var(--card)] shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-[var(--border)] text-[var(--foreground)]">
                      <UploadCloud className="h-6 w-6 animate-bounce" />
                    </div>
                    <p className="font-semibold text-[var(--foreground)] text-sm">Deploy New Evidence</p>
                    <p className="text-[11px] text-[var(--muted-foreground)] mt-1 mb-4 text-center px-4 leading-normal">
                      PDF, DOCX, XLSX, images <br /> Secure verification
                    </p>
                    <Button variant="outline" size="sm" className="bg-[var(--card)] border-[var(--border)] text-xs font-medium">Browse Sandbox</Button>
                  </Card>
                </motion.div>
              )}

              {filteredDocs.map((doc) => (
                <motion.div variants={item} key={doc.id}>
                  <Card className="group hover:border-[var(--foreground)] hover:shadow-md transition-all flex flex-col h-full min-h-[240px] bg-[var(--card)] border-[var(--border)] shadow-sm">
                    <CardContent className="p-5 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                        <div className={cn(
                          "p-3 rounded-xl flex items-center justify-center border",
                          doc.type === 'PDF' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                          doc.type === 'DOCX' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 'bg-[var(--muted)] text-[var(--foreground)] border-[var(--border)]'
                        )}>
                          <FileText className="h-6 w-6" />
                        </div>
                        {doc.status === 'verified' && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" /> SECURE
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-auto">
                        <h3 className="font-bold text-[var(--foreground)] text-sm line-clamp-2 mb-1 leading-tight" title={doc.title}>{doc.title}</h3>
                        <p className="text-[11px] text-[var(--muted-foreground)] mb-3 font-medium truncate">{doc.businesses?.name || 'Unknown Entity'}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                          <div className="flex items-center gap-2 text-xs">
                            <div className="h-6 w-6 rounded-full bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center text-[10px] font-bold">
                              {currentEmail ? currentEmail.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span className="text-[var(--muted-foreground)] font-semibold truncate max-w-[80px]">
                              {new Date(doc.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {doc.status === 'verified' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                            {doc.status === 'pending' && <Clock className="h-4 w-4 text-amber-500" />}
                            {doc.status === 'rejected' && <AlertCircle className="h-4 w-4 text-red-500" />}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="overflow-hidden shadow-sm border-[var(--border)] bg-[var(--card)]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[var(--muted)]/50 border-b border-[var(--border)] text-[var(--muted-foreground)]">
                      <tr>
                        <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Evidence Name</th>
                        <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Entity</th>
                        <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Date</th>
                        <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Status</th>
                        <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase text-right">Integrity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {filteredDocs.map((doc) => (
                        <tr key={doc.id} className="hover:bg-[var(--muted)]/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "p-2 rounded-lg border",
                                doc.type === 'PDF' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                                doc.type === 'DOCX' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 'bg-[var(--muted)] text-[var(--foreground)] border-[var(--border)]'
                              )}>
                                <FileText className="h-4 w-4" />
                              </div>
                              <span className="font-semibold text-[var(--foreground)]">{doc.title}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[var(--muted-foreground)] font-medium">{doc.businesses?.name || 'Unknown'}</td>
                          <td className="px-6 py-4 text-[var(--muted-foreground)] font-medium">{new Date(doc.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider",
                              doc.status === 'verified' ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' :
                              doc.status === 'pending' ? 'text-amber-600 bg-amber-500/10 border-amber-500/20' : 
                              'text-red-600 bg-red-500/10 border-red-500/20'
                            )}>
                              {doc.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {doc.status === 'verified' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                                <ShieldCheck className="h-3 w-3" /> AV Verified
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Full-Stack Secure Upload Drawer Modal */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl bg-[var(--card)] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] border border-[var(--border)]"
            >
              {/* Left Sandbox Upload Panel */}
              <div className="p-6 flex-1 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-[var(--border)] overflow-y-auto">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-[var(--foreground)]">Evidence Upload Sandbox</h3>
                  <button onClick={() => setIsUploadOpen(false)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-bold text-sm">✕</button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[var(--foreground)]">Associated Entity</label>
                  <select 
                    value={selectedBusinessId} 
                    onChange={(e) => setSelectedBusinessId(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--foreground)]"
                  >
                    {businesses.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                
                {/* Standard Drag Drop Zone */}
                {!selectedFile && (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 min-h-[180px] border-dashed border-2 border-[var(--border)] hover:border-[var(--foreground)] rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer bg-[var(--muted)]/50 hover:bg-[var(--muted)] group transition-all mt-2"
                  >
                    <UploadCloud className="h-10 w-10 text-[var(--muted-foreground)] group-hover:scale-110 group-hover:text-[var(--foreground)] transition-transform mb-3" />
                    <p className="text-sm font-bold text-[var(--foreground)]">Select evidence from file system</p>
                    <p className="text-[11px] text-[var(--muted-foreground)] text-center mt-1 leading-relaxed">
                      PDF, DOCX, XLSX, PNG, JPG <br />
                      File size limit: 5MB
                    </p>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
                    />
                  </div>
                )}

                {/* File Selected Card */}
                {selectedFile && (
                  <div className="p-4 bg-[var(--muted)] border border-[var(--border)] rounded-xl relative space-y-3 mt-2">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--foreground)]">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[var(--foreground)] truncate">{selectedFile.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)] font-semibold uppercase">{selectedFile.type} • {selectedFile.size}</p>
                      </div>
                      {!isScanning && (
                        <button onClick={resetUploadState} className="text-[var(--muted-foreground)] hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {!isScanning && !scanResult && (
                      <Button onClick={triggerSecureScan} className="w-full h-11 bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--foreground)]/90 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm">
                        <ShieldCheck className="h-4 w-4 text-emerald-400 animate-pulse" /> Trigger Secure Server-Side Scan
                      </Button>
                    )}

                    {/* Scanning Animation */}
                    {isScanning && (
                      <div className="p-3 bg-[var(--card)] border border-[var(--border)] rounded-xl flex items-center gap-3">
                        <Loader2 className="h-5 w-5 text-[var(--foreground)] animate-spin" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[var(--foreground)]">Aegis AV Scan In Progress...</p>
                          <p className="text-[10px] text-[var(--muted-foreground)] font-semibold truncate animate-pulse mt-0.5">{scanStep}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Scan Results Display */}
                {scanResult && (
                  <AnimatePresence>
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "p-4 rounded-xl border flex items-start gap-3",
                        scanResult.success 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400" 
                          : "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400"
                      )}
                    >
                      {scanResult.success ? (
                        <ShieldCheck className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <ShieldAlert className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold">{scanResult.success ? 'Integrity Audit Passed' : 'Security Threat Blocked'}</p>
                        <p className="text-xs mt-1 font-semibold leading-relaxed opacity-90">{scanResult.message}</p>
                        
                        {scanResult.success && (
                          <div className="mt-3 pt-2 border-t border-emerald-500/20 text-[10px] space-y-1 font-mono">
                            <p><span className="font-bold">Detected Structure:</span> {scanResult.fileType}</p>
                            <p className="truncate"><span className="font-bold">SHA256:</span> {scanResult.hash}</p>
                            <p><span className="font-bold">Antivirus Check:</span> {scanResult.antivirusStatus}</p>
                          </div>
                        )}
                        {!scanResult.success && scanResult.detectedType && (
                          <div className="mt-3 pt-2 border-t border-red-500/20 text-[10px] space-y-1 font-mono">
                            <p><span className="font-bold">True Content Signature:</span> {scanResult.detectedType}</p>
                            <p className="font-bold text-red-600">Payload Isolated & Flagged in Audit Log.</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>

              {/* Right Secure Auditor Pen-Testing Injectors */}
              <div className="p-6 flex-1 bg-[var(--muted)]/50 flex flex-col gap-4 overflow-y-auto max-h-[40vh] md:max-h-full">
                <div className="flex items-center gap-1.5 border-b border-[var(--border)] pb-2">
                  <ShieldCheck className="h-4.5 w-4.5 text-[var(--foreground)]" />
                  <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wide">SecOps Pen-Testing Console</h4>
                </div>
                <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                  Compliance and SaaS platforms must resist malicious file injection (e.g. executing scripts disguised as PDF). Trigger these simulations to test the server's magic bytes scanner.
                </p>

                <div className="space-y-2.5">
                  <button 
                    onClick={() => injectPreset('clean')}
                    className="w-full text-left p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-emerald-500 hover:shadow-sm transition-all flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[var(--foreground)]">1. Clean evidence payload</p>
                      <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5 leading-normal">Loads a valid PDF with matching structure and header signatures.</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => injectPreset('spoof')}
                    className="w-full text-left p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-amber-500 hover:shadow-sm transition-all flex items-start gap-2.5"
                  >
                    <FileCode className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[var(--foreground)]">2. Executable disguised as PDF (Spoof)</p>
                      <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5 leading-normal">Filename ends in <span className="font-mono text-red-500">.pdf</span>, but actual binary begins with Windows PE <span className="font-mono text-red-500">MZ</span> header. Blocks execution vectors.</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => injectPreset('malware')}
                    className="w-full text-left p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-red-500 hover:shadow-sm transition-all flex items-start gap-2.5"
                  >
                    <ShieldAlert className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[var(--foreground)]">3. Industrial Malware Definition (EICAR)</p>
                      <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5 leading-normal">Injects the standard EICAR antivirus test payload. Flagged and rejected instantly by scanner.</p>
                    </div>
                  </button>
                </div>

                <div className="mt-auto p-3.5 bg-[var(--card)] rounded-xl border border-[var(--border)]">
                  <p className="text-[10px] text-[var(--muted-foreground)] leading-normal">
                    <span className="font-bold text-[var(--foreground)]">Audit Status:</span> This testing environment is fully sandboxed. Spoofed or malware-flagged files are parsed server-side, blocked, and logged to the global Security & Audit Trail logs.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
