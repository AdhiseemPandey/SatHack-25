import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import TransactionScanner from './TransactionScanner';
import Web3Integration from './Web3Integration';

const PageContainer = styled.div`
  min-height: 100vh;
  padding: 20px;
`;

const Header = styled(motion.header)`
  text-align: center;
  padding: 20px 20px 40px;
  color: white;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  margin-bottom: 16px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

const Subtitle = styled.p`
  font-size: clamp(0.9rem, 2vw, 1.1rem);
  opacity: 0.9;
  font-weight: 400;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const BackButton = styled(motion.button)`
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ContentContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
`;

function TransactionScannerPage({ backendStatus }) {
  const navigate = useNavigate();
  const [web3Enabled, setWeb3Enabled] = useState(false);
  const [autoConnected, setAutoConnected] = useState(false);

  // Auto-connect wallet when component mounts
  useEffect(() => {
    const autoConnectWallet = async () => {
      if (window.ethereum && !autoConnected) {
        try {
          console.log('Auto-connecting wallet...');
          const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
          });
          
          if (accounts.length > 0) {
            setWeb3Enabled(true);
            setAutoConnected(true);
            console.log('Wallet auto-connected successfully');
          }
        } catch (error) {
          console.log('Auto-connect failed, user will need to connect manually:', error);
        }
      }
    };

    autoConnectWallet();
  }, [autoConnected]);

  return (
    <PageContainer>
      <BackButton
        onClick={() => navigate('/')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ← Back to Home
      </BackButton>

      <Header
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Title>
          <span>🔗</span>
          Transaction Security Scanner
        </Title>
        <Subtitle>
          Automatic wallet connection • Real-time threat analysis • Zero-knowledge proof verification
        </Subtitle>
      </Header>

      <ContentContainer>
        <Web3Integration 
          onWeb3Enabled={setWeb3Enabled} 
          backendStatus={backendStatus}
          autoConnect={true}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <TransactionScanner 
            web3Enabled={web3Enabled} 
            backendStatus={backendStatus}
            autoConnect={true}
          />
        </motion.div>
      </ContentContainer>
    </PageContainer>
  );
}

export default TransactionScannerPage;