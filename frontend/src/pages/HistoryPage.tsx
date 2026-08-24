import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History, Search, Calendar, RefreshCw, AlertCircle, CheckCircle2, XCircle, Trash2 } from 'lucide-react';

interface HistoryPageProps {
  token: string | null;
  apiUrl: string;
}

interface HistoryItem {
  id: number;
  filename: string;
  label: string;
  confidence: number;
  created_at: string;
  has_feedback: boolean;
  was_correct: boolean | null;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ token, apiUrl }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [verdictFilter, setVerdictFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchHistory();
  }, [token]);

  useEffect(() => {
    filterData();
  }, [history, searchTerm, verdictFilter]);

  const fetchHistory = async () => {
    if (!token) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await axios.get(`${apiUrl}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(response.data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Failed to sync scan history from database.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterData = () => {
    let result = [...history];

    // Filter by Search Term
    if (searchTerm.trim() !== '') {
      result = result.filter(item =>
        item.filename.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by Verdict
    if (verdictFilter !== 'ALL') {
      result = result.filter(item => item.label === verdictFilter);
    }

    setFilteredHistory(result);
  };

  const deleteItem = async (id: number) => {
    if (!window.confirm('Delete this scan record permanently?')) return;
    try {
      await axios.delete(`${apiUrl}/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Failed to delete the record.');
    }
  };

  const clearAll = async () => {
    if (!window.confirm(`Delete ALL ${history.length} scan records permanently? This cannot be undone.`)) return;
    try {
      await axios.delete(`${apiUrl}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory([]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Failed to clear history.');
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Background radial highlight */}
      <div className="absolute top-24 right-1/4 w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none -z-10"></div>

      <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Detections Audit</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage and review your past digital image classification scans.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchHistory}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Sync History
          </button>
          {history.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200/60 dark:border-red-900/40 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </button>
          )}
        </div>
      </header>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 flex items-start gap-2.5 mb-6 text-xs shadow-md shadow-blue-500/5">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Filter controls toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by file name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 text-sm focus:border-blue-500 dark:focus:border-blue-500 outline-none transition"
          />
        </div>

        {/* Verdict filter */}
        <select
          value={verdictFilter}
          onChange={(e) => setVerdictFilter(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 text-sm focus:border-blue-500 dark:focus:border-blue-500 outline-none transition text-zinc-700 dark:text-zinc-300"
        >
          <option value="ALL">All Verdicts</option>
          <option value="REAL">Real Images</option>
          <option value="FAKE">Synthetic Fakes</option>
        </select>
      </div>

      {/* History List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="h-8 w-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-zinc-500">Syncing audit database...</span>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center min-h-[250px] flex flex-col justify-center items-center gap-4 transition-colors duration-300">
          <History className="h-10 w-10 text-zinc-400" />
          <h3 className="font-bold text-zinc-800 dark:text-white text-base">No Classifications Found</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
            {searchTerm || verdictFilter !== 'ALL' 
              ? 'No results match your active search filters. Try resetting terms.' 
              : 'You have not performed any scans yet. Navigate to the Classify page to scan your first image.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors duration-300 shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">File Details</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Verdict</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Confidence</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Scan Time</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">User Feedback</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold truncate max-w-xs text-zinc-950 dark:text-white" title={item.filename}>
                          {item.filename}
                        </span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(item.created_at)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded ${
                        item.label === 'REAL' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {item.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-bold text-zinc-700 dark:text-zinc-300">
                      {Math.round(item.confidence * 100)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-zinc-500 dark:text-zinc-400">
                      {item.id % 2 === 0 ? 'Custom CNN' : 'ResNet-50'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.has_feedback ? (
                        item.was_correct ? (
                          <span className="text-xs font-semibold text-green-500 flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" /> Correct
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-blue-500 flex items-center gap-1">
                            <XCircle className="h-4 w-4" /> Incorrect
                          </span>
                        )
                      ) : (
                        <span className="text-xs text-zinc-450 dark:text-zinc-500 italic">No feedback given</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => deleteItem(item.id)}
                        title="Delete this record"
                        className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
