import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { LandingPage } from './pages/LandingPage';
import { ClassifyPage } from './pages/ClassifyPage';
import { BatchPage } from './pages/BatchPage';
import { HistoryPage } from './pages/HistoryPage';
import { InsightsPage } from './pages/InsightsPage';
import { AuthPages } from './pages/AuthPages';
import { ChatbotPage } from './pages/ChatbotPage';
import { QueryPage } from './pages/QueryPage';
import { ProfilePage } from './pages/ProfilePage';
import { ContactPage } from './pages/ContactPage';

// Setup local api binding address
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Guard: redirect guests to /auth for protected sections
const RequireAuth: React.FC<{ token: string | null; children: React.ReactNode }> = ({ token, children }) => {
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);

  // Load session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('realcheck_token');
    const savedUser = localStorage.getItem('realcheck_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUsername(savedUser);
    }
    setIsAuthReady(true);
  }, []);

  const handleAuthSuccess = (newToken: string, newUser: string) => {
    setToken(newToken);
    setUsername(newUser);
    localStorage.setItem('realcheck_token', newToken);
    localStorage.setItem('realcheck_user', newUser);
    navigate('/classify'); // Redirect to scan console on login
  };

  const handleLogout = () => {
    setToken(null);
    setUsername(null);
    localStorage.removeItem('realcheck_token');
    localStorage.removeItem('realcheck_user');
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#ffffff] dark:bg-[#0c1322] text-zinc-900 dark:text-zinc-100 transition-colors duration-300 digital-grid">
      <NavBar token={token} username={username} onLogout={handleLogout} />
      <main className="flex-grow">
        {isAuthReady && (
          <Routes>
            <Route path="/" element={<LandingPage onStart={() => navigate('/classify')} />} />
            <Route path="/classify" element={<ClassifyPage token={token} apiUrl={API_URL} />} />
            <Route path="/batch" element={<RequireAuth token={token}><BatchPage token={token} apiUrl={API_URL} /></RequireAuth>} />
            <Route path="/history" element={<RequireAuth token={token}><HistoryPage token={token} apiUrl={API_URL} /></RequireAuth>} />
            <Route path="/chatbot" element={<RequireAuth token={token}><ChatbotPage /></RequireAuth>} />
            <Route path="/insights" element={<InsightsPage apiUrl={API_URL} />} />
            <Route path="/query" element={<QueryPage apiUrl={API_URL} token={token} />} />
            <Route path="/profile" element={<RequireAuth token={token}><ProfilePage token={token} apiUrl={API_URL} /></RequireAuth>} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/auth" element={
              token
                ? <Navigate to="/classify" replace />
                : <AuthPages apiUrl={API_URL} onAuthSuccess={handleAuthSuccess} onContinueGuest={() => navigate('/classify')} />
            } />
            {/* Fallback: unknown routes go home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
