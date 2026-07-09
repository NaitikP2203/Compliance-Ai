import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'motion/react';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7m');

  const complianceData = [
    { name: 'Jan', value: 85, score: 92 },
    { name: 'Feb', value: 88, score: 93 },
    { name: 'Mar', value: 87, score: 91 },
    { name: 'Apr', value: 92, score: 95 },
    { name: 'May', value: 95, score: 96 },
    { name: 'Jun', value: 94, score: 96 },
    { name: 'Jul', value: 98, score: 99 },
  ];

  const riskData = [
    { name: 'Low Risk', value: 820, color: '#10b981' },
    { name: 'Medium Risk', value: 340, color: '#f59e0b' },
    { name: 'High Risk', value: 88, color: '#f97316' },
    { name: 'Critical Risk', value: 12, color: '#ef4444' },
  ];

  const regionData = [
    { name: 'North', entities: 420 },
    { name: 'South', entities: 380 },
    { name: 'East', entities: 210 },
    { name: 'West', entities: 560 },
    { name: 'Central', entities: 310 },
  ];

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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-[#eaeaea] shadow-lg rounded-xl p-3 flex flex-col gap-1 min-w-[120px]">
          <p className="text-[#888888] text-xs font-medium uppercase tracking-wider">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="text-[#111111] font-semibold text-sm">{entry.name}</span>
              <span className="text-royal-700 font-bold" style={{ color: entry.color }}>{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111111]">Analytics & Reporting</h2>
          <p className="text-sm text-[#666666] mt-1">Deep dive into your enterprise compliance metrics and geographic distribution.</p>
        </div>
        <div className="w-full sm:w-[180px]">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-full h-10 px-3 bg-white border border-[#eaeaea] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-royal-500 text-sm"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="3m">Last 3 Months</option>
            <option value="7m">Last 7 Months</option>
            <option value="1y">Last Year</option>
          </select>
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2"
      >
        <motion.div variants={item} className="md:col-span-2">
          <Card className="border-[#eaeaea] shadow-sm overflow-hidden">
            <CardHeader className="border-b border-[#eaeaea] bg-[#fafafa]/50 pb-4">
              <CardTitle>Compliance Score Trend</CardTitle>
              <CardDescription>Overall network compliance score mapped over the selected timeframe.</CardDescription>
            </CardHeader>
            <CardContent className="h-[380px] w-full p-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={complianceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f172a" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748b" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888888', fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888888', fontWeight: 500 }} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#eaeaea', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="score" name="Target Score" stroke="#64748b" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorValue)" />
                  <Area type="monotone" dataKey="value" name="Actual Score" stroke="#0f172a" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-[#eaeaea] shadow-sm h-full flex flex-col">
            <CardHeader className="border-b border-[#eaeaea] bg-[#fafafa]/50 pb-4">
              <CardTitle>Risk Distribution</CardTitle>
              <CardDescription>Current snapshot of entities categorized by risk profile.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[300px] w-full p-6 flex flex-col items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={6}
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-[#111111]">1,260</span>
                <span className="text-xs text-[#888888] font-medium uppercase tracking-wider">Total Entities</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-[#eaeaea] shadow-sm h-full flex flex-col">
            <CardHeader className="border-b border-[#eaeaea] bg-[#fafafa]/50 pb-4">
              <CardTitle>Entities by Region</CardTitle>
              <CardDescription>Geographic distribution of your registered network.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[300px] w-full p-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888888', fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888888', fontWeight: 500 }} />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ fill: '#f8f8f8', radius: 4 }}
                  />
                  <Bar dataKey="entities" name="Entities" fill="#0f172a" radius={[4, 4, 0, 0]}>
                    {regionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 3 ? '#0f172a' : '#94a3b8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
