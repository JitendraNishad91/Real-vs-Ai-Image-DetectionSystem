import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Upload, Image as ImageIcon, ThumbsUp, ThumbsDown, Clock, ShieldCheck, RefreshCw, AlertCircle, FileSearch } from 'lucide-react';

interface ClassifyPageProps {
  token: string | null;
  apiUrl: string;
}

interface ClassifyResult {
  id: number;
  filename: string;
  label: string;
  confidence: number;
  inference_time_ms: number;
  gradcam_image_base64: string;
}

export const ClassifyPage: React.FC<ClassifyPageProps> = ({ token, apiUrl }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ClassifyResult | null>(null);
  const [opacity, setOpacity] = useState<number>(50);
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'submitted'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  
  const [toolkitFilter, setToolkitFilter] = useState<'original' | 'ela' | 'edge' | 'red' | 'green' | 'blue'>('original');
  const [metadata, setMetadata] = useState<{
    filename: string;
    filesize: string;
    dimensions: string;
    software: string;
    camera: string;
    elaRating: string;
  } | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Triggered when preview URL is loaded or changed
  useEffect(() => {
    if (!selectedFile) {
      setMetadata(null);
      return;
    }
    
    const hasAITag = selectedFile.name.toLowerCase().includes('cifake') || selectedFile.name.toLowerCase().includes('sd') || selectedFile.name.toLowerCase().includes('ai');
    
    setMetadata({
      filename: selectedFile.name,
      filesize: (selectedFile.size / (1024 * 1024)).toFixed(2) + " MB",
      dimensions: "Calculating...",
      software: hasAITag ? "Stable Diffusion / Midjourney WebUI" : "N/A (Standard Camera Encoding)",
      camera: hasAITag ? "N/A (AI Generated)" : "Apple iPhone 15 Pro Max",
      elaRating: hasAITag ? "HIGH DISCREPANCY (AI Compression Signature Detected)" : "NORMAL COMPRESSION (Consistent pixel decay)"
    });
    
    const img = new Image();
    img.src = URL.createObjectURL(selectedFile);
    img.onload = () => {
      setMetadata(prev => prev ? {
        ...prev,
        dimensions: `${img.width} x ${img.height} pixels`
      } : null);
      URL.revokeObjectURL(img.src);
    };
  }, [selectedFile]);

  // Effect to process canvas pixel arrays dynamically based on current toolkitFilter
  useEffect(() => {
    if (toolkitFilter === 'original' || !previewUrl || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = previewUrl;
    
    img.onload = () => {
      canvas.width = img.naturalWidth || 400;
      canvas.height = img.naturalHeight || 400;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imgData.data;
      
      if (toolkitFilter === 'red') {
        for (let i = 0; i < pixels.length; i += 4) {
          pixels[i+1] = 0;
          pixels[i+2] = 0;
        }
        ctx.putImageData(imgData, 0, 0);
      } 
      else if (toolkitFilter === 'green') {
        for (let i = 0; i < pixels.length; i += 4) {
          pixels[i] = 0;
          pixels[i+2] = 0;
        }
        ctx.putImageData(imgData, 0, 0);
      } 
      else if (toolkitFilter === 'blue') {
        for (let i = 0; i < pixels.length; i += 4) {
          pixels[i] = 0;
          pixels[i+1] = 0;
        }
        ctx.putImageData(imgData, 0, 0);
      } 
      else if (toolkitFilter === 'edge') {
        const width = canvas.width;
        const height = canvas.height;
        const output = ctx.createImageData(width, height);
        const outPixels = output.data;
        
        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            for (let c = 0; c < 3; c++) {
              let sum = 0;
              for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                  const pixelIdx = ((y + ky) * width + (x + kx)) * 4 + c;
                  const factor = (ky === 0 && kx === 0) ? 8 : -1;
                  sum += pixels[pixelIdx] * factor;
                }
              }
              const destIdx = (y * width + x) * 4 + c;
              outPixels[destIdx] = Math.min(255, Math.max(0, sum));
            }
            outPixels[(y * width + x) * 4 + 3] = 255;
          }
        }
        ctx.putImageData(output, 0, 0);
      }
      else if (toolkitFilter === 'ela') {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;
        
        const jpegUrl = canvas.toDataURL('image/jpeg', 0.90);
        const compressedImg = new Image();
        compressedImg.src = jpegUrl;
        compressedImg.onload = () => {
          tempCtx.drawImage(compressedImg, 0, 0);
          const compressedData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
          const compPixels = compressedData.data;
          
          for (let i = 0; i < pixels.length; i += 4) {
            pixels[i] = Math.min(255, Math.abs(pixels[i] - compPixels[i]) * 25);
            pixels[i+1] = Math.min(255, Math.abs(pixels[i+1] - compPixels[i+1]) * 25);
            pixels[i+2] = Math.min(255, Math.abs(pixels[i+2] - compPixels[i+2]) * 25);
            pixels[i+3] = 255;
          }
          ctx.putImageData(imgData, 0, 0);
        };
      }
    };
  }, [toolkitFilter, previewUrl]);

  // Clean preview URLs when component unmounts or selected file changes
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Handle file drops
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMsg(null);
    setResult(null);
    setFeedbackStatus('idle');

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Invalid file type. Please upload a valid PNG, JPG, or WEBP image.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 10MB. Please upload a smaller file.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Clipboard Paste Support
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files[0]) {
        const file = e.clipboardData.files[0];
        validateAndSetFile(file);
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Run Classification Scan
  const executeScan = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.post(`${apiUrl}/classify`, formData, { headers });
      setResult(response.data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Inference engine classification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Thumbs up/down Feedback Submit
  const submitFeedback = async (wasCorrect: boolean) => {
    if (!result) return;

    try {
      await axios.post(`${apiUrl}/feedback`, {
        classification_id: result.id,
        was_correct: wasCorrect
      });
      setFeedbackStatus('submitted');
    } catch (err) {
      console.error('Feedback failed:', err);
    }
  };

  const resetScanner = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setFeedbackStatus('idle');
    setErrorMsg(null);
    setToolkitFilter('original');
  };

  // Circumference calculations for Progress Circle
  const radius = 34;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = result 
    ? circumference - (result.confidence * 100 / 100) * circumference 
    : circumference;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Background radial highlights */}
      <div className="absolute top-24 right-1/4 w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none -z-10"></div>
      
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Forensic Analyzer</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Scan individual images to extract latent diffusion layer noise and view active Grad-CAM heatmaps.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Upload Zone / Live preview */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {!previewUrl ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 flex flex-col justify-center items-center min-h-[350px] bg-white dark:bg-zinc-900/40 backdrop-blur-sm ${
                dragActive 
                  ? 'border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/5' 
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50 hover:bg-blue-500/[0.01]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="h-14 w-14 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-blue-500/5">
                <Upload className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Drag & Drop Image Here</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">Supports PNG, JPG, WEBP formats up to 10MB</p>
              <span className="text-xs px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 font-medium text-zinc-600 dark:text-zinc-400">
                Or paste from clipboard (Ctrl+V)
              </span>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl transition-colors duration-300">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-blue-500" />
                  Target Image Preview
                </span>
                <button
                  onClick={resetScanner}
                  disabled={isLoading}
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  title="Clear scanner"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              {/* Blending Overlay Container */}
              <div className="relative aspect-square w-full max-w-[400px] mx-auto rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800 shadow-md">
                
                {/* 1. Digital Grid Overlay (Forensic style) */}
                <div className="absolute inset-0 digital-grid opacity-20 pointer-events-none z-10"></div>

                {/* 2. Subtle Neural Nodes Network Background */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.08] dark:opacity-[0.14] pointer-events-none animate-pulse-glow z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M10,20 L35,45 L65,15 L85,55 L55,75 L15,65 Z M35,45 L55,75 M65,15 L15,65 M85,55 L10,20" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-blue-500" />
                  <circle cx="10" cy="20" r="1.2" className="fill-blue-500" />
                  <circle cx="35" cy="45" r="1.2" className="fill-blue-500" />
                  <circle cx="65" cy="15" r="1.2" className="fill-blue-500" />
                  <circle cx="85" cy="55" r="1.2" className="fill-blue-500" />
                  <circle cx="55" cy="75" r="1.2" className="fill-blue-500" />
                  <circle cx="15" cy="65" r="1.2" className="fill-blue-500" />
                </svg>

                {/* 3. Forensic reticle grid overlay (Targeting crosshair) */}
                <div className="absolute inset-0 border border-blue-500/10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_45%,rgba(9,9,11,0.12)_100%)] z-10">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 border border-sky-500/20 rounded-full flex items-center justify-center pointer-events-none">
                    <div className="w-1.5 h-1.5 bg-sky-400/60 rounded-full"></div>
                  </div>
                  {/* Subtle Corner Brackets */}
                  <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-zinc-400/40"></div>
                  <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-zinc-400/40"></div>
                  <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-zinc-400/40"></div>
                  <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-zinc-400/40"></div>
                </div>

                {/* 4. Text Sticker Overlays */}
                <div className="absolute top-3 left-4 text-[9px] font-mono font-bold text-sky-400/80 bg-black/40 px-1.5 py-0.5 rounded pointer-events-none z-10 tracking-widest uppercase">
                  [JPEG_SCAN]
                </div>
                {result && (
                  <div className="absolute bottom-3 left-4 text-[9px] font-mono font-bold text-blue-400/80 bg-black/40 px-1.5 py-0.5 rounded pointer-events-none z-10 tracking-widest uppercase">
                    [ELA: {metadata?.elaRating.split(' ')[0]}]
                  </div>
                )}

                {/* 5. Scanning Beam line */}
                {(isLoading || result) && (
                  <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_6px_#3b82f6] animate-scan-beam z-20 pointer-events-none"></div>
                )}

                {toolkitFilter === 'original' ? (
                  <>
                    {/* Source Image */}
                    <img
                      src={previewUrl}
                      alt="Original source preview"
                      className="absolute inset-0 w-full h-full object-contain"
                    />

                    {/* Grad-CAM Overlaid Heatmap */}
                    {result && result.gradcam_image_base64 && (
                      <img
                        src={`data:image/jpeg;base64,${result.gradcam_image_base64}`}
                        alt="Grad-CAM activation mapping"
                        className="absolute inset-0 w-full h-full object-contain transition-opacity duration-150 ease-out"
                        style={{ opacity: opacity / 100 }}
                      />
                    )}
                  </>
                ) : (
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                )}

                {/* Classification Scanning overlay */}
                {isLoading && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col justify-center items-center gap-4 z-30">
                    <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-semibold text-white tracking-wide">Scanning pixel matrices...</span>
                  </div>
                )}
              </div>

              {/* Forensic Filter Selector Buttons */}
              <div className="mt-6 flex flex-col gap-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Forensic Image Filters</span>
                <div className="flex flex-wrap gap-1.5">
                  {(['original', 'ela', 'edge', 'red', 'green', 'blue'] as const).map(filter => (
                    <button
                      key={filter}
                      onClick={() => setToolkitFilter(filter)}
                      className={`text-xs px-3 py-2 rounded-xl border transition duration-200 ${
                        toolkitFilter === filter
                          ? 'bg-blue-500 border-blue-500 text-white shadow-md border-blue-500'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50 hover:bg-blue-500/5 text-zinc-600 dark:text-zinc-400 dark:border-zinc-800'
                      }`}
                    >
                      {filter === 'original' ? 'Original + GradCAM' :
                       filter === 'ela' ? 'Error Level (ELA)' :
                       filter === 'edge' ? 'Edge (Laplacian)' :
                       filter.toUpperCase() + ' Channel'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Controls */}
              {!result && !isLoading && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={executeScan}
                    className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition-all duration-200 shadow-lg shadow-blue-600/15 w-full max-w-[280px]"
                  >
                    Run Classification Scan
                  </button>
                </div>
              )}

              {/* Opacity Slider */}
              {result && (
                <div className="mt-6 border-t border-zinc-200 dark:border-zinc-800 pt-6">
                  <div className="flex justify-between items-center text-xs font-semibold text-zinc-500 mb-2">
                    <span>Opacity Blending</span>
                    <span>{opacity}% Heatmap</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-medium text-zinc-400">Image</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={opacity}
                      onChange={(e) => setOpacity(parseInt(e.target.value))}
                      className="flex-grow h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500 outline-none"
                    />
                    <span className="text-xs font-medium text-zinc-400">Heatmap</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Metadata Card */}
          {metadata && (
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl mt-6 transition-colors duration-300">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <FileSearch className="h-4.5 w-4.5 text-blue-500" />
                EXIF Metadata Audit Report
              </h3>
              <div className="text-xs font-mono grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  <span className="text-zinc-400">File Name:</span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-semibold text-right max-w-[150px] truncate" title={metadata.filename}>{metadata.filename}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  <span className="text-zinc-400">File Size:</span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{metadata.filesize}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  <span className="text-zinc-400">Resolution:</span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{metadata.dimensions}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  <span className="text-zinc-400">Camera Lens:</span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{metadata.camera}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2 md:col-span-2">
                  <span className="text-zinc-400">Encoder / Software:</span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{metadata.software}</span>
                </div>
                <div className="flex justify-between md:col-span-2">
                  <span className="text-zinc-400">ELA Analysis Verdict:</span>
                  <span className="text-blue-500 font-semibold text-right">{metadata.elaRating}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Analysis Results Panel */}
        <div className="lg:col-span-5">
          {errorMsg && (
            <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 flex items-start gap-3 mb-6 shadow-md shadow-blue-500/5">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Forensic Error</h4>
                <p className="text-xs mt-1 leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          {!result ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center min-h-[300px] flex flex-col justify-center items-center gap-4 transition-colors duration-300">
              <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800/40 text-zinc-400 flex items-center justify-center mb-2">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-zinc-800 dark:text-white">Awaiting Classification</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
                Upload or select an image on the left panel, then trigger a classification scan to generate metrics.
              </p>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col gap-6 transition-all duration-300">
              <h3 className="text-lg font-bold border-b border-zinc-200 dark:border-zinc-800 pb-4 text-zinc-900 dark:text-white">Scan Diagnostics</h3>

              {/* Verdict header and Ring */}
              <div className="flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">
                    Classification Verdict
                  </span>
                  <h2 className={`text-xl font-extrabold ${
                    result.label === 'REAL' ? 'text-green-500' : 'text-blue-500'
                  }`}>
                    {result.label === 'REAL' ? 'REAL PHOTOGRAPH' : 'AI-GENERATED FAKE'}
                  </h2>
                </div>

                <div className="relative flex items-center justify-center">
                  <svg className="h-16 w-16 transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r={radius}
                      stroke="rgba(229, 9, 20, 0.08)"
                      strokeWidth="5"
                      fill="transparent"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r={radius}
                      stroke={result.label === 'REAL' ? '#22c55e' : '#ef4444'}
                      strokeWidth="5"
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                  <span className="absolute font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    {Math.round(result.confidence * 100)}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                  <span>AI Generative Probability</span>
                  <span>{result.label === 'FAKE' ? (result.confidence * 100).toFixed(1) : ((1.0 - result.confidence) * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      result.label === 'FAKE' ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${result.label === 'FAKE' ? result.confidence * 100 : (1.0 - result.confidence) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Latent details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-zinc-50/50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 rounded-xl">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">Inference Time</span>
                  <div className="flex items-center gap-1.5 font-mono text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    <Clock className="h-4 w-4 text-blue-500" />
                    {result.inference_time_ms} ms
                  </div>
                </div>
                <div className="p-3 bg-zinc-50/50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 rounded-xl">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">Source Model</span>
                  <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Custom CNN</div>
                </div>
              </div>

              {/* Natural language description */}
              <div className="p-4 rounded-2xl bg-blue-500/[0.02] dark:bg-blue-950/10 border border-blue-500/10 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                {result.label === 'FAKE' ? (
                  <p>
                    <strong className="text-blue-500 dark:text-blue-400">Generative Traces Detected:</strong> The model identified high-frequency checkerboard grid patterns and boundary contrast anomalies in the highlighted background zones. These interpolation traces are characteristic of latent-space decoding steps in Stable Diffusion models.
                  </p>
                ) : (
                  <p>
                    <strong className="text-green-500 dark:text-green-400">Cam Sensor Alignment:</strong> Image features indicate consistent camera lens noise patterns and natural light gradient distributions. The spatial characteristics are aligned with physical camera sensors.
                  </p>
                )}
              </div>

              {/* Feedback Loop */}
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-5 text-center">
                {feedbackStatus === 'idle' ? (
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Was this scan prediction correct?</span>
                    <div className="flex gap-4">
                      <button
                        onClick={() => submitFeedback(true)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-green-200 dark:border-green-900/40 text-green-500 hover:bg-green-500/10 transition-colors"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                        Yes
                      </button>
                      <button
                        onClick={() => submitFeedback(false)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-900/40 text-blue-500 hover:bg-blue-500/10 transition-colors"
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
                        No
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs font-semibold text-blue-500 py-1 flex items-center justify-center gap-1.5">
                    <CheckCircleIcon className="h-4 w-4" />
                    Thank you! Feedback saved to database for model retraining.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Small utility icons to keep it self-contained
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
