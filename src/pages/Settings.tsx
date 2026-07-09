import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSettingsStore } from '@/store/settings';
import { Moon, Sun, Monitor, Globe, Bell, Shield, Key, Layout, LogOut, Check } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/constants/translations';

export default function Settings() {
  const { theme, setTheme, language, setLanguage } = useSettingsStore();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = React.useState('appearance');

  const handleSave = () => {
    toast.success('Preferences updated', {
      description: 'Your settings have been saved successfully.'
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

  const tabs: { id: string; labelKey: TranslationKey; icon: React.ComponentType<any> }[] = [
    { id: 'general', labelKey: 'workspace', icon: Layout },
    { id: 'appearance', labelKey: 'appearance', icon: Sun },
    { id: 'notifications', labelKey: 'notifications', icon: Bell },
    { id: 'security', labelKey: 'security_auth', icon: Shield },
    { id: 'api-keys', labelKey: 'api_keys', icon: Key },
  ];

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#111111]">{t('platform_settings')}</h2>
        <p className="text-sm text-[#666666] mt-1">Manage your enterprise workspace preferences and security configurations.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-[240px_1fr] items-start">
        <Card className="border-[#eaeaea] shadow-sm sticky top-6">
          <CardContent className="p-3">
            <nav className="flex flex-col gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all",
                    activeTab === tab.id 
                      ? "bg-royal-50 text-royal-700" 
                      : "text-[#666666] hover:bg-[#fafafa] hover:text-[#111111]"
                  )}
                >
                  <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-royal-600" : "text-[#888888]")} />
                  {t(tab.labelKey)}
                </button>
              ))}
              <div className="h-px bg-[#eaeaea] my-2 mx-2" />
              <button className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors">
                <LogOut className="h-4 w-4" />
                {t('terminate_clearance')}
              </button>
            </nav>
          </CardContent>
        </Card>

        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
          {activeTab === 'appearance' && (
            <>
              <motion.div variants={item}>
                <Card className="border-[#eaeaea] shadow-sm">
                  <CardHeader className="border-b border-[#eaeaea] bg-[#fafafa]/50 pb-4">
                    <CardTitle className="text-lg">Theme Preferences</CardTitle>
                    <CardDescription>Customize the visual appearance of the Compliance AI interface.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-8">
                    <div className="space-y-4">
                      <label className="text-sm font-semibold text-[#111111]">{t('interface_theme')}</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          { id: 'light', label: 'Light Mode', icon: Sun, desc: 'Clean and readable' },
                          { id: 'dark', label: 'Dark Mode', icon: Moon, desc: 'Easy on the eyes' },
                          { id: 'system', label: 'System Default', icon: Monitor, desc: 'Syncs with OS' },
                        ].map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setTheme(t.id as any)}
                            className={cn(
                              "flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden group",
                              theme === t.id 
                                ? "border-royal-600 bg-royal-50/30" 
                                : "border-[#eaeaea] hover:border-royal-200 hover:bg-[#fafafa]"
                            )}
                          >
                            <div className={cn(
                              "p-2 rounded-lg mb-3",
                              theme === t.id ? "bg-royal-100 text-royal-700" : "bg-[#f5f5f5] text-[#666666] group-hover:text-[#111111]"
                            )}>
                              <t.icon className="h-5 w-5" />
                            </div>
                            <span className={cn("text-sm font-semibold", theme === t.id ? "text-royal-900" : "text-[#111111]")}>{t.label}</span>
                            <span className="text-xs text-[#666666] mt-1">{t.desc}</span>
                            
                            {theme === t.id && (
                              <div className="absolute top-4 right-4 text-royal-600">
                                <Check className="h-4 w-4" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="h-px bg-[#eaeaea] w-full" />

                    <div className="space-y-4">
                      <label className="text-sm font-semibold text-[#111111]">{t('platform_language')}</label>
                      <div className="max-w-md">
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value as any)}
                          className="flex h-10 w-full rounded-lg border border-[#eaeaea] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-royal-500/20 focus:border-royal-500 transition-colors shadow-sm"
                        >
                          <option value="en">English (US)</option>
                          <option value="hi">Hindi (हिंदी)</option>
                          <option value="bn">Bengali (বাংলা)</option>
                          <option value="gu">Gujarati (ગુજરાતી)</option>
                          <option value="mr">Marathi (मराठी)</option>
                          <option value="ta">Tamil (தமிழ்)</option>
                          <option value="pa">Punjabi (ਪੰਜਾਬੀ)</option>
                        </select>
                        <p className="text-xs text-[#888888] mt-2">
                          This updates the primary language for your dashboard, generated reports, and automated communications.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={item} className="flex justify-end gap-3 pt-4 border-t border-[#eaeaea]">
                <Button variant="outline" className="h-10 bg-white">{t('discard_changes')}</Button>
                <Button variant="royal" className="h-10" onClick={handleSave}>{t('save_preferences')}</Button>
              </motion.div>
            </>
          )}

          {activeTab !== 'appearance' && (
            <motion.div variants={item}>
              <Card className="border-[#eaeaea] shadow-sm flex flex-col items-center justify-center py-20 text-center">
                <div className="h-16 w-16 rounded-full bg-[#f5f5f5] flex items-center justify-center mb-4">
                  <Layout className="h-8 w-8 text-[#cccccc]" />
                </div>
                <h3 className="text-lg font-semibold text-[#111111] mb-2">Module Under Construction</h3>
                <p className="text-[#666666] max-w-sm">The settings for {activeTab} are currently being upgraded to the new enterprise experience.</p>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
