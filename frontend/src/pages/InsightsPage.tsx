import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { BarChart3, Database, ShieldCheck, AlertCircle, Info } from 'lucide-react';

interface InsightsPageProps {
  apiUrl: string;
}

interface ModelInfo {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  confusion_matrix: number[][];
  roc_curve: Array<{ fpr: number; tpr: number }>;
  dataset_info: {
    name: string;
    size: string;
    split: string;
    methodology: string;
    source: string;
  };
}

export const InsightsPage: React.FC<InsightsPageProps> = ({ apiUrl }) => {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchModelInfo();
  }, []);

  const fetchModelInfo = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await axios.get(`${apiUrl}/model-info`);
      const data = response.data;
      if (!data || typeof data !== 'object' || !Array.isArray(data.confusion_matrix)) {
        setErrorMsg('Server se galat format ka data mila. Thodi der baad try karo.');
      } else {
        setModelInfo(data);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to sync model training metrics from backend server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Background glowing highlights */}
      <div className="absolute top-24 left-1/4 w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none -z-10"></div>

      <header className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Model Diagnostics</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Quantitative accuracy benchmarks, confusion matrix grids, and ROC curves trained on CIFAKE.</p>
      </header>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 flex items-start gap-2.5 mb-6 text-xs shadow-md shadow-blue-500/5">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="h-8 w-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-zinc-500">Syncing calibration metrics...</span>
        </div>
      ) : !modelInfo ? (
        <div className="text-center py-10 text-zinc-450 dark:text-zinc-500">No model metadata available.</div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Key Metrics grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold block mb-1">Accuracy</span>
              <div className="text-3xl font-extrabold text-blue-500 font-mono">{modelInfo.accuracy}%</div>
              <p className="text-[10px] text-zinc-450 dark:text-zinc-555 mt-2">Overall correctly classified ratio</p>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold block mb-1">Precision</span>
              <div className="text-3xl font-extrabold text-blue-500 font-mono">{modelInfo.precision}%</div>
              <p className="text-[10px] text-zinc-450 dark:text-zinc-555 mt-2">Proportion of flagged fakes that are AI-generated</p>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold block mb-1">Recall</span>
              <div className="text-3xl font-extrabold text-blue-500 font-mono">{modelInfo.recall}%</div>
              <p className="text-[10px] text-zinc-450 dark:text-zinc-555 mt-2">Proportion of AI images correctly identified</p>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold block mb-1">F1-Score</span>
              <div className="text-3xl font-extrabold text-blue-500 font-mono">{modelInfo.f1_score}%</div>
              <p className="text-[10px] text-zinc-450 dark:text-zinc-555 mt-2">Harmonic mean of precision and recall</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* ROC Curve Chart */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col gap-4">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="h-4.5 w-4.5 text-blue-500" />
                Receiver Operating Characteristic (ROC)
              </h3>
              <div className="h-[280px] w-full text-xs font-mono">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={modelInfo.roc_curve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a20" />
                    <XAxis dataKey="fpr" type="number" domain={[0, 1]} ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]} label={{ value: 'False Positive Rate (FPR)', position: 'insideBottom', offset: -5 }} />
                    <YAxis dataKey="tpr" type="number" domain={[0, 1]} ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]} label={{ value: 'True Positive Rate (TPR)', angle: -90, position: 'insideLeft', offset: 10 }} />
                    <Tooltip contentStyle={{ background: '#101013', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }} />
                    <Line type="monotone" dataKey="tpr" name="Custom CNN (AUC: 0.98)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 2 }} activeDot={{ r: 6 }} />
                    {/* Diagonal baseline line */}
                    <Line type="linear" data={[ {fpr: 0, tpr: 0}, {fpr: 1, tpr: 1} ]} dataKey="tpr" stroke="#666" strokeDasharray="5 5" name="Random Classifier (AUC: 0.5)" dot={false} activeDot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Confusion Matrix Block */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col gap-4">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-blue-500" />
                Validation Confusion Matrix
              </h3>
              
              <div className="grid grid-cols-2 gap-4 flex-grow justify-center items-center py-4 max-w-[320px] mx-auto w-full">
                {/* TN */}
                <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-center">
                  <span className="text-[10px] font-bold text-green-500 uppercase block mb-1">True Negative</span>
                  <div className="text-xl font-bold font-mono text-green-600 dark:text-green-400">{modelInfo.confusion_matrix[0][0]}</div>
                  <span className="text-[9px] text-zinc-450 block mt-1">Real correctly marked</span>
                </div>
                {/* FP */}
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-center">
                  <span className="text-[10px] font-bold text-blue-500 uppercase block mb-1">False Positive</span>
                  <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">{modelInfo.confusion_matrix[0][1]}</div>
                  <span className="text-[9px] text-zinc-450 block mt-1">Real flagged as Fake</span>
                </div>
                {/* FN */}
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-center">
                  <span className="text-[10px] font-bold text-blue-500 uppercase block mb-1">False Negative</span>
                  <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">{modelInfo.confusion_matrix[1][0]}</div>
                  <span className="text-[9px] text-zinc-450 block mt-1">Fake flagged as Real</span>
                </div>
                {/* TP */}
                <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-center">
                  <span className="text-[10px] font-bold text-green-500 uppercase block mb-1">True Positive</span>
                  <div className="text-xl font-bold font-mono text-green-600 dark:text-green-400">{modelInfo.confusion_matrix[1][1]}</div>
                  <span className="text-[9px] text-zinc-450 block mt-1">Fake correctly marked</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dataset Info card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col gap-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <Database className="h-4.5 w-4.5 text-blue-500" />
              Dataset Benchmark & Methodology
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-zinc-500 font-semibold">Dataset Identifier</span>
                <span className="text-zinc-800 dark:text-zinc-300 font-semibold">{modelInfo.dataset_info.name}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-zinc-500 font-semibold">Dataset Scale</span>
                <span className="text-zinc-800 dark:text-zinc-300 font-semibold">{modelInfo.dataset_info.size}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-zinc-500 font-semibold">Train/Test Splits</span>
                <span className="text-zinc-800 dark:text-zinc-300 font-semibold">{modelInfo.dataset_info.split}</span>
              </div>
            </div>

            <div className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 flex items-start gap-2 bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/40">
              <Info className="h-4.5 w-4.5 text-blue-400 flex-shrink-0 mt-0.5" />
              <p>{modelInfo.dataset_info.methodology}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
