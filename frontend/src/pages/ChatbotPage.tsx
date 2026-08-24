import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, MessageSquare, Terminal } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const FORENSIC_KNOWLEDGE_BASE: Record<string, string> = {
  "what is grad-cam": 
    "**Grad-CAM (Gradient-weighted Class Activation Mapping)** is an explainability technique for deep networks. " +
    "It uses the gradients of the target class score flowing into the final convolutional layer of our Custom CNN. " +
    "By weighting and averaging the activation maps with these gradients, it creates a coarse 2D heatmap. " +
    "Red zones highlight areas of high activation (where the model saw AI artifacts like checkerboards), while Blue zones show background regions.",
  
  "what is cifake": 
    "**CIFAKE** is a balanced digital forensic dataset consisting of **120,000 images** (32x32 resolution). " +
    "It includes 60,000 real photographic images from the classic CIFAR-10 dataset, and 60,000 synthetic counterparts " +
    "generated using **Stable Diffusion v1.4** based on the CIFAR-10 class text descriptions. It is a key benchmark for detecting diffusion artifacts.",
  
  "how to detect stable diffusion": 
    "Stable Diffusion models generate images from text using latent-space decoders. During upsampling steps, they leave subtle " +
    "**high-frequency checkerboard grid patterns** and edge anomalies due to deconvolution. Camera sensors, on the other hand, leave " +
    "sensor-specific noise (PRNU). RealCheck AI utilizes Convolutional layers to capture these mathematical noise grids.",
  
  "what is exif": 
    "**EXIF (Exchangeable Image File Format)** metadata is header information stored inside JPEGs, PNGs, and RAW photos. " +
    "It logs hardware details (e.g., Apple iPhone 15 camera, Sony lens model), location GPS coordinate tags, exposure settings (shutter speed, ISO), and editing history. " +
    "AI-generated fakes usually contain NO EXIF data or show software tags like 'Stable Diffusion' or 'Adobe Photoshop' instead of camera lens hardware details.",
  
  "how to use forensic toolkit": 
    "Our **Forensic Toolkit** allows you to perform manual image checks:\n" +
    "1. **Error Level Analysis (ELA)**: Re-saves the image at 95% quality and calculates pixel differences. AI composites or edit splices show varying compression brightness.\n" +
    "2. **Laplacian Edge Filter**: Highlights high-frequency outlines. Checkerboard artifacts from diffusion decoders show up as rigid grid textures in smooth sky or face areas.\n" +
    "3. **RGB Channels**: Isolates Red, Green, or Blue channels to check for color sensor interpolation errors.",
  
  "tell me about the models": 
    "RealCheck AI implements a dual-model benchmark:\n" +
    "1. **Custom CNN (Stage 0 Specification)**: A custom 6-layer convolutional model built from scratch. It is lightweight, fast, and optimized for 32x32 grid analysis, achieving 93.45% accuracy.\n" +
    "2. **ResNet-50 Transfer Learning**: A deep residual network pre-trained on ImageNet. Inputs are upscaled to 128x128. It achieves superior accuracy (96.20%) but has larger file sizes and computing latency."
};

export const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hello! I am your ForensicAI Assistant. Ask me anything about AI image classification, CIFAKE dataset parameters, Grad-CAM overlays, or how to use the Forensic Toolkit filters.",
      timestamp: new Date()
    }
  ]);
  const [inputVal, setInputVal] = useState<string>('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text: string) => {
    if (text.trim() === '') return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');

    // Simulate bot thinking and reply
    setTimeout(() => {
      const cleanInput = text.toLowerCase().trim();
      let responseText = "I'm sorry, I don't have direct training data on that query. Try asking one of the suggested prompts below, such as: 'What is Grad-CAM?', 'How to detect Stable Diffusion fakes?', or 'What is EXIF metadata?'";
      
      // Match keywords in our forensic knowledge base
      for (const key of Object.keys(FORENSIC_KNOWLEDGE_BASE)) {
        if (cleanInput.includes(key)) {
          responseText = FORENSIC_KNOWLEDGE_BASE[key];
          break;
        }
      }

      const botMsg: Message = {
        id: Math.random().toString(),
        sender: 'bot',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[80vh] flex flex-col gap-6">
      {/* Background glow */}
      <div className="absolute top-24 left-1/3 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none -z-10"></div>

      <header className="flex items-center gap-3">
        <div className="h-10 w-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/30 shadow-md">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">ForensicAI Chat Assistant</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Ask questions and learn how neural networks analyze generative noise patterns.</p>
        </div>
      </header>

      {/* Main Terminal Chat Panel */}
      <div className="flex-grow flex flex-col glass-card border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-3xl overflow-hidden bg-white dark:bg-zinc-900/40">
        
        {/* Terminal Header */}
        <div className="bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800 px-6 py-3 flex items-center justify-between text-xs text-zinc-500 font-semibold font-mono">
          <span className="flex items-center gap-1.5">
            <Terminal className="h-4 w-4 text-blue-500" />
            forensic_assistant_v0.1.0_terminal
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            Agent Online
          </span>
        </div>

        {/* Message Logs */}
        <div className="flex-grow p-6 overflow-y-auto flex flex-col gap-4 max-h-[450px]">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${
                msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'
              }`}
            >
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                msg.sender === 'user' 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/10' 
                  : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400'
              }`}>
                {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 rounded-tl-none'
              }`}>
                {/* Basic Markdown Parser for Bot bold text/lists */}
                {msg.text.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 last:mb-0">
                    {line.split('**').map((part, index) => 
                      index % 2 === 1 ? <strong key={index} className="font-extrabold text-blue-950 dark:text-white">{part}</strong> : part
                    )}
                  </p>
                ))}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Suggested Prompts Panel */}
        <div className="px-6 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-blue-500 animate-bounce" />
            Suggestions:
          </span>
          {Object.keys(FORENSIC_KNOWLEDGE_BASE).map(key => (
            <button
              key={key}
              onClick={() => handleSend(key)}
              className="text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-blue-500/50 hover:bg-blue-500/5 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition duration-150 ease-out"
            >
              {key.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputVal);
          }}
          className="p-4 bg-zinc-50 dark:bg-zinc-950/40 border-t border-zinc-200 dark:border-zinc-800 flex gap-3"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type a forensic question (e.g. 'What is Grad-CAM?')..."
            className="flex-grow px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#17120d]/50 text-sm focus:border-blue-500 dark:focus:border-blue-500 outline-none transition duration-200 text-zinc-800 dark:text-white"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/10 hover:shadow-blue-600/25 transition duration-200"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </form>

      </div>
    </div>
  );
};
