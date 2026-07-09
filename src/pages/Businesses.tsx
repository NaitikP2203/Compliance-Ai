import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Filter, MoreHorizontal, ArrowUpDown, CheckCircle2, Clock, AlertCircle, Building2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { EmptyState } from '@/components/ui/empty-state';
import { Business } from '@/types';

const INITIAL_BUSINESSES: Business[] = [
  { id: '1', name: 'Acme Corp', gstin: '22AAAAA0000A1Z5', status: 'compliant', risk: 'Low', industry: 'Financial Services', complianceScore: 98, lastUpdated: 'Today' },
  { id: '2', name: 'Global Tech', gstin: '27AABCV1234F1Z0', status: 'review', risk: 'Medium', industry: 'Technology', complianceScore: 75, lastUpdated: 'Yesterday' },
  { id: '3', name: 'Vanguard Holdings', gstin: '29ABCDE1234F2Z5', status: 'action_required', risk: 'High', industry: 'Real Estate', complianceScore: 42, lastUpdated: '2 days ago' },
  { id: '4', name: 'Apex Innovations', gstin: 'INVALID_GSTIN', status: 'compliant', risk: 'Low', industry: 'Healthcare', complianceScore: 91, lastUpdated: 'Last week' },
  { id: '5', name: 'Stark Industries', gstin: '24AAAAA0000A1Z5', status: 'review', risk: 'Critical', industry: 'Defense', complianceScore: 28, lastUpdated: '1 month ago' },
];

export default function Businesses() {
  const [businesses, setBusinesses] = useState<Business[]>(INITIAL_BUSINESSES);
  const [searchQuery, setSearchQuery] = useState('');

  const validateGSTIN = (gstin: string) => {
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
  };

  const handleAdd = () => {
    toast.success('Business creation workflow initialized');
  };

  const filteredBusinesses = businesses.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.gstin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'compliant':
        return { label: 'Compliant', icon: CheckCircle2, className: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      case 'review':
        return { label: 'Under Review', icon: Clock, className: 'text-amber-700 bg-amber-50 border-amber-200' };
      case 'action_required':
        return { label: 'Action Required', icon: AlertCircle, className: 'text-red-700 bg-red-50 border-red-200' };
      default:
        return { label: 'Unknown', icon: Clock, className: 'text-gray-700 bg-gray-50 border-gray-200' };
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
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } as const }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111111]">Entity Directory</h2>
          <p className="text-sm text-[#666666] mt-1">Manage registered entities, monitor compliance status, and perform due diligence.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="shadow-sm h-10">
            Export Data
          </Button>
          <Button variant="royal" className="shadow-sm h-10" onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Entity
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-[#eaeaea] shadow-sm">
        <div className="p-4 border-b border-[#eaeaea] bg-white flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888888]" />
            <Input 
              placeholder="Search by entity name or GSTIN..." 
              className="pl-9 h-10 bg-[#fafafa] border-[#eaeaea] focus-visible:ring-royal-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="h-10 px-4 whitespace-nowrap bg-[#fafafa] hover:bg-[#f0f0f0]">
              <Filter className="mr-2 h-4 w-4" />
              All Statuses
              <ChevronDown className="ml-2 h-3 w-3 text-[#888888]" />
            </Button>
          </div>
        </div>
        
        {filteredBusinesses.length === 0 ? (
          <EmptyState 
            icon={Building2}
            title="No entities found"
            description="We couldn't find any entities matching your search criteria. Try adjusting your filters or search term."
            actionLabel="Clear Search"
            onAction={() => setSearchQuery('')}
            className="border-0 rounded-none m-4"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#fafafa] border-b border-[#eaeaea] text-[#666666]">
                <tr>
                  <th className="px-6 py-4 font-medium cursor-pointer hover:text-[#111111] transition-colors">
                    <div className="flex items-center gap-2">Entity Name <ArrowUpDown className="h-3 w-3" /></div>
                  </th>
                  <th className="px-6 py-4 font-medium">Identifier (GSTIN)</th>
                  <th className="px-6 py-4 font-medium">Industry</th>
                  <th className="px-6 py-4 font-medium">Health Score</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium cursor-pointer hover:text-[#111111] transition-colors">
                    <div className="flex items-center gap-2">Risk Level <ArrowUpDown className="h-3 w-3" /></div>
                  </th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <motion.tbody 
                variants={container}
                initial="hidden"
                animate="show"
                className="divide-y divide-[#eaeaea] bg-white"
              >
                {filteredBusinesses.map((row) => {
                  const status = getStatusConfig(row.status);
                  return (
                    <motion.tr variants={item} key={row.id} className="hover:bg-[#fafafa]/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-royal-50 flex items-center justify-center text-royal-700 font-semibold border border-royal-100">
                            {row.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-[#111111]">{row.name}</p>
                            <p className="text-[11px] text-[#888888] mt-0.5">Updated {row.lastUpdated}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-[#666666]">
                        <div className="flex items-center gap-2">
                          {row.gstin}
                          {validateGSTIN(row.gstin) ? (
                            <span className="flex items-center justify-center h-4 w-4 rounded-full bg-emerald-100 text-emerald-600" title="Valid Format">
                              <CheckCircle2 className="h-3 w-3" />
                            </span>
                          ) : (
                            <span className="flex items-center justify-center h-4 w-4 rounded-full bg-red-100 text-red-600" title="Invalid Format">
                              <AlertCircle className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#666666]">{row.industry}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 w-16 bg-[#eaeaea] rounded-full overflow-hidden">
                            <div 
                              className={cn("h-full rounded-full", 
                                (row.complianceScore || 0) >= 90 ? "bg-emerald-500" :
                                (row.complianceScore || 0) >= 70 ? "bg-amber-500" : "bg-red-500"
                              )} 
                              style={{ width: `${row.complianceScore}%` }} 
                            />
                          </div>
                          <span className="text-xs font-medium text-[#444444]">{row.complianceScore}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold border uppercase tracking-wider",
                          status.className
                        )}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "font-medium text-sm flex items-center gap-1.5",
                          row.risk === 'Low' ? 'text-emerald-600' :
                          row.risk === 'Medium' ? 'text-amber-600' : 
                          row.risk === 'High' ? 'text-orange-600' : 'text-red-600'
                        )}>
                          <div className={cn(
                            "h-2 w-2 rounded-full",
                            row.risk === 'Low' ? 'bg-emerald-500' :
                            row.risk === 'Medium' ? 'bg-amber-500' : 
                            row.risk === 'High' ? 'bg-orange-500' : 'bg-red-500'
                          )} />
                          {row.risk}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#888888] hover:text-[#111111] opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </table>
          </div>
        )}
        
        {filteredBusinesses.length > 0 && (
          <div className="p-4 border-t border-[#eaeaea] bg-[#fafafa] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#666666]">
            <span>Showing <span className="font-medium text-[#111111]">{filteredBusinesses.length}</span> of <span className="font-medium text-[#111111]">{businesses.length}</span> entities</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-8 text-xs bg-white" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs bg-white bg-royal-50 text-royal-700 border-royal-200">1</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs bg-white">2</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs bg-white">3</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs bg-white">Next</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

