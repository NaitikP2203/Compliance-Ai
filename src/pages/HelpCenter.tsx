import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Book, MessageCircle, FileQuestion, ExternalLink, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function HelpCenter() {
  const faqs = [
    { q: 'How do I add a new business entity?', a: 'Navigate to the Businesses page and click the "Add Entity" button in the top right corner. Fill out the required KYC information including company name, registration number, and primary contact details.' },
    { q: 'How is the compliance score calculated?', a: 'The score is an aggregate of document validity, risk profile, and outstanding alerts across your registered entities. It is recalculated daily at midnight UTC.' },
    { q: 'Can I export reports for regulators?', a: 'Yes, go to the Compliance Reports tab. You can export any generated report as PDF or CSV using the export buttons located at the top right of the data table.' },
    { q: 'What happens when a document expires?', a: 'The system will generate a High Priority alert 30 days before expiration, and the business status will change to "Review". Email notifications will be sent to the designated compliance officers.' },
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

  return (
    <div className="space-y-8 max-w-[1000px] mx-auto font-sans">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center py-16 bg-[var(--foreground)] text-[var(--background)] rounded-3xl relative overflow-hidden shadow-xl"
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--background)] opacity-10 rounded-full blur-[80px] -mr-40 -mt-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[var(--background)] opacity-5 rounded-full blur-[60px] -ml-20 -mb-20 pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl mx-auto px-6">
          <h2 className="text-4xl font-bold tracking-tight mb-4">How can we help you?</h2>
          <p className="text-lg opacity-70 mb-8">Search our knowledge base or reach out to our enterprise support team.</p>
          <div className="relative max-w-xl mx-auto group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 opacity-50 group-focus-within:opacity-100 transition-opacity" />
            <Input 
              placeholder="Search documentation, guides, or FAQs..." 
              className="pl-12 h-14 bg-[var(--background)]/10 border-[var(--background)]/20 text-[var(--background)] placeholder:text-[var(--background)]/50 focus:bg-[var(--background)]/20 focus:border-[var(--background)]/40 rounded-2xl text-lg backdrop-blur-md shadow-inner transition-all"
            />
          </div>
        </div>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-6 md:grid-cols-3">
        {[
          { title: 'Documentation', desc: 'Detailed guides on platform features and API integration.', icon: Book, color: 'text-blue-500 bg-blue-500/10' },
          { title: 'Contact Support', desc: 'Create a ticket or chat directly with our compliance experts.', icon: MessageCircle, color: 'text-emerald-500 bg-emerald-500/10' },
          { title: 'Knowledge Base', desc: 'Articles on global regulatory changes and best practices.', icon: FileQuestion, color: 'text-purple-500 bg-purple-500/10' },
        ].map((block, i) => (
          <motion.div variants={item} key={i}>
            <Card className="border-[var(--border)] bg-[var(--card)] shadow-sm hover:border-[var(--foreground)] transition-all cursor-pointer group h-full">
              <CardContent className="p-8">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${block.color}`}>
                  <block.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">{block.title}</h3>
                <p className="text-[var(--muted-foreground)] mb-6 line-clamp-2">{block.desc}</p>
                <span className="text-sm font-semibold text-[var(--foreground)] inline-flex items-center group-hover:underline underline-offset-4">
                  Explore resource <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                </span>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card className="border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden">
          <CardHeader className="bg-[var(--muted)]/30 border-b border-[var(--border)] pb-4">
            <CardTitle className="text-xl text-[var(--foreground)]">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[var(--border)]">
              {faqs.map((faq, i) => (
                <div key={i} className="p-6 hover:bg-[var(--muted)]/50 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-[var(--foreground)] text-lg transition-colors">{faq.q}</h4>
                    <ChevronRight className="h-5 w-5 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors" />
                  </div>
                  <p className="text-[var(--muted-foreground)] leading-relaxed pr-8">{faq.a}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
