import React from 'react';
import { Mail, Code, ShieldCheck, GraduationCap, Send } from 'lucide-react';

const developers = [
  {
    name: 'Pallavi Sowreddi',
    initials: 'PS',
    email: 'pallavisowreddi@gmail.com',
    role: 'Lead Developer',
    gradient: 'from-blue-500 to-blue-500'
  },
  {
    name: 'Jitendra Kumar Nishad',
    initials: 'JN',
    email: 'jitendranishad347@gmail.com',
    role: 'Developer',
    gradient: 'from-sky-500 to-blue-500'
  }
];

const ContactPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="absolute top-24 right-1/4 w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none -z-10"></div>

      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
          <Code className="h-7 w-7 text-blue-500" />
          Contact Developers
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">
          Meet the team behind RealCheck AI. Reach out directly for collaborations, questions, or feedback.
        </p>
      </header>

      {/* Developer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {developers.map((dev) => (
          <div
            key={dev.name}
            className="group p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex flex-col items-center text-center">
              <div className={`h-20 w-20 rounded-3xl bg-gradient-to-tr ${dev.gradient} flex items-center justify-center ring-4 ring-blue-500/10 shadow-xl mb-4 group-hover:scale-105 transition-transform duration-300`}>
                <span className="text-white font-extrabold text-2xl uppercase select-none">{dev.initials}</span>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{dev.name}</h3>
              <span className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                <GraduationCap className="h-3.5 w-3.5" />
                {dev.role}
              </span>
              <a
                href={`mailto:${dev.email}`}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-600/15 transition-all duration-200"
              >
                <Send className="h-4 w-4" />
                {dev.email}
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Project Info Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-500/10 via-sky-500/5 to-transparent border border-zinc-200 dark:border-zinc-800 shadow-md">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-sky-500 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">RealCheck AI</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed max-w-2xl">
              A production-quality, full-stack image forensics platform built as a major internship project,
              benchmarked on the 120k image CIFAKE dataset. Developed under the XtraGrad Internship Program (2025â€“26).
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-3 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-blue-500" />
              For platform issues, prefer the Query section â€” we track those in our inbox.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ContactPage };
