import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, AlertTriangle, Clock, CheckCircle2, MoreVertical, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { EmptyState } from '@/components/ui/empty-state';

export default function Alerts() {
  const [activeTab, setActiveTab] = useState('open');
  const [alerts, setAlerts] = useState([
    { id: '1', title: 'Critical KYC Missing', entity: 'Vanguard Holdings', time: '10 mins ago', type: 'urgent', status: 'open' },
    { id: '2', title: 'Suspicious Transaction Pattern', entity: 'Entity A', time: '2 hours ago', type: 'warning', status: 'open' },
    { id: '3', title: 'Business License Expired', entity: 'Global Tech', time: '5 hours ago', type: 'warning', status: 'open' },
    { id: '4', title: 'Multiple Failed Logins', entity: 'Admin User', time: '1 day ago', type: 'urgent', status: 'resolved' },
    { id: '5', title: 'Unusual Geographical Access', entity: 'Acme Corp', time: '1 day ago', type: 'warning', status: 'resolved' },
  ]);

  const handleResolve = (id: string) => {
    toast.success('Alert marked as resolved', {
      description: 'The security log has been updated.',
    });
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
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
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111111]">Security Alerts</h2>
          <p className="text-sm text-[#666666] mt-1">Real-time monitoring and policy violation alerts.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button variant="outline" className="shadow-sm h-10 flex-1 sm:flex-none bg-white" onClick={handleMarkAllRead}>
            Mark All as Read
          </Button>
          <Button variant="royal" className="shadow-sm h-10 flex-1 sm:flex-none">
            <Filter className="mr-2 h-4 w-4" />
            Filter Rules
          </Button>
        </div>
      </div>

      <div className="flex gap-6 border-b border-[#eaeaea]">
        <button 
          onClick={() => setActiveTab('open')}
          className={cn(
            "pb-3 font-semibold text-sm transition-colors relative",
            activeTab === 'open' ? "text-[#111111]" : "text-[#888888] hover:text-[#111111]"
          )}
        >
          Action Required ({alerts.filter(a => a.status === 'open').length})
          {activeTab === 'open' && (
            <motion.div layoutId="alertTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#111111]" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab('resolved')}
          className={cn(
            "pb-3 font-semibold text-sm transition-colors relative",
            activeTab === 'resolved' ? "text-[#111111]" : "text-[#888888] hover:text-[#111111]"
          )}
        >
          Resolved Incidents ({alerts.filter(a => a.status === 'resolved').length})
          {activeTab === 'resolved' && (
            <motion.div layoutId="alertTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#111111]" />
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
          {filteredAlerts.length === 0 ? (
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
                  "border-[#eaeaea] shadow-sm transition-all overflow-hidden group",
                  alert.status === 'resolved' ? "bg-[#fafafa]" : "hover:border-royal-200 bg-white"
                )}>
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center p-5 gap-5 relative">
                      {alert.status === 'open' && alert.type === 'urgent' && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                      )}
                      
                      <div className={cn(
                        "p-3 rounded-xl flex-shrink-0",
                        alert.status === 'resolved' ? "bg-emerald-50 text-emerald-600" :
                        alert.type === 'urgent' ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
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
                            alert.status === 'resolved' ? "text-[#666666] line-through decoration-[#cccccc]" : "text-[#111111]"
                          )}>{alert.title}</h3>
                          <span className="text-xs font-medium text-[#888888] flex items-center bg-[#f5f5f5] px-2 py-1 rounded-md w-fit">
                            <Clock className="mr-1.5 h-3 w-3" />
                            {alert.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#666666]">Affected Entity:</span>
                          <span className="text-sm font-semibold text-[#111111] bg-[#fafafa] border border-[#eaeaea] px-2 py-0.5 rounded">{alert.entity}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-4 sm:mt-0 w-full sm:w-auto">
                        {alert.status === 'open' ? (
                          <>
                            <Button variant="outline" size="sm" className="h-9 flex-1 sm:flex-none bg-white">
                              Details
                            </Button>
                            <Button variant="default" size="sm" className="h-9 flex-1 sm:flex-none bg-[#111111] hover:bg-[#222222]" onClick={() => handleResolve(alert.id)}>
                              Resolve
                            </Button>
                          </>
                        ) : (
                          <Button variant="ghost" size="sm" className="text-[#666666] hover:text-[#111111]">
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
