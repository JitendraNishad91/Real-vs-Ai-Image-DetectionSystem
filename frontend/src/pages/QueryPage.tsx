import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Send, CheckCircle2, AlertCircle, Inbox, Loader2, MessageSquare, Trash2 } from 'lucide-react';

interface QueryPageProps {
  apiUrl: string;
  token: string | null;
}

interface ReceivedQuery {
  id: number;
  user: string | null;
  subject: string | null;
  message: string | null;
  created_at: string | null;
}

const QueryPage: React.FC<QueryPageProps> = ({ apiUrl, token }) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const [isSending, setIsSending] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [inbox, setInbox] = useState<ReceivedQuery[]>([]);
  const [isLoadingInbox, setIsLoadingInbox] = useState<boolean>(false);
  const [inboxError, setInboxError] = useState<string | null>(null);

  useEffect(() => {
    if (token) fetchInbox();
  }, [token]);

  const fetchInbox = async () => {
    setIsLoadingInbox(true);
    setInboxError(null);
    try {
      const response = await axios.get(`${apiUrl}/support/queries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInbox(response.data);
    } catch (err: any) {
      console.error(err);
      setInboxError(err.response?.data?.detail || 'Could not load received queries.');
    } finally {
      setIsLoadingInbox(false);
    }
  };

  const deleteQuery = async (id: number) => {
    if (!window.confirm('Delete this query permanently?')) return;
    try {
      await axios.delete(`${apiUrl}/support/queries/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInbox((prev) => prev.filter((q) => q.id !== id));
    } catch (err: any) {
      console.error(err);
      setInboxError(err.response?.data?.detail || 'Failed to delete the query.');
    }
  };

  const clearAllQueries = async () => {
    if (!window.confirm(`Delete ALL ${inbox.length} queries permanently? This cannot be undone.`)) return;
    try {
      await axios.delete(`${apiUrl}/support/queries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInbox([]);
    } catch (err: any) {
      console.error(err);
      setInboxError(err.response?.data?.detail || 'Failed to clear queries.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await axios.post(`${apiUrl}/support/query`, { name, email, subject, message });
      setSuccessMsg(response.data.message || 'Query submitted successfully!');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      if (token) fetchInbox();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Failed to submit your query. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="absolute top-24 left-1/4 w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none -z-10"></div>

      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
          <MessageSquare className="h-7 w-7 text-blue-500" />
          Ask a Question
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">
          Have a question about image forensics or the platform? Send it directly to the team.
        </p>
      </header>

      <div className={`grid grid-cols-1 ${token ? 'lg:grid-cols-12' : 'max-w-2xl mx-auto'} gap-6 items-start`}>
        {/* Query Form */}
        <div className={`${token ? 'lg:col-span-5' : ''} p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl`}>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1 flex items-center gap-2">
            <Mail className="h-4.5 w-4.5 text-blue-500" />
            Your Query
          </h3>
          <p className="text-xs text-zinc-500 mb-5">Saved directly to our database and reviewed by the team.</p>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 flex items-start gap-2 mb-4 text-xs">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200/50 dark:border-green-900/30 text-green-600 dark:text-green-400 flex items-start gap-2 mb-4 text-xs">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Your Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-[#0c1322]/60 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Email (optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com â€” for a reply"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-[#0c1322]/60 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Subject *</label>
              <input
                type="text"
                required
                minLength={3}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What is your question about?"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-[#0c1322]/60 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Message *</label>
              <textarea
                required
                minLength={10}
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your question in detail..."
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-[#0c1322]/60 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 disabled:opacity-60 text-white text-sm font-bold shadow-lg shadow-blue-600/15 transition-all duration-200"
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit Query
            </button>
          </form>
        </div>

        {/* Inbox (visible only when logged in) */}
        {token && (
          <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Inbox className="h-4.5 w-4.5 text-blue-500" />
                Received Queries
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500">{inbox.length}</span>
              </h3>
              <div className="flex items-center gap-3">
                {inbox.length > 0 && (
                  <button
                    onClick={clearAllQueries}
                    className="text-xs font-semibold text-red-500 hover:text-red-600 hover:underline"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={fetchInbox}
                  disabled={isLoadingInbox}
                  className="text-xs font-semibold text-blue-500 hover:text-blue-600 hover:underline disabled:opacity-50"
                >
                  {isLoadingInbox ? 'Syncing...' : 'Refresh'}
                </button>
              </div>
            </div>

            {inboxError && (
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 text-xs mb-4">
                {inboxError}
              </div>
            )}

            {isLoadingInbox && inbox.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3 text-zinc-500">
                <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
                <span className="text-xs">Loading queries from database...</span>
              </div>
            ) : inbox.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3 text-center">
                <Inbox className="h-9 w-9 text-zinc-300 dark:text-zinc-700" />
                <p className="text-xs text-zinc-500 max-w-xs">No queries received yet. Submitted questions from any visitor will appear here.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 max-h-[65vh] overflow-y-auto pr-1">
                {inbox.map(q => (
                  <div key={q.id} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 relative group">
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">{q.subject}</p>
                        <p className="text-[11px] text-blue-500 font-semibold mt-0.5">{q.user || 'Anonymous'}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-mono text-zinc-400 whitespace-nowrap">{formatDate(q.created_at)}</span>
                        <button
                          onClick={() => deleteQuery(q.id)}
                          title="Delete this query"
                          className="p-1.5 rounded-lg text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap break-words">{q.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export { QueryPage };
