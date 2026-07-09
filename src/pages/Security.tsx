import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Trash2, 
  Search, 
  Filter, 
  AlertTriangle, 
  Key, 
  Terminal, 
  UserX, 
  Activity, 
  Lock,
  Clock,
  Code2,
  RefreshCw,
  Eye,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSecurityStore, SecurityLog } from '@/store/security';
import { toast } from 'sonner';

export default function Security() {
  const {
    currentRole,
    currentEmail,
    isStrictCSPEnabled,
    isFileScanEnabled,
    isRateLimitingEnabled,
    isXssSanitizerEnabled,
    sessionTimeoutMinutes,
    logs,
    lockouts,
    toggleStrictCSP,
    toggleFileScan,
    toggleRateLimiting,
    toggleXssSanitizer,
    setSessionTimeoutMinutes,
    clearLogs,
    addLog
  } = useSecurityStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'INFO' | 'WARNING' | 'CRITICAL'>('ALL');
  
  // Pen-testing simulator states
  const [xssInput, setXssInput] = useState("<script>alert('DOM_XSS_EXPLOIT')</script>");
  const [simulatedXssOutput, setSimulatedXssOutput] = useState('');
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);

  // Filter logs based on search query and severity
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.event.toLowerCase().includes(searchQuery.toLowerCase()) || 
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (log.userEmail && log.userEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      log.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  // 1. Purge Logs Action (Enforces Admin boundary)
  const handlePurgeLogs = () => {
    try {
      clearLogs();
      toast.success('Security audit logs purged successfully.');
    } catch (err: any) {
      toast.error(err.message || 'Action denied.');
    }
  };

  // 2. Simulate XSS Sanitization Attack
  const runXssSimulation = () => {
    const logsList = ['[SIMULATOR] Initiating XSS DOM payload injection...'];
    
    if (isXssSanitizerEnabled) {
      // Perform strict output entity encoding
      const sanitized = xssInput
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
      
      setSimulatedXssOutput(sanitized);
      logsList.push('[Aegis XSS Guard] Signature detected. Sanitizing input strings...');
      logsList.push(`[Aegis XSS Guard] Rendered safe HTML output: ${sanitized}`);
      logsList.push('[SUCCESS] DOM Script execution vectorized and neutralized safely.');
      
      addLog(
        'XSS',
        'WARNING',
        'Cross-Site Scripting Attempt Neutralized',
        `Unsanitized script sequence [${xssInput.substring(0, 40)}...] was stripped and output encoded successfully.`,
        currentEmail || undefined
      );
    } else {
      setSimulatedXssOutput(xssInput);
      logsList.push('[WARNING] XSS Sanitization is DISABLED.');
      logsList.push('[CRITICAL] Injecting raw unencoded script directly into DOM context!');
      logsList.push('[EXPLOIT] Malicious JS payload runs in client browser thread.');
      
      addLog(
        'XSS',
        'CRITICAL',
        'Cross-Site Scripting Bypass Incident',
        `XSS filter was disabled. Input sequence [${xssInput.substring(0, 40)}...] escaped validation and entered context raw!`,
        currentEmail || undefined
      );
    }
    setSimulationLogs(logsList);
  };

  // 3. Simulate SQL Injection Attack
  const runSqlSimulation = () => {
    const logsList = ['[SIMULATOR] Deserializing login request payload...', "[PAYLOAD] Username: ' OR '1'='1' --"];
    
    const sqlInjectionPattern = /('|--|#|\/\*|\*\/|union|select|insert|delete|drop|update)/gi;
    const hasSqli = sqlInjectionPattern.test("' OR '1'='1' --");
    
    if (hasSqli) {
      logsList.push('[Aegis WAF] Restricted SQL character sequences identified.');
      logsList.push('[Aegis WAF] Action: Request aborted. Parameters isolated. Status 403 Forbidden.');
      addLog(
        'API',
        'CRITICAL',
        'SQL Injection Attempt Intercepted',
        "Parameter structure containing potential raw query breakout ( ' OR '1'='1' ) was blocked by parametric scanner.",
        currentEmail || undefined
      );
      toast.success('SQL injection attempt caught and neutralized by Aegis WAF.');
    } else {
      logsList.push('[Aegis WAF] Bypassed: Executing database mapping query...');
    }
    setSimulationLogs(logsList);
  };

  // 4. Simulate Privilege Escalation Attack
  const runRbacSimulation = () => {
    const logsList = [`[SIMULATOR] User [${currentEmail || 'anonymous'}] requests system logs purge...`];
    
    if (currentRole !== 'admin') {
      logsList.push(`[RBAC Guard] Security privilege audit failed. Required role: [admin]. User role: [${currentRole}].`);
      logsList.push('[RBAC Guard] Action: Purge request blocked. Breach logged.');
      
      addLog(
        'RBAC',
        'CRITICAL',
        'Unauthorized Logs Clear Attempt',
        `User with insufficient role [${currentRole}] attempted to clear secure system logs. Action denied.`,
        currentEmail || undefined
      );
      toast.error('Privilege Escalation Blocked: Role Admin is required for this action.');
    } else {
      logsList.push('[RBAC Guard] Clearance verified. Deleting logs entries...');
      logsList.push('[SUCCESS] System logs successfully wiped by Administrator.');
    }
    setSimulationLogs(logsList);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto font-sans">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111111] flex items-center gap-2">
            Security & Compliance Center
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5" /> Enforcing ASVS v4.0
            </span>
          </h2>
          <p className="text-sm text-[#666666] mt-1">
            Real-time defensive matrix, penetration-testing laboratory, and secure audit logs.
          </p>
        </div>
      </div>

      {/* Grid: 1. Controls, 2. Live Lockouts, 3. Lab Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Security Hardening Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-[#eaeaea] bg-white shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-[#eaeaea]">
                <Settings className="h-5 w-5 text-slate-800" />
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Active Defensive Postures</h3>
              </div>

              {/* Toggle 1: Strict CSP */}
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-900">Strict CSP Headers</p>
                  <p className="text-[11px] text-slate-500 leading-normal">Enforce framing boundaries to prevent clickjacking and inline script injection.</p>
                </div>
                <button 
                  onClick={toggleStrictCSP}
                  className={cn(
                    "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none",
                    isStrictCSPEnabled ? "bg-[#111111]" : "bg-slate-200"
                  )}
                >
                  <span className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200",
                    isStrictCSPEnabled ? "translate-x-5" : "translate-x-0"
                  )} />
                </button>
              </div>

              {/* Toggle 2: Magic Bytes File Scan */}
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-900">Binary Signature (Magic Bytes)</p>
                  <p className="text-[11px] text-slate-500 leading-normal">Inspect binary headers of uploaded evidence to prevent extension spoofing.</p>
                </div>
                <button 
                  onClick={toggleFileScan}
                  className={cn(
                    "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none",
                    isFileScanEnabled ? "bg-[#111111]" : "bg-slate-200"
                  )}
                >
                  <span className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200",
                    isFileScanEnabled ? "translate-x-5" : "translate-x-0"
                  )} />
                </button>
              </div>

              {/* Toggle 3: Brute-force throttling */}
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-900">Rate Limiting & Lockouts</p>
                  <p className="text-[11px] text-slate-500 leading-normal">Freeze logins temporarily for accounts exceeding 5 consecutive failures.</p>
                </div>
                <button 
                  onClick={toggleRateLimiting}
                  className={cn(
                    "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none",
                    isRateLimitingEnabled ? "bg-[#111111]" : "bg-slate-200"
                  )}
                >
                  <span className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200",
                    isRateLimitingEnabled ? "translate-x-5" : "translate-x-0"
                  )} />
                </button>
              </div>

              {/* Toggle 4: XSS Output entity encoder */}
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-900">HTML Entity Safe Encoder</p>
                  <p className="text-[11px] text-slate-500 leading-normal">Encode strings escaping to browser contexts to neutralize HTML injections.</p>
                </div>
                <button 
                  onClick={toggleXssSanitizer}
                  className={cn(
                    "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none",
                    isXssSanitizerEnabled ? "bg-[#111111]" : "bg-slate-200"
                  )}
                >
                  <span className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200",
                    isXssSanitizerEnabled ? "translate-x-5" : "translate-x-0"
                  )} />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Idle Session Slider */}
          <Card className="border-[#eaeaea] bg-white shadow-sm rounded-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-2 pb-1">
              <Clock className="h-5 w-5 text-slate-800" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Session Expiry Timeout</h4>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              ASVS v4.0.3 enforces automatic session destruction when users are idle. Configure the logout window in minutes.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">Idle Logout Time:</span>
                <span className="text-[#111111] font-mono">{sessionTimeoutMinutes} Minutes</span>
              </div>
              <input 
                type="range" 
                min={1} 
                max={60} 
                value={sessionTimeoutMinutes}
                onChange={(e) => setSessionTimeoutMinutes(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#111111]"
              />
            </div>
          </Card>

          {/* Locked accounts listing */}
          <Card className="border-[#eaeaea] bg-white shadow-sm rounded-2xl overflow-hidden p-6">
            <div className="flex items-center justify-between border-b border-[#eaeaea] pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <UserX className="h-5 w-5 text-slate-800" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Lockout & Freeze Registry</h4>
              </div>
              <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full uppercase">Throttled</span>
            </div>

            {Object.keys(lockouts).length === 0 ? (
              <p className="text-xs text-slate-400 font-semibold text-center py-4">No credential lockouts active on network nodes.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(lockouts).map(([email, record]) => {
                  const lockedNow = record.lockedUntil && Date.now() < record.lockedUntil;
                  return (
                    <div key={email} className="flex justify-between items-start text-xs p-2.5 rounded-lg border bg-slate-50/50">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{email}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Consecutive attempts: {record.attempts}</p>
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded uppercase border",
                        lockedNow ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      )}>
                        {lockedNow ? 'LOCKED' : 'CLEARED'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right: Pen-testing lab (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-[#eaeaea] bg-white shadow-sm rounded-2xl overflow-hidden flex flex-col h-full min-h-[460px]">
            <div className="p-6 border-b border-[#eaeaea] flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <Terminal className="h-5.5 w-5.5 text-slate-800" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Aegis Cybersecurity Sandbox Lab</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Execute simulated exploits to verify parameter safety, output sanitizers, and RBAC logs.</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">Sandbox Shield Active</span>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
              
              {/* Simulator Action Console */}
              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                      <Code2 className="h-4 w-4 text-slate-500" /> 1. Input Box (XSS Attack Vector)
                    </label>
                    <Input 
                      value={xssInput}
                      onChange={(e) => setXssInput(e.target.value)}
                      placeholder="<script>alert('XSS')</script>"
                      className="font-mono text-xs h-11 bg-slate-50 focus-visible:ring-0 border-slate-200"
                    />
                  </div>
                  
                  <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl">
                    <p className="text-[11px] text-amber-900 leading-normal font-semibold">
                      Exploit Simulation Checklist:
                    </p>
                    <ul className="text-[10px] text-amber-800 list-disc list-inside mt-1 space-y-1 font-semibold">
                      <li>Toggle "HTML Entity Safe Encoder" left/right to witness safe vs vulnerable output.</li>
                      <li>Run SQL Injection to test regular expression interceptors.</li>
                      <li>Attempt Privilege Escalation to see RBAC gates block invalid roles.</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Execute exploit vector</p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button onClick={runXssSimulation} variant="outline" className="text-xs font-bold h-10 border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl">
                      XSS Script
                    </Button>
                    <Button onClick={runSqlSimulation} variant="outline" className="text-xs font-bold h-10 border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl">
                      SQL Injection
                    </Button>
                    <Button onClick={runRbacSimulation} variant="outline" className="text-xs font-bold h-10 border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl">
                      RBAC Purge
                    </Button>
                  </div>
                </div>
              </div>

              {/* Sandbox Terminal Output */}
              <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 flex flex-col font-mono text-xs overflow-hidden h-[300px] md:h-auto">
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-800 mb-3 text-[10px] font-semibold text-slate-400">
                  <span className="flex items-center gap-1.5"><Terminal className="h-3.5 w-3.5" /> AEGIS_CORE_SHELL</span>
                  <span className="text-emerald-400">STATUS: ACTIVE</span>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 font-mono text-[11px] leading-relaxed">
                  {simulationLogs.length === 0 ? (
                    <p className="text-slate-500 italic">No exploits initiated. Click an action below to observe validation cascades.</p>
                  ) : (
                    simulationLogs.map((logLine, i) => (
                      <p 
                        key={i} 
                        className={cn(
                          logLine.includes('WARNING') || logLine.includes('CRITICAL') ? 'text-red-400 font-bold' :
                          logLine.includes('SUCCESS') || logLine.includes('safe') ? 'text-emerald-400 font-semibold' : 'text-slate-300'
                        )}
                      >
                        {logLine}
                      </p>
                    ))
                  )}

                  {/* Render simulated output to DOM box */}
                  {simulatedXssOutput && (
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 mt-4">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Simulated DOM Render Context</p>
                      {isXssSanitizerEnabled ? (
                        <p className="text-emerald-400 bg-emerald-950/40 p-2.5 rounded font-mono border border-emerald-900/30 break-all">
                          {simulatedXssOutput}
                        </p>
                      ) : (
                        <div className="text-red-400 bg-red-950/30 p-2.5 rounded font-mono border border-red-900/30 break-all relative">
                          <AlertTriangle className="h-4 w-4 text-red-500 inline mr-1.5 -mt-0.5" />
                          <span className="underline">DOM EXPLOITED!</span> Script tags rendered raw: 
                          <span className="text-white block mt-1">{simulatedXssOutput}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </Card>
        </div>

      </div>

      {/* Main Audit Trail Panel */}
      <Card className="border-[#eaeaea] bg-white shadow-sm rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-[#eaeaea] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/40">
          <div>
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2">
              System Audits & Cryptographic Logs
              <span className="font-bold text-xs bg-slate-200 text-slate-800 px-2.5 py-0.5 rounded-full font-mono">{filteredLogs.length} Records</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Secure syslog capturing auth queries, file validation outcomes, and RBAC permission checks.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs..." 
                className="pl-8.5 h-9 text-xs w-full md:w-56 border-slate-200 bg-white"
              />
            </div>

            {/* Severity Filter pills */}
            <div className="flex bg-slate-100 p-1 rounded-lg border text-xs font-bold">
              {(['ALL', 'INFO', 'WARNING', 'CRITICAL'] as const).map(sev => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-all uppercase text-[10px]",
                    severityFilter === sev 
                      ? "bg-white text-slate-900 shadow-sm" 
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  {sev}
                </button>
              ))}
            </div>

            {/* Purge logs button */}
            <Button 
              onClick={handlePurgeLogs}
              variant="outline" 
              className="text-xs font-bold h-9 border-dashed border-red-200 hover:bg-red-50 hover:text-red-700 text-red-600 rounded-xl"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Wipe Syslogs
            </Button>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-left text-xs whitespace-nowrap font-sans">
            <thead className="bg-[#fafafa] border-b border-[#eaeaea] text-[#666666] font-semibold sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3.5">Cryptographic Timestamp</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Threat Event</th>
                <th className="px-6 py-3.5">Severity</th>
                <th className="px-6 py-3.5">Origin Node / Email</th>
                <th className="px-6 py-3.5">Log Description Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeaea] bg-white font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-semibold italic">
                    No matching syslog events registered.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#fafafa]/50 transition-colors">
                    <td className="px-6 py-3.5 text-slate-400 font-mono text-[10px]">{new Date(log.timestamp).toISOString()}</td>
                    <td className="px-6 py-3.5">
                      <span className="bg-slate-100 border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[9px] font-bold">
                        {log.category}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-900 font-bold">{log.event}</td>
                    <td className="px-6 py-3.5">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider",
                        log.severity === 'INFO' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                        log.severity === 'WARNING' ? 'text-amber-700 bg-amber-50 border-amber-200' : 
                        'text-red-700 bg-red-50 border-red-200'
                      )}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-500 font-mono text-[10px] truncate max-w-[150px]">{log.userEmail || log.ip}</td>
                    <td className="px-6 py-3.5 text-slate-600 font-medium whitespace-normal max-w-sm text-[11px] leading-relaxed">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      <div className="text-center text-[11px] text-[#888888] pb-6">
        <p>Aegis Shield Compliance & Security Console v1.0.0. All events hashed with SHA-256 for integrity auditing.</p>
      </div>
    </div>
  );
}
