import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Download, FileText, FileSpreadsheet, CheckCircle2, Clock, Calendar, ArrowRight, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { EmptyState } from '@/components/ui/empty-state';

export default function Reports() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const reports = [
    { id: 'REP-001', name: 'Q3 Enterprise Risk Audit', date: 'Oct 12, 2026', type: 'Risk Analysis', status: 'completed' },
    { id: 'REP-002', name: 'Vendor Compliance Summary', date: 'Oct 10, 2026', type: 'Compliance', status: 'generating' },
    { id: 'REP-003', name: 'Monthly Suspicious Activity', date: 'Oct 01, 2026', type: 'Security', status: 'completed' },
    { id: 'REP-004', name: 'Annual KYC Status', date: 'Sep 28, 2026', type: 'KYC', status: 'completed' },
  ];

  const filteredReports = reports.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.id.toLowerCase().includes(searchQuery.toLowerCase())
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
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111111]">Compliance Reports</h2>
          <p className="text-sm text-[#666666] mt-1">Automated regulatory reporting, audit trails, and data exports.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button variant="outline" className="shadow-sm h-10 flex-1 sm:flex-none bg-white" onClick={handleExportCSV}>
            <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />
            Export CSV
          </Button>
          <Button variant="royal" className="shadow-sm h-10 flex-1 sm:flex-none" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Generate PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-royal-900 to-royal-950 text-white border-transparent overflow-hidden relative shadow-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <CardContent className="p-6 relative z-10">
            <h3 className="font-medium text-royal-200 mb-1">Total Reports</h3>
            <div className="text-4xl font-bold tracking-tight mb-4">124</div>
            <div className="flex items-center text-sm text-royal-200 bg-white/10 w-fit px-3 py-1.5 rounded-md backdrop-blur-sm">
              <Calendar className="h-4 w-4 mr-2" />
              Year to Date
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#eaeaea] shadow-sm bg-white">
          <CardContent className="p-6">
            <h3 className="font-medium text-[#666666] mb-1">Scheduled Reports</h3>
            <div className="text-4xl font-bold tracking-tight text-[#111111] mb-4">8</div>
            <div className="flex items-center text-sm text-[#666666] bg-[#fafafa] border border-[#eaeaea] w-fit px-3 py-1.5 rounded-md">
              <Clock className="h-4 w-4 mr-2 text-amber-500" />
              Next: Tomorrow, 09:00 AM
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#eaeaea] shadow-sm bg-white flex flex-col justify-center items-center text-center cursor-pointer hover:bg-[#fafafa] transition-colors group">
          <CardContent className="p-6">
            <div className="h-12 w-12 rounded-full bg-royal-50 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Plus className="h-6 w-6 text-royal-600" />
            </div>
            <h3 className="font-semibold text-[#111111]">Create Custom Report</h3>
            <p className="text-xs text-[#888888] mt-1">Use the drag-and-drop builder</p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-[#eaeaea] shadow-sm">
        <div className="p-4 border-b border-[#eaeaea] bg-white flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888888]" />
            <Input 
              placeholder="Search reports by name or ID..." 
              className="pl-9 pr-9 h-10 bg-[#fafafa] border-[#eaeaea] focus-visible:ring-royal-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#111111]"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="h-10 px-4 whitespace-nowrap bg-[#fafafa] hover:bg-[#f0f0f0]">
              <Filter className="mr-2 h-4 w-4" />
              Filter Results
            </Button>
          </div>
        </div>
        
        {filteredReports.length === 0 ? (
          <EmptyState 
            icon={FileText}
            title="No reports found"
            description="We couldn't find any reports matching your search criteria. Try adjusting your filters or search term."
            actionLabel="Clear Search"
            onAction={() => setSearchQuery('')}
            className="border-0 rounded-none m-4"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#fafafa] border-b border-[#eaeaea] text-[#666666]">
                <tr>
                  <th className="px-6 py-4 font-medium">Report ID</th>
                  <th className="px-6 py-4 font-medium">Report Name</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Date Generated</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <motion.tbody 
                variants={container}
                initial="hidden"
                animate="show"
                className="divide-y divide-[#eaeaea] bg-white"
              >
                {filteredReports.map((row) => (
                  <motion.tr variants={item} key={row.id} className="hover:bg-[#fafafa]/80 transition-colors group">
                    <td className="px-6 py-4 text-[#888888] font-mono text-xs">{row.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#f5f5f5] rounded-md text-[#666666]">
                          <FileText className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-[#111111]">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#666666]">{row.type}</td>
                    <td className="px-6 py-4 text-[#666666]">{row.date}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold border uppercase tracking-wider",
                        row.status === 'completed' 
                          ? "text-emerald-700 bg-emerald-50 border-emerald-200" 
                          : "text-amber-700 bg-amber-50 border-amber-200 animate-pulse"
                      )}>
                        {row.status === 'completed' ? (
                          <CheckCircle2 className="w-3 h-3 mr-1.5" />
                        ) : (
                          <Clock className="w-3 h-3 mr-1.5" />
                        )}
                        {row.status === 'completed' ? 'Completed' : 'Generating...'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="text-[#666666] hover:text-[#111111] opacity-0 group-hover:opacity-100 transition-opacity font-medium">
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
          <div className="p-4 border-t border-[#eaeaea] bg-[#fafafa] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#666666]">
            <span>Showing <span className="font-medium text-[#111111]">{filteredReports.length}</span> of <span className="font-medium text-[#111111]">{reports.length}</span> reports</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-8 text-xs bg-white" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs bg-white bg-royal-50 text-royal-700 border-royal-200">1</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs bg-white">Next</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
