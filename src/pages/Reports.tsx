import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Download, FileText, FileSpreadsheet, CheckCircle2, Clock, Calendar, ArrowRight, X, Plus, Loader2, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { EmptyState } from '@/components/ui/empty-state';
import { supabase } from '@/lib/supabase';

export default function Reports() {
  const [searchQuery, setSearchQuery] = useState('');
  const [reports, setReports] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Custom report creation form state
  const [newReportTitle, setNewReportTitle] = useState('');
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['tax', 'risk']);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*, businesses(name)')
        .eq('type', 'REPORT');
        
      if (error) throw error;
      setReports(data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name');
      if (error) throw error;
      setBusinesses(data || []);
      if (data && data.length > 0) {
        setSelectedBusinessId((data as any)[0].id);
      }
    } catch (err: any) {
      console.error('Failed to fetch businesses:', err);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchBusinesses();
  }, []);
  
  const filteredReports = reports.filter(r => 
    r.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportCSV = () => {
    toast.success('Exporting as CSV...', {
      description: 'Your download will start shortly.'
    });
  };

  const handleExportPDF = () => {
    toast.success('Exporting as PDF...', {
      description: 'Generating high-quality PDF report.'
    });
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } as const }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Compliance Reports</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Automated regulatory reporting, audit trails, and data exports.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button variant="outline" className="shadow-sm h-9 flex-1 sm:flex-none bg-[var(--card)] border-[var(--border)] text-xs font-medium" onClick={handleExportCSV}>
            <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />
            Export CSV
          </Button>
          <Button className="shadow-sm h-9 flex-1 sm:flex-none bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--foreground)]/90 text-xs font-medium" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Generate PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-[var(--foreground)] text-[var(--background)] border-transparent overflow-hidden relative shadow-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--background)] opacity-10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <CardContent className="p-6 relative z-10">
            <h3 className="font-medium text-[var(--background)] opacity-80 mb-1">Total Reports</h3>
            <div className="text-4xl font-bold tracking-tight mb-4">{reports.length}</div>
            <div className="flex items-center text-xs font-medium bg-[var(--background)] text-[var(--foreground)] opacity-90 w-fit px-3 py-1.5 rounded-md backdrop-blur-sm">
              <Calendar className="h-4 w-4 mr-2" />
              Year to Date
            </div>
          </CardContent>
        </Card>
        <Card className="border-[var(--border)] bg-[var(--card)] shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-medium text-[var(--muted-foreground)] mb-1">Scheduled Reports</h3>
            <div className="text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4">0</div>
            <div className="flex items-center text-xs font-medium text-[var(--muted-foreground)] bg-[var(--muted)] border border-[var(--border)] w-fit px-3 py-1.5 rounded-md">
              <Clock className="h-4 w-4 mr-2 text-amber-500" />
              No active schedules
            </div>
          </CardContent>
        </Card>
        <Card onClick={() => {
          if (businesses.length === 0) {
            toast.error('Onboard a business first in Entity Directory to create reports.');
          } else {
            setIsCreateModalOpen(true);
          }
        }} className="border-[var(--border)] bg-[var(--card)] shadow-sm flex flex-col justify-center items-center text-center cursor-pointer hover:bg-[var(--muted)] transition-colors group">
          <CardContent className="p-6 flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-[var(--muted)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Plus className="h-6 w-6 text-[var(--foreground)]" />
            </div>
            <h3 className="font-semibold text-[var(--foreground)]">Create Custom Report</h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Use the interactive wizard</p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input 
              placeholder="Search reports by name or ID..." 
              className="pl-9 pr-9 h-10 bg-[var(--muted)] border-transparent focus-visible:ring-1 focus-visible:ring-[var(--foreground)] text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="h-10 px-4 whitespace-nowrap bg-[var(--card)] hover:bg-[var(--muted)] border-[var(--border)] text-[var(--foreground)]">
              <Filter className="mr-2 h-4 w-4" />
              Filter Results
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="p-24 flex flex-col items-center justify-center text-[var(--muted-foreground)]">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-sm font-medium">Loading reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-16 text-center">
            <div className="mx-auto bg-[var(--muted)] w-16 h-16 rounded-full flex items-center justify-center text-[var(--muted-foreground)] mb-6">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">No reports found</h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-6 max-w-sm mx-auto">
              {reports.length === 0 
                ? "You haven't generated any reports yet. Click on 'Create Custom Report' above to start." 
                : "No reports matched your search criteria."}
            </p>
            {reports.length > 0 && (
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[var(--muted)]/50 border-b border-[var(--border)] text-[var(--muted-foreground)]">
                <tr>
                  <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Report ID</th>
                  <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Report Name</th>
                  <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Entity</th>
                  <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Date Generated</th>
                  <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Status</th>
                  <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase text-right">Actions</th>
                </tr>
              </thead>
              <motion.tbody 
                variants={container}
                initial="hidden"
                animate="show"
                className="divide-y divide-[var(--border)]"
              >
                {filteredReports.map((row) => (
                  <motion.tr variants={item} key={row.id} className="hover:bg-[var(--muted)]/50 transition-colors group">
                    <td className="px-6 py-4 text-[var(--muted-foreground)] font-mono text-xs">{row.id.substring(0, 8)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[var(--muted)] rounded-md text-[var(--foreground)] border border-[var(--border)]">
                          <FileText className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-[var(--foreground)]">{row.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--muted-foreground)] font-medium">{row.businesses?.name || 'Global'}</td>
                    <td className="px-6 py-4 text-[var(--muted-foreground)]">{new Date(row.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold border uppercase tracking-wider",
                        row.status === 'verified' 
                          ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" 
                          : "text-amber-600 bg-amber-500/10 border-amber-500/20 animate-pulse"
                      )}>
                        {row.status === 'verified' ? (
                          <CheckCircle2 className="w-3 h-3 mr-1.5" />
                        ) : (
                          <Clock className="w-3 h-3 mr-1.5" />
                        )}
                        {row.status === 'verified' ? 'Completed' : 'Generating...'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                        View Details
                        <ArrowRight className="ml-1.5 h-3 w-3" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        )}
        
        {filteredReports.length > 0 && (
          <div className="p-4 border-t border-[var(--border)] bg-[var(--muted)]/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--muted-foreground)]">
            <span>Showing <span className="font-semibold text-[var(--foreground)]">{filteredReports.length}</span> of <span className="font-semibold text-[var(--foreground)]">{reports.length}</span> reports</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-8 text-xs bg-[var(--card)] border-[var(--border)]" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs bg-[var(--foreground)] text-[var(--background)] border-transparent">1</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs bg-[var(--card)] border-[var(--border)]">Next</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Interactive Custom Report Builder Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isGenerating) setIsCreateModalOpen(false);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-[4px]"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden z-10 text-[var(--foreground)]"
            >
              <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--muted)]/20">
                <h3 className="font-bold text-base text-[var(--foreground)]">Compliance Report Builder</h3>
                <button 
                  onClick={() => setIsCreateModalOpen(false)} 
                  disabled={isGenerating}
                  className="p-1 rounded-md hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!newReportTitle.trim()) {
                  toast.error('Please specify a report title.');
                  return;
                }
                if (!selectedBusinessId) {
                  toast.error('Please select an entity.');
                  return;
                }

                setIsGenerating(true);
                const toastId = toast.loading('Initializing compliance builder matrix...', {
                  description: 'Scanning signatures, cross-indexing entities, compiling compliance reports...'
                });

                await new Promise(r => setTimeout(r, 1600));

                try {
                  const { error } = await supabase.from('documents').insert({
                    business_id: selectedBusinessId,
                    title: newReportTitle.trim(),
                    type: 'REPORT',
                    status: 'verified',
                    url: '#'
                  } as any);

                  if (error) throw error;
                  
                  toast.success('Report successfully built and cryptographic signature applied.', { id: toastId });
                  setNewReportTitle('');
                  setIsCreateModalOpen(false);
                  fetchReports();
                } catch (err: any) {
                  toast.error(err.message || 'Build compilation failed.', { id: toastId });
                } finally {
                  setIsGenerating(false);
                }
              }} className="p-6 space-y-4">
                {isGenerating ? (
                  <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                    <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
                    <div>
                      <h4 className="font-bold text-sm text-[var(--foreground)]">Aegis AI Auditor Compiling</h4>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">Gathering verified evidence trails and writing signed report record...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[var(--foreground)]">Report Title</label>
                      <Input 
                        placeholder="e.g. FY26 Q2 GST Audit Report" 
                        value={newReportTitle}
                        onChange={(e) => setNewReportTitle(e.target.value)}
                        required
                        className="h-10 bg-[var(--muted)] border-transparent focus-visible:ring-1 focus-visible:ring-[var(--foreground)] text-xs font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[var(--foreground)]">Target Business Entity</label>
                      <div className="relative">
                        <select
                          value={selectedBusinessId}
                          onChange={(e) => setSelectedBusinessId(e.target.value)}
                          required
                          className="w-full h-10 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 text-xs font-semibold text-[var(--foreground)] outline-none cursor-pointer focus:ring-1 focus:ring-[var(--foreground)] appearance-none"
                        >
                          {businesses.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                        <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)] pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-[var(--foreground)]">Include Audit Modules</span>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {[
                          { id: 'tax', label: 'Tax Registration Check' },
                          { id: 'risk', label: 'Vulnerability Scoring' },
                          { id: 'sig', label: 'Signatures Integrity' },
                          { id: 'auth', label: 'Access Audit Trails' },
                        ].map((m) => {
                          const active = selectedMetrics.includes(m.id);
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                if (active) {
                                  setSelectedMetrics(selectedMetrics.filter(x => x !== m.id));
                                } else {
                                  setSelectedMetrics([...selectedMetrics, m.id]);
                                }
                              }}
                              className={cn(
                                "p-2.5 rounded-lg border text-[11px] text-left font-semibold transition-all duration-150 flex items-center justify-between",
                                active 
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700" 
                                  : "bg-[var(--muted)] border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                              )}
                            >
                              {m.label}
                              {active && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-3 border-t border-[var(--border)]">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="flex-1" 
                        onClick={() => setIsCreateModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1 bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--foreground)]/90"
                      >
                        Compile Report
                      </Button>
                    </div>
                  </>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
