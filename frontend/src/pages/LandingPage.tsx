import React, { useState } from 'react';
import { Cpu, Eye, FileText, ArrowRight, Sparkles, Check, HelpCircle, ChevronDown, ChevronUp, ShieldCheck, Fingerprint, Lock, Search, Grid, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LandingPageProps {
  onStart: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "How does RealCheck detect AI images?",
    answer: "Our CNN is trained on 120,000 real and AI-generated images. It picks up on tiny upsampling artifacts that generative models leave behind but real cameras never produce."
  },
  {
    question: "What do the forensic filters show?",
    answer: "ELA re-saves your image and highlights uneven compression — a common giveaway of AI generation or splicing. The Laplacian filter exposes unnatural edges."
  },
  {
    question: "Does it work on mobile?",
    answer: "Yes. Every feature, from Grad-CAM heatmaps to batch scanning, works smoothly on phones, tablets, and desktops."
  },
  {
    question: "Are my images private?",
    answer: "Your image files are analyzed in memory and never stored on our servers. Only scan results are saved to your account, and you can delete them anytime."
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.06,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  // Helper float helper
  const floatAnim = (delay: number, duration: number) => ({
    y: [0, -14, 0],
    rotate: [0, 4, -4, 0],
    transition: {
      duration,
      repeat: Infinity,
      ease: "easeInOut",
      delay
    }
  });

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-gradient-to-b from-[#eef3fb] to-white dark:from-[#0c1322] dark:to-[#16203a] transition-colors duration-300">
      
      {/* Background radial soft glows behind hero */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-r from-blue-500/10 to-blue-500/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse-glow"></div>

      {/* Floating outline elements (Slow drifting forensic icons) */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <motion.div animate={floatAnim(0, 7)} className="absolute top-16 left-[8%] text-blue-500/15">
          <ShieldCheck className="h-10 w-10 stroke-[1.2]" />
        </motion.div>
        <motion.div animate={floatAnim(1.5, 8.5)} className="absolute top-24 right-[12%] text-blue-500/15">
          <Fingerprint className="h-12 w-12 stroke-[1.2]" />
        </motion.div>
        <motion.div animate={floatAnim(3, 6.5)} className="absolute top-1/3 left-[5%] text-sky-500/12">
          <Search className="h-9 w-9 stroke-[1.2]" />
        </motion.div>
        <motion.div animate={floatAnim(0.8, 9)} className="absolute top-1/2 right-[6%] text-blue-500/15">
          <Grid className="h-11 w-11 stroke-[1.2]" />
        </motion.div>
        <motion.div animate={floatAnim(2.2, 7.5)} className="absolute bottom-48 left-[10%] text-blue-500/15">
          <Lock className="h-8 w-8 stroke-[1.2]" />
        </motion.div>
        <motion.div animate={floatAnim(4, 8)} className="absolute bottom-60 right-[15%] text-sky-500/15">
          <ImageIcon className="h-10 w-10 stroke-[1.2]" />
        </motion.div>
        <motion.div animate={floatAnim(1, 6)} className="absolute top-[60%] left-[28%] text-blue-500/10">
          <Sparkles className="h-6 w-6 stroke-[1.2]" />
        </motion.div>
        <motion.div animate={floatAnim(2.5, 6.5)} className="absolute top-1/3 right-[32%] text-sky-500/10">
          <Check className="h-7 w-7 stroke-[1.2]" />
        </motion.div>
      </div>

      {/* Hero Section */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center relative"
      >
        {/* Central Focal Graphic Badge */}
        <motion.div 
          variants={itemVariants}
          className="relative w-28 h-28 mx-auto mb-7 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping" style={{ animationDuration: '2.5s' }}></div>
          <div className="absolute inset-4 bg-sky-500/10 rounded-full animate-pulse" style={{ animationDuration: '3s' }}></div>
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-blue-600 border border-blue-400/40 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20 z-10 relative">
            <Fingerprint className="h-9 w-9 text-white" />
          </div>
        </motion.div>

        {/* Hero Badge */}
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-500/25 text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-8 badge-glow shadow-md">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          AI-Driven Forensic Detection
        </motion.div>
        
        <motion.h1 variants={itemVariants} className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-[#f5f5fa] leading-tight max-w-4xl mx-auto text-glow">
          Expose AI-Generated Images with <span className="bg-gradient-to-r from-blue-300 via-blue-500 to-emerald-400 bg-clip-text text-transparent animate-text-gradient">Explainable Forensics</span>
        </motion.h1>
        
        <motion.p variants={itemVariants} className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Verify digital trust instantly. Classify images as authentic photographs or AI-generated synthetic fakes, backed by neural activation maps and our canvas edge analyzer.
        </motion.p>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={onStart}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-bold text-base transition-all duration-300 shadow-xl shadow-blue-500/10 hover:shadow-blue-600/30 transform hover:-translate-y-0.5"
          >
            Launch Forensic Console
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={onStart}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full btn-glass text-zinc-800 dark:text-white font-semibold text-base transition-all duration-300"
          >
            Forensic Filters Toolkit
          </button>
        </motion.div>

        {/* Hero Widget Preview */}
        <motion.div variants={itemVariants} className="mt-20 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden bg-white/60 dark:bg-zinc-950/20 backdrop-blur-md p-4 max-w-4xl mx-auto shadow-2xl shadow-blue-500/5">
          <div className="aspect-[16/9] w-full rounded-2xl bg-gradient-to-tr from-zinc-900 via-zinc-950 to-blue-950/40 border border-zinc-800/40 relative flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
            
            {/* Visual scanner decoration */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-sky-500/30 to-transparent shadow-[0_0_8px_rgba(59,130,246,0.2)] animate-scan-beam"></div>

            <div className="text-center p-8 z-10">
              <div className="h-16 w-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-blue-500/20 shadow-md">
                <Cpu className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="font-extrabold text-xl text-zinc-900 dark:text-white mb-2 tracking-tight">Active Neural Forensic Scanner</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
                Analyzing high-frequency convolutional matrices and deconvolution checkerboard grids on standard camera sensors and diffusion models.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Metrics Section */}
      <section className="bg-zinc-100/70 dark:bg-zinc-900/30 border-y border-zinc-200 dark:border-zinc-800 py-12 transition-colors duration-300 backdrop-blur-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-400">120,000</div>
              <div className="mt-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">CIFAKE Images Trained</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-400">93.45%</div>
              <div className="mt-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">CNN Test Accuracy</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-400">&lt; 1 sec</div>
              <div className="mt-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">Inference Speed</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-400">100%</div>
              <div className="mt-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">Explainable & Private</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-3xl font-extrabold text-center text-zinc-900 dark:text-white mb-16 tracking-tight text-glow">
          SaaS Forensic Features Suite
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition duration-300 ease-out flex flex-col items-start text-left">
            <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 flex items-center justify-center mb-6 border border-blue-200 dark:border-blue-900/30">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-3 text-zinc-900 dark:text-white">Neural Gradient Mapping</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
              Calculates target convolutional gradients dynamically and overlays active Grad-CAM heatmaps to show where fakes are localized.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition duration-300 ease-out flex flex-col items-start text-left">
            <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 flex items-center justify-center mb-6 border border-blue-200 dark:border-blue-900/30">
              <Eye className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-3 text-zinc-900 dark:text-white">Forensic Image Toolkit</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
              Provides client-side canvas filters like Laplacian edge convolutions and Error Level Analysis (ELA) to manually verify texture compression irregularities.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition duration-300 ease-out flex flex-col items-start text-left">
            <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 flex items-center justify-center mb-6 border border-blue-200 dark:border-blue-900/30">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-3 text-zinc-900 dark:text-white">EXIF Metadata Audits</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
              Parses image header logs to check camera lenses, exposure software signatures, and edit histories, verifying structural authenticity.
            </p>
          </div>
        </div>
      </section>

      {/* SaaS Pricing Plans Section */}
      <section className="bg-zinc-100/70 dark:bg-zinc-900/20 border-y border-zinc-200 dark:border-zinc-800 py-24 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-4 tracking-tight text-glow">Flexible SaaS Pricing Plans</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto mb-16">Choose the plan that suits your analysis requirements, from casual lookups to enterprise-scale batch forensics.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Plan 1 */}
            <div className="p-8 bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/30 rounded-3xl flex flex-col text-left transition duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.02)]">
              <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white mb-2">Guest / Basic</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">Casual scan audits and standard diagnostics.</p>
              <div className="text-3xl font-black text-zinc-900 dark:text-white mb-6">$0<span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold"> / month</span></div>
              
              <ul className="text-xs text-zinc-600 dark:text-zinc-400 flex flex-col gap-3 mb-8 flex-grow">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Single classification scan</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Grad-CAM overlay heatmap</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Standard Custom CNN model</li>
              </ul>
              
              <button onClick={onStart} className="w-full py-3 rounded-xl btn-glass text-zinc-800 dark:text-white text-xs font-bold transition duration-200">Get Started</button>
            </div>

            {/* Plan 2: Pro (Best Value) */}
            <div className="p-8 bg-blue-50/60 dark:bg-zinc-950/40 border-2 border-blue-500 rounded-3xl flex flex-col shadow-2xl shadow-blue-600/5 text-left relative transition duration-300 transform hover:-translate-y-1">
              <div className="absolute top-0 right-6 transform -translate-y-1/2 px-3 py-1 bg-blue-500 text-[10px] font-bold text-white uppercase tracking-wider rounded-full">Best Value</div>
              
              <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white mb-2">Forensic Pro</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">Designed for professionals and security teams.</p>
              <div className="text-3xl font-black text-zinc-900 dark:text-white mb-6">$29<span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold"> / month</span></div>
              
              <ul className="text-xs text-zinc-600 dark:text-zinc-400 flex flex-col gap-3 mb-8 flex-grow">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-500" /> Unlimited classification scans</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-500" /> Batch scan uploads (up to 10 images)</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-500" /> Forensic Filters Toolkit (ELA, Laplacian)</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-500" /> ResNet-50 deep inference access</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-500" /> EXIF metadata reporting</li>
              </ul>
              
              <button onClick={onStart} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition duration-200 shadow-md shadow-blue-600/10">Start Pro Trial</button>
            </div>

            {/* Plan 3 */}
            <div className="p-8 bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/30 rounded-3xl flex flex-col text-left transition duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.02)]">
              <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white mb-2">Enterprise</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">Custom models and API keys for platform developers.</p>
              <div className="text-3xl font-black text-zinc-900 dark:text-white mb-6">$149<span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold"> / month</span></div>
              
              <ul className="text-xs text-zinc-600 dark:text-zinc-400 flex flex-col gap-3 mb-8 flex-grow">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> All Pro plan features included</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Dedicated REST API developer keys</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> High-frequency rate limits</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Model fine-tuning parameters</li>
              </ul>
              
              <button onClick={onStart} className="w-full py-3 rounded-xl btn-glass text-zinc-800 dark:text-white text-xs font-bold transition duration-200">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full text-left">
        <h2 className="text-3xl font-extrabold text-center text-zinc-900 dark:text-white mb-4 tracking-tight text-glow">Frequently Asked Questions</h2>
        <p className="text-sm text-zinc-500 text-center mb-16">Clear answers regarding dataset constraints, ELA compression, and local privacy setups.</p>
        
        <div className="flex flex-col gap-4">
          {FAQ_ITEMS.map((item, idx) => (
            <div 
              key={idx}
              className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/40 overflow-hidden transition duration-200 hover:border-blue-500/30"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-sm text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/10 transition duration-150 outline-none"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="h-4.5 w-4.5 text-blue-400 flex-shrink-0" />
                  {item.question}
                </span>
                {openFaqIndex === idx ? (
                  <ChevronUp className="h-4 w-4 text-zinc-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-zinc-500" />
                )}
              </button>
              
              <AnimatePresence initial={false}>
                {openFaqIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                  >
                    <div className="px-6 pb-6 pt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-200 dark:border-zinc-800/50 bg-zinc-500/5 dark:bg-zinc-950/10">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500 transition-colors duration-300">
        <p className="font-semibold text-zinc-400 mb-1">
          XtraGrad Major Project Completion
        </p>
        <p>Developers: Pallavi Sowreddi & Jitendra Kumar Nishad | &copy; 2026 RealCheck AI</p>
      </footer>
    </div>
  );
};
