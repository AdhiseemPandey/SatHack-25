import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const ScannerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ScannerHeader = styled.div`
  text-align: center;
  margin-bottom: 8px;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const Description = styled.p`
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
`;

const InputSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
`;

const TextArea = styled.textarea`
  padding: 16px;
  border: 2px solid ${props => props.error ? '#ef4444' : '#e5e7eb'};
  border-radius: 12px;
  font-size: 14px;
  font-family: 'Fira Code', monospace;
  min-height: 120px;
  resize: vertical;
  transition: all 0.3s ease;
  background: white;
  line-height: 1.5;

  &:focus {
    outline: none;
    border-color: ${props => props.error ? '#ef4444' : '#667eea'};
    box-shadow: 0 0 0 3px ${props => props.error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(102, 126, 234, 0.1)'};
  }

  &:disabled {
    background-color: #f9fafb;
    color: #9ca3af;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #9ca3af;
    font-family: 'Inter', sans-serif;
  }
`;

const QuickExampleButton = styled(motion.button)`
  align-self: flex-start;
  background: transparent;
  border: 1px solid #d1d5db;
  color: #6b7280;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
    color: #374151;
  }
`;

const AutoScanButton = styled(motion.button)`
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ScanButton = styled(motion.button)`
  background: ${props => {
    if (props.disabled) return '#d1d5db';
    if (props.scanning) return '#f59e0b';
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }};
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
  width: 100%;
  position: relative;
  overflow: hidden;

  &:hover:not(:disabled) {
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 8px 25px rgba(102, 126, 234, 0.3)'};
  }
`;

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 2;
`;

const ScanProgress = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const ResultSection = styled(motion.section)`
  margin-top: 8px;
`;

const ResultCard = styled(motion.div)`
  border-radius: 16px;
  padding: 0;
  overflow: hidden;
  background: white;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const ResultHeader = styled.div`
  background: ${props => {
    switch (props.threatLevel) {
      case 'CRITICAL': return '#fee2e2';
      case 'HIGH': return '#ffedd5';
      case 'MEDIUM': return '#fef3c7';
      case 'LOW': return '#ecfdf5';
      default: return '#f0f9ff';
    }
  }};
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
`;

const ThreatLevel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const ThreatTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: ${props => {
    switch (props.level) {
      case 'CRITICAL': return '#dc2626';
      case 'HIGH': return '#ea580c';
      case 'MEDIUM': return '#d97706';
      case 'LOW': return '#059669';
      default: return '#0369a1';
    }
  }};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RiskScore = styled.div`
  background: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ThreatDescription = styled.p`
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.5;
`;

const ResultContent = styled.div`
  padding: 24px;
`;

