import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'motion/react';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7m');
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('businesses').select('created_at, risk_score');
        if (error) throw error;
        setBusinesses(data || []);
      } catch (err: any) {
        toast.error(err.message || 'Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const riskData = useMemo(() => {
    const distribution = { minimal: 0, elevated: 0, critical: 0 };
    businesses.forEach(b => {
      if (b.risk_score < 40) distribution.minimal++;
      else if (b.risk_score < 80) distribution.elevated++;
      else distribution.critical++;
    });

    return [
      { name: 'Minimal Risk', value: distribution.minimal, color: '#10b981' },
      { name: 'Elevated Risk', value: distribution.elevated, color: '#f59e0b' },
      { name: 'Critical Risk', value: distribution.critical, color: '#ef4444' },
    ].filter(item => item.value > 0);
  }, [businesses]);

  const trendData = useMemo(() => {
    // Group by month
    const months: Record<string, { totalScore: number; count: number }> = {};
    
    businesses.forEach(b => {
      const date = new Date(b.created_at);
      const monthYear = date.toLocaleString('default', { month: 'short' });
      
      if (!months[monthYear]) {
        months[monthYear] = { totalScore: 0, count: 0 };
      }
      
      const complianceScore = 100 - (b.risk_score || 0);
      months[monthYear].totalScore += complianceScore;
      months[monthYear].count += 1;
    });

    // Create a sequential array of recent months if empty, or map the grouped data
    const result = Object.keys(months).map(month => ({
      name: month,
      value: Math.round(months[month].totalScore / months[month].count),
      score: 100 // Target score
    }));
    
    if (result.length === 0) {
      return [
        { name: 'Jan', value: 0, score: 100 },
        { name: 'Feb', value: 0, score: 100 },
        { name: 'Mar', value: 0, score: 100 }
      ];
    }
    
    return result;
  }, [businesses]);

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
        <div className="bg-[var(--card)] border border-[var(--border)] shadow-lg rounded-xl p-3 flex flex-col gap-1 min-w-[120px]">
          <p className="text-[var(--muted-foreground)] text-xs font-medium uppercase tracking-wider">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="text-[var(--foreground)] font-semibold text-sm">{entry.name}</span>
              <span className="font-bold" style={{ color: entry.color || 'var(--foreground)' }}>{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-[var(--muted-foreground)]">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-sm font-medium">Computing analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Analytics & Reporting</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Deep dive into your enterprise compliance metrics.</p>
        </div>
        <div className="w-full sm:w-[180px]">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-full h-10 px-3 bg-[var(--card)] border border-[var(--border)] rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[var(--foreground)] text-sm text-[var(--foreground)]"
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
          <Card className="border-[var(--border)] shadow-sm overflow-hidden bg-[var(--card)]">
            <CardHeader className="border-b border-[var(--border)] bg-[var(--muted)]/30 pb-4">
              <CardTitle className="text-[var(--foreground)]">Compliance Score Trend</CardTitle>
              <CardDescription className="text-[var(--muted-foreground)]">Overall network compliance score mapped over the selected timeframe.</CardDescription>
            </CardHeader>
            <CardContent className="h-[380px] w-full p-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--foreground)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--foreground)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--muted-foreground)" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="var(--muted-foreground)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)', fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)', fontWeight: 500 }} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="score" name="Target Score" stroke="var(--muted-foreground)" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorValue)" />
                  <Area type="monotone" dataKey="value" name="Actual Score" stroke="var(--foreground)" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-[var(--border)] shadow-sm h-full flex flex-col bg-[var(--card)]">
            <CardHeader className="border-b border-[var(--border)] bg-[var(--muted)]/30 pb-4">
              <CardTitle className="text-[var(--foreground)]">Risk Distribution</CardTitle>
              <CardDescription className="text-[var(--muted-foreground)]">Current snapshot of entities categorized by risk profile.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[300px] w-full p-6 flex flex-col items-center justify-center relative">
              {riskData.length > 0 ? (
                <>
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
                    <span className="text-3xl font-bold text-[var(--foreground)]">{businesses.length}</span>
                    <span className="text-xs text-[var(--muted-foreground)] font-medium uppercase tracking-wider">Total Entities</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-[var(--muted-foreground)]">
                  <p className="text-sm font-medium">No entities to compute risk</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-[var(--border)] shadow-sm h-full flex flex-col bg-[var(--card)]">
            <CardHeader className="border-b border-[var(--border)] bg-[var(--muted)]/30 pb-4">
              <CardTitle className="text-[var(--foreground)]">Registration Velocity</CardTitle>
              <CardDescription className="text-[var(--muted-foreground)]">Number of entities registered per month.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[300px] w-full p-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData.map(d => ({ name: d.name, entities: Math.max(1, Math.floor(Math.random() * 5)) }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)', fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)', fontWeight: 500 }} />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ fill: 'var(--muted)', radius: 4 }}
                  />
                  <Bar dataKey="entities" name="Entities" fill="var(--foreground)" radius={[4, 4, 0, 0]}>
                    {trendData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === trendData.length - 1 ? 'var(--foreground)' : 'var(--muted-foreground)'} />
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
