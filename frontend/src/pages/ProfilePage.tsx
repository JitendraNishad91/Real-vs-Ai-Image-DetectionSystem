import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  User, Mail, CalendarDays, Search, CheckCircle2, XCircle,
  Inbox, Zap, Loader2, AlertCircle
} from 'lucide-react';

interface ProfilePageProps {
  apiUrl: string;
  token: string | null;
}

interface ProfileData {
  username: string;
  email: string;
  member_since: string;
  stats: {
    total_scans: number;
    real_count: number;
    fake_count: number;
    queries_submitted: number;
    avg_inference_ms: number;
  };
}

const ProfilePage: React.FC<ProfilePageProps> = ({ apiUrl, token }) => {  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await axios.get(`${apiUrl}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Could not load your profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString([], {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="text-xs">Loading your profile...</span>
      </div>
    );
  }

  if (errorMsg || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24">
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center gap-3 text-sm max-w-md mx-auto">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          {errorMsg}
        </div>
      </div>
    );
  }

  const s = profile.stats;

  const statCards = [
    { icon: Search, label: 'Total Scans', value: s.total_scans, color: 'text-red-500', bg: 'bg-red-500/10' },
    { icon: CheckCircle2, label: 'Real Detected', value: s.real_count, color: 'text-green-500', bg: 'bg-green-500/10' },
    { icon: XCircle, label: 'Fake Detected', value: s.fake_count, color: 'text-red-500', bg: 'bg-red-500/10' },
    { icon: Inbox, label: 'Queries Sent', value: s.queries_submitted, color: 'text-sky-500', bg: 'bg-sky-500/10' },
    { icon: Zap, label: 'Avg. Inference', value: `${s.avg_inference_ms} ms`, color: 'text-red-500', bg: 'bg-red-500/10' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="absolute top-24 right-1/4 w-[350px] h-[350px] bg-sky-500/5 rounded-full blur-[80px] pointer-events-none -z-10"></div>

      {/* Identity Card */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden mb-6">
        <div className="px-6 pb-6 pt-5">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5 mb-6">
            <div className="flex-shrink-0">
              <div className="h-24 w-24 rounded-3xl bg-gradient-to-tr from-blue-500 to-sky-500 flex items-center justify-center ring-4 ring-white dark:ring-zinc-900 shadow-xl shadow-blue-500/20">
                <span className="text-white font-extrabold text-4xl uppercase select-none">
                  {profile.username.charAt(0)}
                </span>
              </div>
            </div>
            <div className="flex-grow min-w-0 mt-4 sm:mt-3">
              <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white truncate">
                {profile.username}
              </h1>
              <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mt-1.5">
                Verified Account
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#17120d]/60 border border-zinc-100 dark:border-zinc-800">
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <User className="h-4.5 w-4.5 text-blue-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Username</p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{profile.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#17120d]/60 border border-zinc-100 dark:border-zinc-800">
              <div className="h-9 w-9 rounded-xl bg-sky-500/10 flex items-center justify-center flex-shrink-0">
                <Mail className="h-4.5 w-4.5 text-sky-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Email</p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#17120d]/60 border border-zinc-100 dark:border-zinc-800 sm:col-span-2">
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <CalendarDays className="h-4.5 w-4.5 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Member Since</p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">{formatDate(profile.member_since)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
        <Search className="h-5 w-5 text-blue-500" />
        Activity Overview
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className={`h-9 w-9 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`h-4.5 w-4.5 ${card.color}`} />
            </div>
            <p className="text-xl font-extrabold text-zinc-900 dark:text-white">{card.value}</p>
            <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export { ProfilePage };