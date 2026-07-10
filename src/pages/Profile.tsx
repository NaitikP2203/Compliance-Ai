import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Building, Phone, ShieldCheck, Camera, Key } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function Profile() {
  const handleSave = () => {
    toast.success('Profile updated', {
      description: 'Your personal information has been saved successfully.'
    });
  };

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

  return (
    <div className="space-y-8 max-w-[900px] mx-auto font-sans">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">My Profile</h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">Manage your personal information, security preferences, and identity verification.</p>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item}>
          <Card className="border-[var(--border)] shadow-sm overflow-hidden bg-[var(--card)]">
            <div className="h-32 bg-[var(--foreground)] relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            </div>
            <CardContent className="px-8 pb-8 relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-12 mb-8">
                <div className="relative group">
                  <div className="h-28 w-28 rounded-2xl bg-[var(--background)] border-4 border-[var(--background)] shadow-md flex items-center justify-center text-[var(--foreground)] text-3xl font-bold overflow-hidden relative">
                    <div className="absolute inset-0 bg-[var(--muted)] flex items-center justify-center">
                      JD
                    </div>
                  </div>
                  <button className="absolute bottom-2 right-2 p-2 bg-[var(--foreground)] text-[var(--background)] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-[var(--foreground)]/90">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 pb-2">
                  <h3 className="text-2xl font-bold text-[var(--foreground)]">Jane Doe</h3>
                  <p className="text-[var(--muted-foreground)] flex items-center mt-1">
                    <Building className="h-4 w-4 mr-1.5" />
                    Senior Compliance Officer
                  </p>
                </div>
                <div className="pb-2 w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto bg-[var(--card)] border-[var(--border)]">
                    View Public Profile
                  </Button>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 mt-8">
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-[var(--foreground)] uppercase tracking-wide">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                    <Input defaultValue="Jane" className="pl-10 h-11 bg-[var(--muted)]/50 border-transparent focus-visible:ring-[var(--foreground)] rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-[var(--foreground)] uppercase tracking-wide">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                    <Input defaultValue="Doe" className="pl-10 h-11 bg-[var(--muted)]/50 border-transparent focus-visible:ring-[var(--foreground)] rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-[var(--foreground)] uppercase tracking-wide">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                    <Input defaultValue="jane.doe@enterprise.com" className="pl-10 h-11 bg-[var(--muted)]/50 border-transparent focus-visible:ring-[var(--foreground)] rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-[var(--foreground)] uppercase tracking-wide">Direct Line</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                    <Input defaultValue="+1 (555) 000-0000" className="pl-10 h-11 bg-[var(--muted)]/50 border-transparent focus-visible:ring-[var(--foreground)] rounded-xl" />
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-[var(--border)] flex justify-end">
                <Button className="h-11 px-8 rounded-xl shadow-sm bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--foreground)]/90" onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-[var(--border)] shadow-sm bg-[var(--card)]">
            <CardHeader className="bg-[var(--muted)]/30 border-b border-[var(--border)] pb-4">
              <CardTitle className="text-lg text-[var(--foreground)]">Enterprise Security</CardTitle>
              <CardDescription className="text-[var(--muted-foreground)]">Manage your authentication methods and clearance levels.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-[var(--border)] bg-[var(--muted)]/30 rounded-xl gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[var(--background)] border border-[var(--border)] rounded-xl">
                    <ShieldCheck className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-[var(--foreground)]">Two-Factor Authentication (2FA)</p>
                    <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Currently enforcing TOTP via Authenticator App</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full sm:w-auto bg-[var(--card)] border-[var(--border)]">
                  Configure 2FA
                </Button>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-[var(--border)] rounded-xl gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[var(--muted)] rounded-xl">
                    <Key className="h-6 w-6 text-[var(--muted-foreground)]" />
                  </div>
                  <div>
                    <p className="font-bold text-[var(--foreground)]">Password</p>
                    <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Last changed 45 days ago</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full sm:w-auto bg-[var(--card)] border-[var(--border)]">
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
