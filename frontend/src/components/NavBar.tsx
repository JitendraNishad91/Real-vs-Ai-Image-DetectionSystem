import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck, LogOut, LogIn, Upload, Layers, BarChart2,
  MessageSquare, User, ChevronDown, Inbox, Search, Code
} from 'lucide-react';

interface NavBarProps {
  token: string | null;
  username: string | null;
  onLogout: () => void;
}

export const NavBar: React.FC<NavBarProps> = ({
  token,
  username,
  onLogout,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const profileRef = React.useRef<HTMLDivElement>(null);

  const currentPath = location.pathname;

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  const navigateTo = (path: string) => {
    setIsProfileOpen(false);
    navigate(path);
  };

  const navLinkClass = (path: string) =>
    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
      currentPath === path
        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/10'
        : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
    }`;

  return (
    <nav className={`sticky top-0 z-50 w-full border-b transition-all duration-300 backdrop-blur-md ${
      isScrolled
        ? 'border-blue-500/20 bg-white/80 dark:bg-[#0c1322]/80 shadow-[0_4px_30px_rgba(59,130,246,0.06)]'
        : 'border-transparent bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="h-9 w-9 bg-gradient-to-tr from-blue-500 to-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent">
              RealCheck <span className="text-blue-500">AI</span>
            </span>
          </div>

          {/* Tab Navigation Links */}
          <div className="hidden md:flex space-x-1 items-center">
            <button onClick={() => navigateTo('/classify')} className={navLinkClass('/classify')}>
              <Upload className="h-4 w-4" />
              Classify
            </button>
            {token && (
              <button onClick={() => navigateTo('/batch')} className={navLinkClass('/batch')}>
                <Layers className="h-4 w-4" />
                Batch Scan
              </button>
            )}
            {token && (
              <button onClick={() => navigateTo('/chatbot')} className={navLinkClass('/chatbot')}>
                <MessageSquare className="h-4 w-4" />
                Forensic Chat
              </button>
            )}
            <button onClick={() => navigateTo('/insights')} className={navLinkClass('/insights')}>
              <BarChart2 className="h-4 w-4" />
              Model Insights
            </button>
          </div>

          {/* User Section & Theme Toggle */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {token && username ? (
              /* ---- Modern Profile Dropdown (right corner) ---- */
              <div className="relative" ref={profileRef}>
                {/* Avatar trigger button */}
                <button
                  onClick={() => setIsProfileOpen((v) => !v)}
                  className={`flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full transition-all duration-200 ${
                    isProfileOpen
                      ? 'bg-blue-100 dark:bg-blue-950/40'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                  }`}
                  title="Open profile menu"
                >
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-sky-500 flex items-center justify-center ring-2 ring-blue-500/25 shadow-md shadow-blue-500/20">
                    <span className="text-white font-bold text-sm uppercase select-none">
                      {username.charAt(0)}
                    </span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-zinc-500 dark:text-zinc-400 transition-transform duration-200 ${
                      isProfileOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown panel */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-72 rounded-2xl bg-white dark:bg-[#1a2540] border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-black/10 overflow-hidden origin-top-right animate-in fade-in zoom-in-95 duration-150">
                    {/* Header: user identity */}
                    <div className="p-4 bg-gradient-to-br from-blue-500/10 via-sky-500/5 to-transparent border-b border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-blue-500 to-sky-500 flex items-center justify-center ring-2 ring-blue-500/30 flex-shrink-0">
                          <span className="text-white font-bold text-lg uppercase select-none">
                            {username.charAt(0)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                            {username}
                          </p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block"></span>
                            Signed in
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu buttons: each opens its detail section */}
                    <div className="p-2 flex flex-col">
                      <button
                        onClick={() => navigateTo('/profile')}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                          currentPath === '/profile'
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                            : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                        }`}
                      >
                        <User className="h-4 w-4 text-blue-500" />
                        My Profile
                      </button>
                      <button
                        onClick={() => navigateTo('/query')}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                          currentPath === '/query'
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                            : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                        }`}
                      >
                        <Inbox className="h-4 w-4 text-sky-500" />
                        Queries
                      </button>
                      <button
                        onClick={() => navigateTo('/history')}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                          currentPath === '/history'
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                            : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                        }`}
                      >
                        <Search className="h-4 w-4 text-blue-500" />
                        Scan History
                      </button>
                      <button
                        onClick={() => navigateTo('/contact')}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                          currentPath === '/contact'
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                            : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                        }`}
                      >
                        <Code className="h-4 w-4 text-blue-500" />
                        Contact Developers
                      </button>
                    </div>

                    {/* Footer: logout */}
                    <div className="border-t border-zinc-100 dark:border-zinc-800 p-2">
                      <button
                        onClick={() => { setIsProfileOpen(false); onLogout(); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-150"
                      >
                        <LogOut className="h-4 w-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigateTo('/auth')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 shadow-md shadow-blue-600/10 hover:shadow-blue-600/20"
              >
                <LogIn className="h-4 w-4" />
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
