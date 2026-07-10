import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Filter, MoreHorizontal, ArrowUpDown, CheckCircle2, Clock, AlertCircle, Building2, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { EmptyState } from '@/components/ui/empty-state';
import { supabase } from '@/lib/supabase';
import { AddBusinessModal } from '@/components/AddBusinessModal';

export default function Businesses() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('businesses').select('*');
      if (error) throw error;
      setBusinesses(data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch businesses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const validateGSTIN = (gstin: string) => {
    if (!gstin) return false;
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
  };

  const handleAdd = () => {
    setIsModalOpen(true);
  };

  const filteredBusinesses = businesses.filter(b => 
    b.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.gstin?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Entity Directory</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Manage registered entities and monitor compliance status.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="shadow-sm h-9 border-[var(--border)] text-xs font-medium">
            Export Data
          </Button>
          <Button id="add-business-button" className="shadow-sm h-9 bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--foreground)]/90 text-xs font-medium" onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Business
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input 
              placeholder="Search by entity name or GSTIN..." 
              className="pl-9 h-10 bg-[var(--muted)] border-transparent focus-visible:ring-1 focus-visible:ring-[var(--foreground)]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="h-10 px-4 whitespace-nowrap bg-[var(--card)] hover:bg-[var(--muted)] border-[var(--border)]">
              <Filter className="mr-2 h-4 w-4" />
              All Statuses
              <ChevronDown className="ml-2 h-3 w-3 text-[var(--muted-foreground)]" />
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="p-24 flex flex-col items-center justify-center text-[var(--muted-foreground)]">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-sm font-medium">Loading entities...</p>
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <div className="p-16 text-center">
            <div className="mx-auto bg-[var(--muted)] w-16 h-16 rounded-full flex items-center justify-center text-[var(--muted-foreground)] mb-6">
              <Building2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">No entities found</h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-6 max-w-sm mx-auto">
              {businesses.length === 0 
                ? "You haven't added any entities to the directory yet." 
                : "No entities matched your search criteria."}
            </p>
            {businesses.length > 0 && (
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
                  <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Entity Name</th>
                  <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Identifier (GSTIN)</th>
                  <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Industry</th>
                  <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Health Score</th>
                  <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Risk Level</th>
                  <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase text-right">Actions</th>
                </tr>
              </thead>
              <motion.tbody 
                variants={container}
                initial="hidden"
                animate="show"
                className="divide-y divide-[var(--border)]"
              >
                {filteredBusinesses.map((row) => {
                  const complianceScore = 100 - (row.risk_score || 0);
                  return (
                    <motion.tr variants={item} key={row.id} className="hover:bg-[var(--muted)]/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded bg-[var(--muted)] flex items-center justify-center text-[var(--foreground)] font-semibold border border-[var(--border)] text-xs">
                            {row.name ? row.name.substring(0, 2).toUpperCase() : 'EN'}
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--foreground)]">{row.name}</p>
                            <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">ID: {row.id.substring(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-[var(--muted-foreground)]">
                        <div className="flex items-center gap-2">
                          {row.gstin || 'N/A'}
                          {validateGSTIN(row.gstin) ? (
                            <span className="flex items-center justify-center h-4 w-4 rounded-full bg-emerald-500/10 text-emerald-600">
                              <CheckCircle2 className="h-3 w-3" />
                            </span>
                          ) : row.gstin ? (
                            <span className="flex items-center justify-center h-4 w-4 rounded-full bg-red-500/10 text-red-600">
                              <AlertCircle className="h-3 w-3" />
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[var(--muted-foreground)]">{row.industry || 'Unknown'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 w-16 bg-[var(--muted)] rounded-full overflow-hidden">
                            <div 
                              className={cn("h-full rounded-full", 
                                complianceScore >= 90 ? "bg-emerald-500" :
                                complianceScore >= 70 ? "bg-amber-500" : "bg-red-500"
                              )} 
                              style={{ width: `${complianceScore}%` }} 
                            />
                          </div>
                          <span className="text-xs font-semibold text-[var(--foreground)]">{complianceScore}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "font-semibold text-xs flex items-center gap-1.5",
                          row.risk_score < 40 ? 'text-emerald-600' :
                          row.risk_score < 80 ? 'text-amber-600' : 'text-red-600'
                        )}>
                          <div className={cn(
                            "h-2 w-2 rounded-full",
                            row.risk_score < 40 ? 'bg-emerald-500' :
                            row.risk_score < 80 ? 'bg-amber-500' : 'bg-red-500'
                          )} />
                          {row.risk_score < 40 ? 'Minimal' : row.risk_score < 80 ? 'Elevated' : 'Critical'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--muted-foreground)] hover:text-[var(--foreground)] opacity-0 group-hover:opacity-100 transition-opacity">
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
          <div className="p-4 border-t border-[var(--border)] bg-[var(--muted)]/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--muted-foreground)]">
            <span>Showing <span className="font-semibold text-[var(--foreground)]">{filteredBusinesses.length}</span> of <span className="font-semibold text-[var(--foreground)]">{businesses.length}</span> entities</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-8 text-xs bg-[var(--card)] border-[var(--border)]" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs bg-[var(--foreground)] text-[var(--background)] border-transparent">1</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs bg-[var(--card)] border-[var(--border)]">Next</Button>
            </div>
          </div>
        )}
      </Card>

      <AddBusinessModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchBusinesses} 
      />
    </div>
  );
}