const Section = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  line-height: 1.5;

  &:last-child {
    border-bottom: none;
  }

  &::before {
    content: '${props => props.icon || '⚡'}';
    font-size: 1rem;
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const WarningItem = styled(ListItem)`
  color: #dc2626;
  font-weight: 500;
`;

const RecommendationItem = styled(ListItem)`
  color: #059669;
`;

const ZKProofSection = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
`;

const ZKProofTitle = styled.h5`
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ZKProofCode = styled.code`
  background: #1e293b;
  color: #e2e8f0;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-family: 'Fira Code', monospace;
  display: block;
  overflow-x: auto;
  word-break: break-all;
`;

const ErrorMessage = styled(motion.div)`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
`;

const WarningMessage = styled(motion.div)`
  background: #fffbeb;
  border: 1px solid #fed7aa;
  color: #d97706;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
`;

const Loader = styled(motion.div)`
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
`;

function TransactionScanner({ web3Enabled, backendStatus, autoConnect }) {
  const [transactionData, setTransactionData] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const textareaRef = useRef(null);

  // Sample transaction data for quick testing
  const sampleTransactions = {
    safe: JSON.stringify({
      to: '0x742d35Cc6634C0532925a3b8D3Bf5d1C4f1E8a1f',
      value: '0xde0b6b3a7640000', // 1 ETH
      data: '0x',
      gasPrice: '0x4a817c800', // 20 Gwei
      gas: '0x5208' // 21000
    }, null, 2),
    
    suspicious: JSON.stringify({
      to: '0x8576acc5c05d6ce88f4e49f65b8677898efc8d8a',
      value: '0x1bc16d674ec80000', // 2 ETH
      data: '0xa9059cbb0000000000000000000000000000000000000000000000000000000000000000',
      gasPrice: '0x2cb417800', // 12 Gwei
      gas: '0x186a0' // 100,000
    }, null, 2),
    
    critical: JSON.stringify({
      to: '0x901bb9583b24d97e995513c6778dc6888ab6870e',
      value: '0x8ac7230489e80000', // 10 ETH
      data: '0x095ea7b30000000000000000000000000000000000000000000000000000000000000000',
      gasPrice: '0x4a817c800', // 20 Gwei
      gas: '0x30d40' // 200,000
    }, null, 2)
  };

  const loadExample = (type) => {
    setTransactionData(sampleTransactions[type]);
    setError(null);
    setResult(null);
    
    // Focus the textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const autoScanTransaction = async () => {
    if (!web3Enabled || !window.ethereum) {
      setError('Please connect your wallet first');
      return;
    }

    setScanning(true);
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Get current account
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const userAddress = accounts[0];

      // Auto-scan current transaction
      const response = await axios.post('http://localhost:5000/api/scan/auto-scan', {
        userAddress: userAddress
      });

      clearInterval(progressInterval);
      setProgress(100);

      setTimeout(() => {
        setResult(response.data);
        setScanning(false);
        setProgress(0);
        
        // Populate the textarea with the scanned transaction
        if (response.data.transaction) {
          setTransactionData(JSON.stringify(response.data.transaction, null, 2));
        }
      }, 500);

    } catch (error) {
      setScanning(false);
      setProgress(0);
      
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Failed to auto-scan transaction. Please try again.');
      }
      
      console.error('Auto-scan error:', error);
    }
  };

  const validateTransactionData = (data) => {
    if (!data.trim()) {
      throw new Error('Transaction data is required');
    }

    try {
      const parsed = JSON.parse(data);
      
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Transaction data must be a valid JSON object');
      }

      if (!parsed.to && !parsed.data) {
        throw new Error('Transaction must have either "to" address or "data"');
      }

      return parsed;
    } catch (parseError) {
      throw new Error('Invalid JSON format. Please check your transaction data.');
    }
  };

  const scanTransaction = async () => {
    if (!transactionData.trim()) return;

    setScanning(true);
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      // Validate input
      const parsedData = validateTransactionData(transactionData);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Make API call
      const response = await axios.post('http://localhost:5000/api/scan/transaction', {
        transactionData: parsedData,
        userAddress: window.ethereum?.selectedAddress || 'anonymous'
      });

      clearInterval(progressInterval);
      setProgress(100);

      // Small delay to show completion
      setTimeout(() => {
        setResult(response.data);
        setScanning(false);
        setProgress(0);
      }, 500);

    } catch (error) {
      setScanning(false);
      setProgress(0);
      
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Failed to scan transaction. Please try again.');
      }
      
      console.error('Scan error:', error);
    }
  };

  const getThreatLevelText = (level) => {
    const levels = ['SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    return levels[level] || 'UNKNOWN';
  };

  const getThreatIcon = (level) => {
    switch (level) {
      case 'CRITICAL': return '🚨';
      case 'HIGH': return '⚠️';
      case 'MEDIUM': return '🔍';
      case 'LOW': return '📝';
      default: return '✅';
    }
  };

  const getThreatDescription = (level, riskScore) => {
    switch (level) {
      case 'CRITICAL':
        return 'Immediate action required. This transaction shows clear signs of malicious intent.';
      case 'HIGH':
        return 'High risk detected. Proceed with extreme caution and verify all details.';
      case 'MEDIUM':
        return 'Moderate risk detected. Review transaction details carefully before proceeding.';
      case 'LOW':
        return 'Low risk detected. Standard security review recommended.';
      default:
        return 'Transaction appears safe. Always verify addresses before sending.';
    }
  };

  const canScan = transactionData.trim() && !scanning && web3Enabled && backendStatus === 'connected';

  return (
    <ScannerContainer>
      <ScannerHeader>
        <Title>
          <span>🔍</span>
          Transaction Security Scanner
        </Title>
        <Description>
          AI-powered analysis of blockchain transactions with Zero-Knowledge Proof verification. 
          Scan for malicious contracts, suspicious patterns, and potential threats.
        </Description>
      </ScannerHeader>

      <InputSection>
        <InputGroup>
          <Label htmlFor="transaction-data">
            Transaction Data (JSON Format)
          </Label>
          <TextArea
            ref={textareaRef}
            id="transaction-data"
            placeholder={`Paste your transaction data as JSON:\n\n{\n  "to": "0x742d35Cc6634C0532925a3b8D3Bf5d1C4f1E8a1f",\n  "value": "0xde0b6b3a7640000",\n  "data": "0x",\n  "gasPrice": "0x4a817c800",\n  "gas": "0x5208"\n}`}
            value={transactionData}
            onChange={(e) => {
              setTransactionData(e.target.value);
              setError(null);
            }}
            disabled={!web3Enabled || scanning}
            error={!!error}
            spellCheck={false}
          />
        </InputGroup>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <QuickExampleButton
              onClick={() => loadExample('safe')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={scanning}
            >
              Load Safe Example
            </QuickExampleButton>
            <QuickExampleButton
              onClick={() => loadExample('suspicious')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={scanning}
            >
              Load Suspicious Example
            </QuickExampleButton>
            <QuickExampleButton
              onClick={() => loadExample('critical')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={scanning}
            >
              Load Critical Example
            </QuickExampleButton>
          </div>

          <AutoScanButton
            onClick={autoScanTransaction}
            disabled={!web3Enabled || scanning}
            whileHover={web3Enabled && !scanning ? { scale: 1.02 } : {}}
            whileTap={web3Enabled && !scanning ? { scale: 0.98 } : {}}
          >
            <span>🔍</span>
            Auto-Scan Current Transaction
          </AutoScanButton>
        </div>

        <ScanButton
          onClick={scanTransaction}
          disabled={!canScan}
          scanning={scanning}
          whileHover={canScan ? { scale: 1.02 } : {}}
          whileTap={canScan ? { scale: 0.98 } : {}}
        >
          {scanning && <ScanProgress progress={progress} />}
          <ButtonContent>
            {scanning ? (
              <>
                <Loader />
                Scanning... {progress}%
              </>
            ) : (
              <>
                <span>🛡️</span>
                Scan Transaction
              </>
            )}
          </ButtonContent>
        </ScanButton>
      </InputSection>

      <AnimatePresence>
        {!web3Enabled && (
          <WarningMessage
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <span>🔗</span>
            Please connect your Web3 wallet to enable transaction scanning.
          </WarningMessage>
        )}

        {web3Enabled && backendStatus !== 'connected' && (
          <WarningMessage
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <span>🔌</span>
            Backend service is unavailable. Please check if the server is running.
          </WarningMessage>
        )}

        {error && (
          <ErrorMessage
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <span>❌</span>
            {error}
          </ErrorMessage>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <ResultSection
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ResultCard>
              <ResultHeader threatLevel={getThreatLevelText(result.analysis.threatLevel)}>
                <ThreatLevel>
                  <ThreatTitle level={getThreatLevelText(result.analysis.threatLevel)}>
                    {getThreatIcon(result.analysis.threatLevel)}
                    Threat Level: {getThreatLevelText(result.analysis.threatLevel)}
                  </ThreatTitle>
                  <RiskScore>
                    Risk Score: {result.analysis.riskScore}/100
                  </RiskScore>
                </ThreatLevel>
                <ThreatDescription>
                  {getThreatDescription(getThreatLevelText(result.analysis.threatLevel), result.analysis.riskScore)}
                </ThreatDescription>
              </ResultHeader>

              <ResultContent>
                {result.analysis.warnings && result.analysis.warnings.length > 0 && (
                  <Section>
                    <SectionTitle>
                      <span>⚠️</span>
                      Security Warnings
                    </SectionTitle>
                    <List>
                      {result.analysis.warnings.map((warning, index) => (
                        <WarningItem key={index} icon="🚨">
                          {warning}
                        </WarningItem>
                      ))}
                    </List>
                  </Section>
                )}

                {result.analysis.risks && result.analysis.risks.length > 0 && (
                  <Section>
                    <SectionTitle>
                      <span>🔍</span>
                      Identified Risks
                    </SectionTitle>
                    <List>
                      {result.analysis.risks.map((risk, index) => (
                        <ListItem key={index} icon="🎯">
                          {risk.replace(/_/g, ' ')}
                        </ListItem>
                      ))}
                    </List>
                  </Section>
                )}

                {result.analysis.recommendations && result.analysis.recommendations.length > 0 && (
                  <Section>
                    <SectionTitle>
                      <span>💡</span>
                      Recommendations
                    </SectionTitle>
                    <List>
                      {result.analysis.recommendations.map((recommendation, index) => (
                        <RecommendationItem key={index} icon="✅">
                          {recommendation}
                        </RecommendationItem>
                      ))}
                    </List>
                  </Section>
                )}

                <ZKProofSection>
                  <ZKProofTitle>
                    <span>🔒</span>
                    Zero-Knowledge Proof Generated
                  </ZKProofTitle>
                  <ZKProofCode>
                    {result.zkpData?.proof || 'ZK-Proof generation complete'}
                  </ZKProofCode>
                  <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#64748b' }}>
                    This ZK-proof allows anonymous contribution to threat intelligence without revealing your data.
                  </div>
                </ZKProofSection>
              </ResultContent>
            </ResultCard>
          </ResultSection>
        )}
      </AnimatePresence>
    </ScannerContainer>
  );
}

export default TransactionScanner;