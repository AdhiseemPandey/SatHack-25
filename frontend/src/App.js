import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import TransactionScanner from './components/TransactionScanner';
import EmailScanner from './components/EmailScanner';
import Web3Integration from './components/Web3Integration';

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
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Styled Components
const AppContainer = styled.div`
  min-height: 100vh;
  padding: 20px;
  background: var(--primary-gradient);
  background-size: 400% 400%;
  animation: ${gradientAnimation} 15s ease infinite;
`;

const Header = styled(motion.header)`
  text-align: center;
  padding: 40px 20px 30px;
  color: white;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 700;
  margin-bottom: 16px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  
  &::before, &::after {
    content: '⚡';
    font-size: 0.8em;
    animation: ${floatAnimation} 3s ease-in-out infinite;
  }
  
  &::after {
    animation-delay: 1.5s;
  }
`;

const Subtitle = styled.p`
  font-size: clamp(1rem, 2.5vw, 1.3rem);
  opacity: 0.9;
  font-weight: 400;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const MainContainer = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 40px;
  justify-content: center;
  flex-wrap: wrap;
`;

const TabButton = styled(motion.button)`
  padding: 16px 32px;
  border: none;
  border-radius: 16px;
  background: ${props => props.$active ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.15)'};
  color: ${props => props.$active ? '#667eea' : 'rgba(255, 255, 255, 0.9)'};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
  border: 2px solid ${props => props.$active ? 'rgba(255, 255, 255, 0.5)' : 'transparent'};
  min-width: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  &:hover {
    background: ${props => props.$active ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.25)'};
    transform: translateY(-2px);
    box-shadow: var(--shadow-medium);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ScannerGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
  max-width: 1000px;
  margin: 0 auto;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ScannerCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 32px;
  box-shadow: var(--shadow-large);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  height: fit-content;
`;

const FeatureHighlight = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  margin-top: 30px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.9rem;
  opacity: 0.9;
`;

// Main App Component
function App() {
  const [activeTab, setActiveTab] = useState('sovereign');
  const [web3Enabled, setWeb3Enabled] = useState(false);
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
    const interval = setInterval(checkBackendHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <Header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Title>🛡️ Sovereign Identity Guardian</Title>
          <Subtitle>
            Zero-Knowledge AI Security Scanner • Privacy-Preserving Threat Detection • Real-time Web3 Protection
          </Subtitle>
        </Header>

        <MainContainer>
          {/* Web3 Integration Component */}
          <Web3Integration 
            onWeb3Enabled={setWeb3Enabled} 
            backendStatus={backendStatus}
          />

          {/* Tab Navigation */}
          <TabContainer>
            <TabButton
              $active={activeTab === 'sovereign'}
              onClick={() => setActiveTab('sovereign')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={backendStatus === 'error'}
            >
              🏛️ Sovereign Identity
              <motion.span
                animate={{ rotate: activeTab === 'sovereign' ? 360 : 0 }}
                transition={{ duration: 0.5 }}
              >
                🔒
              </motion.span>
            </TabButton>
            
            <TabButton
              $active={activeTab === 'email'}
              onClick={() => setActiveTab('email')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              📧 Email Spam Detection
              <motion.span
                animate={{ scale: activeTab === 'email' ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.5 }}
              >
                🛡️
              </motion.span>
            </TabButton>
          </TabContainer>

          {/* Scanner Components */}
          <ScannerGrid>
            <AnimatePresence mode="wait">
              {activeTab === 'sovereign' && (
                <ScannerCard
                  key="sovereign"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.4 }}
                >
                  <TransactionScanner 
                    web3Enabled={web3Enabled} 
                    backendStatus={backendStatus}
                  />
                </ScannerCard>
              )}
              
              {activeTab === 'email' && (
                <ScannerCard
                  key="email"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.4 }}
                >
                  <EmailScanner />
                </ScannerCard>
              )}
            </AnimatePresence>
          </ScannerGrid>

          {/* Features Highlight */}
          <FeatureHighlight
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <h3 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>
              ✨ Advanced Security Features
            </h3>
            <FeatureGrid>
              <FeatureItem>
                <span>🔍</span> AI-Powered Threat Detection
              </FeatureItem>
              <FeatureItem>
                <span>🕵️</span> Zero-Knowledge Proofs
              </FeatureItem>
              <FeatureItem>
                <span>🌐</span> Multi-Chain Support
              </FeatureItem>
              <FeatureItem>
                <span>⚡</span> Real-time Analysis
              </FeatureItem>
              <FeatureItem>
                <span>🔒</span> Privacy-First Design
              </FeatureItem>
              <FeatureItem>
                <span>🤖</span> Machine Learning Models
              </FeatureItem>
            </FeatureGrid>
          </FeatureHighlight>
        </MainContainer>
      </AppContainer>
    </>
  );
}

export default App;