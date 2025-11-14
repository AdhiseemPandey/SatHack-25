import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const Web3Container = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 24px;
  margin: 0 auto 40px;
  max-width: 600px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
`;

const StatusBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
`;

const StatusGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-size: 0.9rem;
`;

const StatusIndicator = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => {
    switch (props.status) {
      case 'connected': return '#10b981';
      case 'error': return '#ef4444';
      case 'checking': return '#f59e0b';
      default: return '#6b7280';
    }
  }};
  animation: ${props => props.status === 'checking' ? 'pulse 1.5s infinite' : 'none'};
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const AccountInfo = styled(motion.div)`
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 12px 16px;
  color: white;
  font-family: 'Fira Code', monospace;
  font-size: 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ConnectButton = styled(motion.button)`
  background: ${props => 
    props.connected 
      ? 'linear-gradient(135deg, #10b981, #059669)' 
      : 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
  };
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1rem;
  box-shadow: var(--shadow-medium);
  transition: all 0.3s ease;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  &:hover:not(:disabled) {
    box-shadow: var(--shadow-large);
    transform: translateY(-2px);
  }
`;

const NetworkInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  border-radius: 8px;
  color: white;
  font-size: 0.8rem;
`;

const ErrorMessage = styled(motion.div)`
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
  padding: 12px 16px;
  border-radius: 12px;
  margin-top: 16px;
  font-size: 0.9rem;
`;

const SuccessMessage = styled(motion.div)`
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #6ee7b7;
  padding: 12px 16px;
  border-radius: 12px;
  margin-top: 16px;
  font-size: 0.9rem;
`;

const Loader = styled(motion.div)`
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
`;

function Web3Integration({ onWeb3Enabled, backendStatus, autoConnect }) {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [network, setNetwork] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // Auto-connect on component mount if autoConnect is true
  useEffect(() => {
    if (autoConnect && window.ethereum) {
      autoConnectWallet();
    }
  }, [autoConnect]);

  const autoConnectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts'
      });
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setConnected(true);
        onWeb3Enabled(true);
        
        const chainId = await window.ethereum.request({
          method: 'eth_chainId'
        });
        
        setNetwork({
          chainId: parseInt(chainId),
          name: getNetworkName(chainId)
        });
        
        // Set up event listeners
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
        
        console.log('Wallet auto-connected successfully');
      }
    } catch (error) {
      console.log('Auto-connect failed:', error);
    }
  };

  const connectWallet = async () => {
    setLoading(true);
    clearMessages();
    
    try {
      if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask is installed!');
        
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setConnected(true);
          onWeb3Enabled(true);
          setSuccess('Wallet connected successfully!');
          
          const chainId = await window.ethereum.request({
            method: 'eth_chainId'
          });
          
          setNetwork({
            chainId: parseInt(chainId),
            name: getNetworkName(chainId)
          });
          
          window.ethereum.on('accountsChanged', handleAccountsChanged);
          window.ethereum.on('chainChanged', handleChainChanged);
          
          console.log('Connected account:', accounts[0]);
        } else {
          throw new Error('No accounts found');
        }
      } else {
        throw new Error('MetaMask not detected. Please install MetaMask.');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setError(error.message || 'Failed to connect wallet');
      setConnected(false);
      onWeb3Enabled(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setConnected(false);
      setAccount(null);
      onWeb3Enabled(false);
      setError('Wallet disconnected');
    } else {
      setAccount(accounts[0]);
      setSuccess('Account changed');
    }
  };

  const handleChainChanged = (chainId) => {
    setNetwork({
      chainId: parseInt(chainId),
      name: getNetworkName(chainId)
    });
    setSuccess('Network changed');
    window.location.reload();
  };

  const getNetworkName = (chainId) => {
    const networks = {
      '0x1': 'Ethereum Mainnet',
      '0x5': 'Goerli Testnet',
      '0xaa36a7': 'Sepolia Testnet',
      '0x89': 'Polygon Mainnet',
      '0x13881': 'Mumbai Testnet',
      '0xa4b1': 'Arbitrum One'
    };
    return networks[chainId] || `Unknown Network (${chainId})`;
  };

  const disconnectWallet = () => {
    setConnected(false);
    setAccount(null);
    onWeb3Enabled(false);
    setNetwork(null);
    setSuccess('Wallet disconnected');
    
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
  };

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(clearMessages, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <Web3Container>
      <StatusBar>
        <StatusGroup>
          <StatusItem>
            <StatusIndicator status={backendStatus} />
            <span>Backend: {backendStatus === 'connected' ? 'Connected' : 
                  backendStatus === 'error' ? 'Disconnected' : 'Checking...'}</span>
          </StatusItem>
          
          <StatusItem>
            <StatusIndicator status={connected ? 'connected' : 'error'} />
            <span>Wallet: {connected ? 'Connected' : 'Disconnected'}</span>
          </StatusItem>

          {network && (
            <NetworkInfo>
              <span>🌐</span>
              {network.name}
            </NetworkInfo>
          )}
        </StatusGroup>

        <ConnectButton
          onClick={connected ? disconnectWallet : connectWallet}
          disabled={loading}
          connected={connected}
          whileHover={!loading ? { scale: 1.05 } : {}}
          whileTap={!loading ? { scale: 0.95 } : {}}
        >
          {loading ? (
            <>
              <Loader />
              Connecting...
            </>
          ) : connected ? (
            <>
              🔌 Disconnect
            </>
          ) : (
            <>
              🔗 Connect MetaMask
            </>
          )}
        </ConnectButton>
      </StatusBar>

      <AnimatePresence>
        {account && (
          <AccountInfo
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <strong>Connected Account:</strong> 
            <br />
            {account.slice(0, 8)}...{account.slice(-6)}
          </AccountInfo>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <ErrorMessage
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            ⚠️ {error}
          </ErrorMessage>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {success && (
          <SuccessMessage
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            ✅ {success}
          </SuccessMessage>
        )}
      </AnimatePresence>

      {!window.ethereum && (
        <ErrorMessage
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          ❗ MetaMask not detected. Please install MetaMask to use Web3 features.
        </ErrorMessage>
      )}
    </Web3Container>
  );
}

export default Web3Integration;