import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  Filter, 
  FileText, 
  Download, 
  MoreVertical, 
  UploadCloud, 
  LayoutGrid, 
  List as ListIcon, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Trash2,
  FileCode,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Document } from '@/types';
import { useSecurityStore } from '@/store/security';
import { toast } from 'sonner';

const INITIAL_DOCS: Document[] = [
  { id: '1', name: 'Q3 Financial Audit.pdf', type: 'PDF', size: '2.4 MB', date: 'Oct 12, 2026', author: 'Jane Doe', status: 'verified' },
  { id: '2', name: 'Corporate Bylaws.docx', type: 'DOCX', size: '1.1 MB', date: 'Oct 10, 2026', author: 'Admin User', status: 'pending' },
  { id: '3', name: 'Vendor Agreement - TechCorp.pdf', type: 'PDF', size: '3.8 MB', date: 'Oct 08, 2026', author: 'Jane Doe', status: 'verified' },
  { id: '4', name: 'Compliance Policy 2026.pdf', type: 'PDF', size: '4.2 MB', date: 'Oct 01, 2026', author: 'Admin User', status: 'verified' },
  { id: '5', name: 'Risk Assessment matrix.xlsx', type: 'XLSX', size: '840 KB', date: 'Sep 28, 2026', author: 'Jane Doe', status: 'rejected' },
];

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>(INITIAL_DOCS);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Security integration state
  const currentRole = useSecurityStore((state) => state.currentRole);
  const currentEmail = useSecurityStore((state) => state.currentEmail);
  const isFileScanEnabled = useSecurityStore((state) => state.isFileScanEnabled);
  const addLog = useSecurityStore((state) => state.addLog);

  // Upload modal states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; type: string; size: string; base64: string } | null>(null);
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

  const filteredDocs = documents.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // RBAC validation gate before action triggers
  const verifyUploadPermission = () => {
    if (currentRole === 'viewer') {
      toast.error('Access Denied: Viewer role is restricted to read-only. Action logged.');
      addLog(
        'RBAC',
        'CRITICAL',
        'Privilege Escalation Intercepted',
        `Viewer [${currentEmail}] attempted to initiate binary file upload. Access denied.`,
        currentEmail || undefined
      );
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

  // Convert uploaded file to base64 for parametric backend verification
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Client validation block: File size exceeds 5MB limit.');
      addLog(
        'UPLOAD',
        'WARNING',
        'Large Upload Attempt Blocked',
        `Client block: [${file.name}] size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 5MB limit.`
      );
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

  // Triggers secure scan (MIME signature verification + AV inspection)
  const triggerSecureScan = async () => {
    if (!selectedFile) return;

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
          `File [${selectedFile.name}] (${selectedFile.size}) successfully audited. Integrity Hash: ${data.hash?.substring(0, 15)}...`,
          currentEmail || undefined
        );

        // Add to document table locally
        const newDoc: Document = {
          id: String(Date.now()),
          name: selectedFile.name,
          type: (selectedFile.name.split('.').pop()?.toUpperCase() || 'UNKNOWN') as any,
          size: selectedFile.size,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          author: currentEmail ? currentEmail.split('@')[0].toUpperCase() : 'AUDITOR',
          status: 'verified'
        };
        setDocuments(prev => [newDoc, ...prev]);
      } else {
        toast.error(data.message || 'Threat definition check flagged this file.');
        addLog(
          'UPLOAD',
          'CRITICAL',
          'Malicious Upload Blocked',
          `THREAT IDENTIFIED: [${selectedFile.name}]. Reason: ${data.message || data.error}. Ext: ${selectedFile.name.split('.').pop()}`,
          currentEmail || undefined
        );
      }
    } catch (err: any) {
      setIsScanning(false);
      setScanResult({
        success: false,
        error: 'Scanner Connection Failed',
        message: 'Could not connect to the Aegis server-side malware detection service.'
      });
      addLog('SYSTEM', 'CRITICAL', 'Antivirus Link Interrupted', `Scanner timeout on file [${selectedFile.name}]`);
    }
  };

  // Secure Audit Pen-Test Injectors
  const injectPreset = (type: 'clean' | 'spoof' | 'malware') => {
    resetUploadState();
    if (type === 'clean') {
      setSelectedFile({
        name: 'Quarterly_Report.pdf',
        type: 'application/pdf',
        size: '1.20 MB',
        // Valid Base64 with standard PDF magic bytes (%PDF-1.4)
        base64: 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nID4+CmVuZG9iagp0cmFpbGVyCiAgPDwgL1Jvb3QgMSAwIFIgPj4KJSVFT0Y='
      });
      toast.info('Loaded valid PDF audit report template.');
    } else if (type === 'spoof') {
      setSelectedFile({
        name: 'Malicious_Script.pdf',
        type: 'application/pdf',
        size: '0.40 MB',
        // Masquerading payload (Has PE executable signature MZ header disguised as PDF)
        base64: 'data:application/pdf;base64,TVpROWgAcgBlAGEAZAB5ACAAdABvACAAcgB1AG4AIABhAHQAdABhAGMAawA='
      });
      toast.warning('Loaded executable disguised as PDF (MIME signature spoof attack).');
    } else if (type === 'malware') {
      setSelectedFile({
        name: 'eicar_test_virus.pdf',
        type: 'application/pdf',
        size: '0.05 MB',
        // EICAR standard antivirus test string in base64
        base64: 'data:application/pdf;base64,WDVPIVAlQEFQWzRcUFpYNTYoUF4pN0NDKTd9JEVJQ0FSLVNUQU5EQVJELUFOVElWSVJVUy1URVNULUZJTEUhJEgrSCo='
      });
      toast.warning('Loaded EICAR industrial antivirus test virus signature.');
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
    <div className="space-y-6 max-w-[1400px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111111] flex items-center gap-2">
            Document Center
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5" /> Antivirus Active
            </span>
          </h2>
          <p className="text-sm text-[#666666] mt-1">Centralized repository for compliance evidence, protected by server-side binary inspectors.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {currentRole === 'viewer' ? (
            <Button variant="outline" onClick={verifyUploadPermission} className="shadow-sm flex-1 sm:flex-none border-dashed border-red-200 text-red-700 bg-red-50 hover:bg-red-100">
              <Lock className="mr-2 h-4 w-4 text-red-600" />
              Upload Restricted (Viewer)
            </Button>
          ) : (
            <Button onClick={handleOpenUpload} className="shadow-sm flex-1 sm:flex-none bg-[#111111] hover:bg-[#222222] text-white">
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload and Scan File
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-2 rounded-xl border border-[#eaeaea] shadow-sm">
        <div className="relative w-full sm:max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888888]" />
          <Input 
            placeholder="Search verified documents..." 
            className="pl-9 h-10 border-none shadow-none focus-visible:ring-0 bg-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 pr-2 border-t sm:border-t-0 sm:border-l border-[#eaeaea] pt-2 sm:pt-0 pl-0 sm:pl-2 w-full sm:w-auto">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#666666]">
            <Filter className="h-4 w-4" />
          </Button>
          <div className="h-4 w-[1px] bg-[#eaeaea] mx-1" />
          <div className="flex bg-[#f5f5f5] p-1 rounded-lg">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-7 w-7 rounded-md", viewMode === 'grid' ? "bg-white shadow-sm text-[#111111]" : "text-[#888888]")}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-7 w-7 rounded-md", viewMode === 'list' ? "bg-white shadow-sm text-[#111111]" : "text-[#888888]")}
              onClick={() => setViewMode('list')}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Grid view of documents */}
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
            {/* Custom drag/drop prompt tile */}
            {currentRole !== 'viewer' && (
              <motion.div variants={item}>
                <Card 
                  onClick={handleOpenUpload}
                  className="border-dashed border-2 border-[#cccccc] bg-[#fafafa] flex flex-col items-center justify-center h-full min-h-[240px] cursor-pointer hover:bg-slate-50 hover:border-[#111111] transition-all group shadow-sm"
                >
                  <div className="h-14 w-14 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-[#eaeaea]">
                    <UploadCloud className="h-6 w-6 text-slate-800 animate-bounce" />
                  </div>
                  <p className="font-semibold text-[#111111] text-sm">Deploy New Evidence</p>
                  <p className="text-[11px] text-[#888888] mt-1 mb-4 text-center px-4 leading-normal">
                    PDF, DOCX, XLSX, images <br /> Secure verification (Max 5MB)
                  </p>
                  <Button variant="outline" size="sm" className="bg-white border-[#eaeaea]">Browse Sandbox</Button>
                </Card>
              </motion.div>
            )}

            {filteredDocs.map((doc) => (
              <motion.div variants={item} key={doc.id}>
                <Card className="group hover:border-[#111111] hover:shadow-md transition-all flex flex-col h-full min-h-[240px] bg-white border-[#eaeaea]">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className={cn(
                        "p-3 rounded-xl flex items-center justify-center shadow-sm border",
                        doc.type === 'PDF' ? 'bg-red-50 text-red-600 border-red-100' :
                        doc.type === 'DOCX' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      )}>
                        <FileText className="h-6 w-6" />
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> SECURE
                      </span>
                    </div>
                    
                    <div className="mt-auto">
                      <h3 className="font-bold text-[#111111] text-sm line-clamp-2 mb-1 leading-tight" title={doc.name}>{doc.name}</h3>
                      <div className="flex items-center text-[10px] font-bold text-[#888888] mb-4 uppercase tracking-wider">
                        <span>{doc.type}</span>
                        <span className="mx-1.5">•</span>
                        <span>{doc.size}</span>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-[#eaeaea]">
                        <div className="flex items-center gap-2 text-xs">
                          <div className="h-6 w-6 rounded-full bg-[#111111] text-white flex items-center justify-center text-[10px] font-bold">
                            {doc.author.charAt(0)}
                          </div>
                          <span className="text-[#666666] font-semibold">{doc.author.split(' ')[0]}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {doc.status === 'verified' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Audited
                            </span>
                          )}
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
            <Card className="overflow-hidden shadow-sm border-[#eaeaea]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#fafafa] border-b border-[#eaeaea] text-[#666666]">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Evidence Name</th>
                      <th className="px-6 py-4 font-semibold">Size</th>
                      <th className="px-6 py-4 font-semibold">Audit Stamp</th>
                      <th className="px-6 py-4 font-semibold">Uploader</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Integrity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eaeaea] bg-white">
                    {filteredDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-[#fafafa]/80 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-lg border",
                              doc.type === 'PDF' ? 'bg-red-50 text-red-600 border-red-100' :
                              doc.type === 'DOCX' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            )}>
                              <FileText className="h-4 w-4" />
                            </div>
                            <span className="font-semibold text-[#111111]">{doc.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#666666] font-medium">{doc.size}</td>
                        <td className="px-6 py-4 text-[#666666] font-medium">{doc.date}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-[#111111] text-white flex items-center justify-center text-[10px] font-bold">
                              {doc.author.charAt(0)}
                            </div>
                            <span className="text-[#666666] font-medium">{doc.author}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider",
                            doc.status === 'verified' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                            doc.status === 'pending' ? 'text-amber-700 bg-amber-50 border-amber-200' : 
                            'text-red-700 bg-red-50 border-red-200'
                          )}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50/50 px-2.5 py-0.5 rounded border border-emerald-100">
                            <ShieldCheck className="h-3 w-3" /> AV Verified
                          </span>
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

      {/* Full-Stack Secure Upload Drawer Modal */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden border border-[#eaeaea] shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Left Sandbox Upload Panel */}
              <div className="p-6 flex-1 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-[#eaeaea] overflow-y-auto">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-[#111111]">Evidence Upload Sandbox</h3>
                  <button onClick={() => setIsUploadOpen(false)} className="text-slate-400 hover:text-slate-800 font-bold text-sm">✕</button>
                </div>
                
                {/* Standard Drag Drop Zone */}
                {!selectedFile && (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 min-h-[180px] border-dashed border-2 border-[#cccccc] hover:border-[#111111] rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer bg-[#fafafa] hover:bg-slate-50/60 group transition-all"
                  >
                    <UploadCloud className="h-10 w-10 text-slate-400 group-hover:scale-110 group-hover:text-slate-800 transition-transform mb-3" />
                    <p className="text-sm font-bold text-[#111111]">Select evidence from file system</p>
                    <p className="text-[11px] text-slate-400 text-center mt-1 leading-relaxed">
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
                  <div className="p-4 bg-slate-50 border border-[#eaeaea] rounded-xl relative space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-white border rounded-lg text-[#111111]">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#111111] truncate">{selectedFile.name}</p>
                        <p className="text-xs text-[#888888] font-semibold uppercase">{selectedFile.type} • {selectedFile.size}</p>
                      </div>
                      {!isScanning && (
                        <button onClick={resetUploadState} className="text-slate-400 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {!isScanning && !scanResult && (
                      <Button onClick={triggerSecureScan} className="w-full h-11 bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-emerald-400 animate-pulse" /> Trigger Secure Server-Side Scan
                      </Button>
                    )}

                    {/* Scanning Animation */}
                    {isScanning && (
                      <div className="p-3 bg-white border border-[#eaeaea] rounded-xl flex items-center gap-3">
                        <Loader2 className="h-5 w-5 text-slate-800 animate-spin" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800">Aegis AV Scan In Progress...</p>
                          <p className="text-[10px] text-slate-400 font-semibold truncate animate-pulse mt-0.5">{scanStep}</p>
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
                          ? "bg-emerald-50 border-emerald-200 text-emerald-900" 
                          : "bg-red-50 border-red-200 text-red-950"
                      )}
                    >
                      {scanResult.success ? (
                        <ShieldCheck className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <ShieldAlert className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold">{scanResult.success ? 'Integrity Audit Passed' : 'Security Threat Blocked'}</p>
                        <p className="text-xs mt-1 font-semibold leading-relaxed opacity-90">{scanResult.message}</p>
                        
                        {scanResult.success && (
                          <div className="mt-3 pt-2 border-t border-emerald-200/50 text-[10px] space-y-1 font-mono">
                            <p><span className="font-bold">Detected Structure:</span> {scanResult.fileType}</p>
                            <p className="truncate"><span className="font-bold">SHA256:</span> {scanResult.hash}</p>
                            <p><span className="font-bold">Antivirus Check:</span> {scanResult.antivirusStatus}</p>
                          </div>
                        )}
                        {!scanResult.success && scanResult.detectedType && (
                          <div className="mt-3 pt-2 border-t border-red-200/50 text-[10px] space-y-1 font-mono">
                            <p><span className="font-bold">True Content Signature:</span> {scanResult.detectedType}</p>
                            <p className="font-bold text-red-800">Payload Isolated & Flagged in Audit Log.</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>

              {/* Right Secure Auditor Pen-Testing Injectors */}
              <div className="p-6 flex-1 bg-slate-50 flex flex-col gap-4 overflow-y-auto max-h-[40vh] md:max-h-full">
                <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <ShieldCheck className="h-4.5 w-4.5 text-slate-800" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">SecOps Pen-Testing Console</h4>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Compliance and SaaS platforms must resist malicious file injection (e.g. executing scripts disguised as PDF). Trigger these simulations to test the server's magic bytes scanner.
                </p>

                <div className="space-y-2.5">
                  <button 
                    onClick={() => injectPreset('clean')}
                    className="w-full text-left p-3 rounded-xl bg-white border hover:border-emerald-500 hover:shadow-sm transition-all flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">1. Clean evidence payload</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">Loads a valid PDF with matching structure and header signatures.</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => injectPreset('spoof')}
                    className="w-full text-left p-3 rounded-xl bg-white border hover:border-amber-500 hover:shadow-sm transition-all flex items-start gap-2.5"
                  >
                    <FileCode className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">2. Executable disguised as PDF (Spoof)</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">Filename ends in <span className="font-mono text-red-600">.pdf</span>, but actual binary begins with Windows PE <span className="font-mono text-red-600">MZ</span> header. Blocks execution vectors.</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => injectPreset('malware')}
                    className="w-full text-left p-3 rounded-xl bg-white border hover:border-red-500 hover:shadow-sm transition-all flex items-start gap-2.5"
                  >
                    <ShieldAlert className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">3. Industrial Malware Definition (EICAR)</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">Injects the standard EICAR antivirus test payload. Flagged and rejected instantly by scanner.</p>
                    </div>
                  </button>
                </div>

                <div className="mt-auto p-3.5 bg-slate-100 rounded-xl border border-slate-200">
                  <p className="text-[10px] text-slate-500 leading-normal">
                    <span className="font-bold text-slate-700">Audit Status:</span> This testing environment is fully sandboxed. Spoofed or malware-flagged files are parsed server-side, blocked, and logged to the global Security & Audit Trail logs.
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
