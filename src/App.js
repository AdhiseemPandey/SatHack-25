import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import HomePage from './components/HomePage';
import EmailScannerPage from './components/EmailScannerPage';
import TransactionScannerPage from './components/TransactionScannerPage';
import DailyUsageScannerPage from './components/DailyUsageScannerPage';

// Global Styles
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :root {
    --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    --success-color: #10b981;
    --warning-color: #f59e0b;
    --danger-color: #ef4444;
    --safe-color: #10b981;
    --critical-color: #dc2626;
    
    --shadow-light: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-medium: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --shadow-large: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: var(--primary-gradient);
    min-height: 100vh;
    color: #1f2937;
    line-height: 1.6;
  }

  code {
    font-family: 'Fira Code', 'Monaco', 'Consolas', 'Ubuntu Mono', monospace;
  }

  /* Scrollbar Styling */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
`;

// Animations
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  background: var(--primary-gradient);
  background-size: 400% 400%;
  animation: ${gradientAnimation} 15s ease infinite;
`;

function App() {
  const [backendStatus, setBackendStatus] = useState('checking');

  // Check backend health on component mount
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/health');
        if (response.ok) {
          setBackendStatus('connected');
        } else {
          setBackendStatus('error');
        }
      } catch (error) {
        console.error('Backend health check failed:', error);
        setBackendStatus('error');
      }
    };

    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <GlobalStyle />
      <Router>
        <AppContainer>
          <Routes>
            <Route path="/" element={<HomePage backendStatus={backendStatus} />} />
            <Route path="/email-scanner" element={<EmailScannerPage backendStatus={backendStatus} />} />
            <Route path="/transaction-scanner" element={<TransactionScannerPage backendStatus={backendStatus} />} />
            <Route path="/daily-usage-scanner" element={<DailyUsageScannerPage backendStatus={backendStatus} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppContainer>
      </Router>
    </>
  );
}

export default App;