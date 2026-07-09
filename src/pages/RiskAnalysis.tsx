import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, ShieldAlert, TrendingUp, AlertTriangle, ArrowRight, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RiskAnalysis() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } as const }
  };

  const trendData = [
    { name: 'Week 1', value: 45 },
    { name: 'Week 2', value: 52 },
    { name: 'Week 3', value: 38 },
    { name: 'Week 4', value: 65 },
    { name: 'Week 5', value: 48 },
    { name: 'Week 6', value: 55 },
    { name: 'Week 7', value: 42 },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#111111]">Risk Analysis</h2>
        <p className="text-sm text-[#666666] mt-1">AI-driven risk scoring, behavioral analysis, and threat detection.</p>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-6 md:grid-cols-3">
        <motion.div variants={item}>
          <Card className="bg-[#0f172a] text-white border-transparent overflow-hidden relative shadow-lg h-full">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/5 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
            <CardContent className="p-6 relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-400">Platform Risk Score</p>
                  <p className="text-5xl font-bold tracking-tight">A+</p>
                </div>
                <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm">
                  <ShieldAlert className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-white/10">
                <div className="flex items-center text-sm">
                  <ArrowUpRight className="h-4 w-4 text-emerald-400 mr-1" />
                  <span className="text-emerald-400 font-medium mr-2">Top 5%</span>
                  <span className="text-slate-400">percentile in industry</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-[#eaeaea] shadow-sm h-full flex flex-col">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[#666666]">Active Threats Detected</p>
                  <p className="text-4xl font-bold tracking-tight text-[#111111]">12</p>
                </div>
                <div className="p-2.5 bg-red-50 rounded-xl border border-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-[#eaeaea]">
                <div className="flex items-center text-sm">
                  <ArrowDownRight className="h-4 w-4 text-emerald-600 mr-1" />
                  <span className="text-emerald-600 font-medium mr-2">14% down</span>
                  <span className="text-[#666666]">from previous period</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-[#eaeaea] shadow-sm h-full flex flex-col">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[#666666]">Avg Resolution Time</p>
                  <p className="text-4xl font-bold tracking-tight text-[#111111]">4.2<span className="text-2xl text-[#888888] ml-1">h</span></p>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-[#eaeaea]">
                <div className="flex items-center text-sm">
                  <ArrowDownRight className="h-4 w-4 text-emerald-600 mr-1" />
                  <span className="text-emerald-600 font-medium mr-2">1.1h faster</span>
                  <span className="text-[#666666]">than 30-day average</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-6 md:grid-cols-2">
        <motion.div variants={item}>
          <Card className="border-[#eaeaea] shadow-sm h-full">
            <CardHeader className="border-b border-[#eaeaea] bg-[#fafafa]/50 pb-4">
              <CardTitle>Risk Event Frequency</CardTitle>
              <CardDescription>Volume of potential risk triggers over the last 7 weeks.</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px] p-6 pt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888888', fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888888', fontWeight: 500 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                    cursor={{ stroke: '#eaeaea', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-[#eaeaea] shadow-sm h-full">
            <CardHeader className="border-b border-[#eaeaea] bg-[#fafafa]/50 pb-4">
              <CardTitle>Top Risk Factors</CardTitle>
              <CardDescription>Primary drivers of elevated risk profiles across the platform.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {[
                  { name: 'Missing Compliance Documentation', value: 45, color: 'bg-red-500', desc: 'Entities failing to provide required KYC/AML docs' },
                  { name: 'Outdated Policies', value: 30, color: 'bg-orange-500', desc: 'Internal policies exceeding 12-month review cycle' },
                  { name: 'Suspicious Transaction Patterns', value: 15, color: 'bg-amber-500', desc: 'Anomalous financial movements triggering thresholds' },
                  { name: 'Unauthorized Access Attempts', value: 10, color: 'bg-slate-800', desc: 'Failed authentications from restricted geolocations' },
                ].map((item, i) => (
                  <div key={item.name} className="group">
                    <div className="flex justify-between items-start text-sm mb-2">
                      <div>
                        <span className="font-semibold text-[#111111] group-hover:text-royal-700 transition-colors">{item.name}</span>
                        <p className="text-xs text-[#888888] mt-0.5">{item.desc}</p>
                      </div>
                      <span className="text-[#111111] font-bold bg-[#fafafa] px-2 py-1 rounded-md border border-[#eaeaea]">{item.value}%</span>
                    </div>
                    <div className="h-2 w-full bg-[#f5f5f5] rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 1, delay: 0.1 * i, ease: "easeOut" }}
                        className={`h-full ${item.color} rounded-full`} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
