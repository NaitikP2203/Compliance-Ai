import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, AlertTriangle, Clock, CheckCircle2, Search, Filter, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { EmptyState } from '@/components/ui/empty-state';
import { supabase } from '@/lib/supabase';

export default function Alerts() {
  const [activeTab, setActiveTab] = useState('open');
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      // Fetch documents that have issues (pending or rejected)
      const { data, error } = await supabase
        .from('documents')
        .select('*, businesses(name)')
        .in('status', ['pending', 'rejected'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform into alert format
      const transformedAlerts = ((data as any[]) || []).map((doc: any) => ({
        id: doc.id,
        title: doc.status === 'rejected' ? 'Security Audit Failed' : 'Document Pending Verification',
        entity: doc.businesses?.name || 'Global',
        time: new Date(doc.created_at).toLocaleDateString(),
        type: doc.status === 'rejected' ? 'urgent' : 'warning',
        status: 'open',
        doc_id: doc.id
      }));

      setAlerts(transformedAlerts);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleResolve = async (id: string, docId: string) => {
    try {
      // Optimistic update
      setAlerts(alerts.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
      
      const { error } = await (supabase
        .from('documents') as any)
        .update({ status: 'verified' })
        .eq('id', docId);

      if (error) throw error;

      toast.success('Alert resolved', {
        description: 'Document has been manually verified.',
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to resolve alert');
      fetchAlerts(); // rollback
    }
  };

  const handleMarkAllRead = () => {
    toast.success('All alerts marked as read');
  };

  const filteredAlerts = alerts.filter(a => a.status === activeTab);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } as const },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Security Alerts</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Real-time monitoring and policy violation alerts.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button variant="outline" className="shadow-sm h-9 flex-1 sm:flex-none bg-[var(--card)] border-[var(--border)] text-xs font-medium" onClick={handleMarkAllRead}>
            Mark All as Read
          </Button>
          <Button className="shadow-sm h-9 flex-1 sm:flex-none bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--foreground)]/90 text-xs font-medium">
            <Filter className="mr-2 h-4 w-4" />
            Filter Rules
          </Button>
        </div>
      </div>

      <div className="flex gap-6 border-b border-[var(--border)]">
        <button 
          onClick={() => setActiveTab('open')}
          className={cn(
            "pb-3 font-semibold text-sm transition-colors relative",
            activeTab === 'open' ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          )}
        >
          Action Required ({alerts.filter(a => a.status === 'open').length})
          {activeTab === 'open' && (
            <motion.div layoutId="alertTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--foreground)]" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab('resolved')}
          className={cn(
            "pb-3 font-semibold text-sm transition-colors relative",
            activeTab === 'resolved' ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          )}
        >
          Resolved Incidents ({alerts.filter(a => a.status === 'resolved').length})
          {activeTab === 'resolved' && (
            <motion.div layoutId="alertTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--foreground)]" />
          )}
        </button>
      </div>

      <motion.div 
        variants={container} 
        initial="hidden" 
        animate="show" 
        className="space-y-4"
      >
        <AnimatePresence mode="popLayout">
          {loading ? (
            <motion.div variants={item} initial="hidden" animate="show" exit="exit" className="p-24 flex flex-col items-center justify-center text-[var(--muted-foreground)]">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p className="text-sm font-medium">Loading alerts...</p>
            </motion.div>
          ) : filteredAlerts.length === 0 ? (
            <motion.div variants={item} initial="hidden" animate="show" exit="exit">
              <EmptyState 
                icon={CheckCircle2}
                title="All clear"
                description={activeTab === 'open' ? "There are no pending alerts requiring your attention." : "No resolved alerts found."}
                className="my-8"
              />
            </motion.div>
          ) : (
            filteredAlerts.map((alert) => (
              <motion.div variants={item} key={alert.id} layoutId={`alert-${alert.id}`}>
                <Card className={cn(
                  "border-[var(--border)] shadow-sm transition-all overflow-hidden group",
                  alert.status === 'resolved' ? "bg-[var(--muted)]/50" : "hover:border-[var(--foreground)] bg-[var(--card)]"
                )}>
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center p-5 gap-5 relative">
                      {alert.status === 'open' && alert.type === 'urgent' && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                      )}
                      
                      <div className={cn(
                        "p-3 rounded-xl flex-shrink-0 border",
                        alert.status === 'resolved' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                        alert.type === 'urgent' ? "bg-red-500/10 text-red-600 border-red-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      )}>
                        {alert.status === 'resolved' ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : alert.type === 'urgent' ? (
                          <ShieldAlert className="h-6 w-6" />
                        ) : (
                          <AlertTriangle className="h-6 w-6" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                          <h3 className={cn(
                            "font-bold text-[15px]",
                            alert.status === 'resolved' ? "text-[var(--muted-foreground)] line-through decoration-[var(--border)]" : "text-[var(--foreground)]"
                          )}>{alert.title}</h3>
                          <span className="text-xs font-medium text-[var(--muted-foreground)] flex items-center bg-[var(--muted)] border border-[var(--border)] px-2 py-1 rounded-md w-fit">
                            <Clock className="mr-1.5 h-3 w-3" />
                            {alert.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[var(--muted-foreground)]">Affected Entity:</span>
                          <span className="text-sm font-semibold text-[var(--foreground)] bg-[var(--muted)] border border-[var(--border)] px-2 py-0.5 rounded">{alert.entity}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-4 sm:mt-0 w-full sm:w-auto">
                        {alert.status === 'open' ? (
                          <>
                            <Button variant="outline" size="sm" className="h-9 flex-1 sm:flex-none bg-[var(--card)] border-[var(--border)] text-xs font-medium">
                              Details
                            </Button>
                            <Button variant="default" size="sm" className="h-9 flex-1 sm:flex-none bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--foreground)]/90 text-xs font-medium" onClick={() => handleResolve(alert.id, alert.doc_id)}>
                              Resolve
                            </Button>
                          </>
                        ) : (
                          <Button variant="ghost" size="sm" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-xs font-medium">
                            View Audit Log
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
