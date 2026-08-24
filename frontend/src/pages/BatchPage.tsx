import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Layers, Eye, RefreshCw, AlertCircle } from 'lucide-react';

interface BatchPageProps {
  token: string | null;
  apiUrl: string;
}

interface BatchResult {
  id: number;
  filename: string;
  label: string;
  confidence: number;
  inference_time_ms: number;
  gradcam_image_base64: string;
  previewUrl: string;
}

export const BatchPage: React.FC<BatchPageProps> = ({ token, apiUrl }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  
  const [activeGradCam, setActiveGradCam] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (files: File[]) => {
    setErrorMsg(null);
    setResults([]);
    
    // Filter non-images and restrict to 10 files max for performance
    const validImageFiles = files.filter(f => f.type.startsWith('image/')).slice(0, 10);
    
    if (validImageFiles.length === 0) {
      setErrorMsg('No valid image files detected. Please upload JPG, PNG, or WEBP images.');
      return;
    }

    if (files.length > 10) {
      setErrorMsg('Batch size limited to 10 images for performance optimization.');
    }

    setSelectedFiles(validImageFiles);
    setPreviews(validImageFiles.map(f => URL.createObjectURL(f)));
  };

  // Run Batch Scan
  const runBatchScan = async () => {
    if (selectedFiles.length === 0) return;
    setIsLoading(true);
    setErrorMsg(null);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Call individual classify endpoint concurrently
    const scanPromises = selectedFiles.map(async (file, idx) => {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await axios.post(`${apiUrl}/classify`, formData, { headers });
        return {
          ...response.data,
          previewUrl: previews[idx]
        };
      } catch (err) {
        console.error(`Inference failed on index ${idx}:`, err);
        return {
          id: -1 - idx,
          filename: file.name,
          label: 'ERROR',
          confidence: 0,
          inference_time_ms: 0,
          gradcam_image_base64: '',
          previewUrl: previews[idx]
        };
      }
    });

    try {
      const scanResults = await Promise.all(scanPromises);
      setResults(scanResults);
      addLog(`Batch scan finished. Processed ${scanResults.length} images.`);
    } catch (err: any) {
      setErrorMsg('Failed to process batch upload requests. Please check connectivity.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetBatch = () => {
    // Revoke URL objects to prevent memory leak
    previews.forEach(url => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPreviews([]);
    setResults([]);
    setErrorMsg(null);
    setActiveGradCam(null);
  };

  const addLog = (msg: string) => {
    console.log(`[BATCH] ${msg}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Background radial highlights */}
      <div className="absolute top-24 left-1/4 w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none -z-10"></div>

      <header className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Batch Scanner</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Upload multiple images at once to run parallel neural network checks and audit results in a matrix view.</p>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-col gap-6">
        {selectedFiles.length === 0 ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 flex flex-col justify-center items-center min-h-[300px] bg-white dark:bg-zinc-900/40 backdrop-blur-sm ${
              dragActive 
                ? 'border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/5' 
                : 'border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50 hover:bg-blue-500/[0.01]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="h-14 w-14 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-blue-500/5">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Drag & Drop Batch Images</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Select up to 10 images concurrently (PNG, JPG, WEBP)</p>
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl transition-colors duration-300">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-blue-500" />
                Selected Batch ({selectedFiles.length} images)
              </span>
              <button
                onClick={resetBatch}
                disabled={isLoading}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Clear batch"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 flex items-start gap-2.5 mb-6 text-xs">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}

            {/* Results Grid / Previews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {previews.map((preview, index) => {
                const file = selectedFiles[index];
                const res = results.find(r => r.filename === file.name);

                return (
                  <div key={index} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 flex flex-col gap-4 relative">
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-950/50">
                      <img src={preview} alt="file preview" className="absolute inset-0 w-full h-full object-cover" />
                      
                      {/* Grad-CAM popup overlay button */}
                      {res && res.gradcam_image_base64 && (
                        <button
                          onClick={() => setActiveGradCam(res.gradcam_image_base64)}
                          className="absolute bottom-2 right-2 p-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white transition-all shadow-md"
                          title="View Grad-CAM overlay map"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}

                      {/* Mini Scanning spinner */}
                      {isLoading && !res && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                          <div className="h-8 w-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="text-xs font-semibold truncate text-zinc-700 dark:text-zinc-300" title={file.name}>
                        {file.name}
                      </div>

                      {/* Display Scan results */}
                      {res && (
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
                          {res.label === 'ERROR' ? (
                            <span className="text-[10px] font-bold text-red-500 uppercase">Scan Failed</span>
                          ) : (
                            <>
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                                res.label === 'REAL' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                              }`}>
                                {res.label}
                              </span>
                              <span className="font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                {Math.round(res.confidence * 100)}% Match
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions panel */}
            {results.length === 0 && !isLoading && (
              <div className="mt-8 flex justify-center border-t border-zinc-200 dark:border-zinc-800 pt-6">
                <button
                  onClick={runBatchScan}
                  className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition-all duration-200 shadow-lg shadow-blue-600/15 w-full max-w-[280px]"
                >
                  Start Batch Processing
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grad-CAM Heatmap Large Overlaid Modal */}
      {activeGradCam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative max-w-xl w-full bg-white dark:bg-[#17120d] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center">
            <h3 className="font-bold text-zinc-900 dark:text-white mb-4 text-center">Batch Diagnostic: Grad-CAM Overlay</h3>
            <div className="relative aspect-square w-full rounded-2xl bg-zinc-950 border border-zinc-800 shadow-inner">
              <img
                src={`data:image/jpeg;base64,${activeGradCam}`}
                alt="Large Grad-CAM activation heatmap overlay"
                className="w-full h-full object-contain"
              />
            </div>
            <button
              onClick={() => setActiveGradCam(null)}
              className="mt-6 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
            >
              Close Diagnostic
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
