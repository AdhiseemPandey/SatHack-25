import React, { useState, useRef, useEffect } from "react";
import styled, { createGlobalStyle, ThemeProvider } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

// Global styles with elegant dark theme
const GlobalStyles = createGlobalStyle`
  * {
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
  }
`;

const elegantTheme = {
  background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
  cardBackground: "rgba(30, 41, 59, 0.8)",
  cardBackgroundSolid: "#1e293b",
  text: "#f1f5f9",
  textSecondary: "#94a3b8",
  border: "rgba(255, 255, 255, 0.1)",
  accent: "#818cf8",
  accentGradient: "linear-gradient(135deg, #818cf8 0%, #c084fc 100%)",
  danger: "#f87171",
  warning: "#fbbf24",
  success: "#34d399",
  info: "#60a5fa",
  glass: "rgba(255, 255, 255, 0.05)",
  glassBorder: "rgba(255, 255, 255, 0.1)",
};

const ScannerContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 28px;
  background: ${(props) => props.theme.background};
  min-height: 100vh;
  padding: 32px 24px;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      ${(props) => props.theme.accent},
      transparent
    );
  }
`;

const ScannerHeader = styled(motion.div)`
  text-align: center;
  margin-bottom: 16px;
  position: relative;
`;

const Title = styled.h2`
  font-size: 2.8rem;
  font-weight: 800;
  color: ${(props) => props.theme.text};
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  background: ${(props) => props.theme.accentGradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 20px rgba(129, 140, 248, 0.3);
`;

const Description = styled.p`
  color: ${(props) => props.theme.textSecondary};
  font-size: 1.2rem;
  line-height: 1.7;
  max-width: 700px;
  margin: 0 auto;
  font-weight: 400;
`;

const InputSection = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
`;

const InputGroup = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Label = styled.label`
  font-weight: 700;
  color: ${(props) => props.theme.text};
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TextArea = styled(motion.textarea)`
  padding: 24px;
  border: 1.5px solid
    ${(props) => (props.error ? props.theme.danger : props.theme.glassBorder)};
  border-radius: 20px;
  font-size: 15px;
  font-family: "Fira Code", monospace;
  min-height: 180px;
  resize: vertical;
  transition: all 0.3s ease;
  background: ${(props) => props.theme.glass};
  backdrop-filter: blur(20px);
  color: ${(props) => props.theme.text};
  line-height: 1.6;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);

  &:focus {
    outline: none;
    border-color: ${(props) =>
      props.error ? props.theme.danger : props.theme.accent};
    box-shadow: 0 0 0 3px
      ${(props) =>
        props.error ? "rgba(248, 113, 113, 0.2)" : "rgba(129, 140, 248, 0.2)"};
    transform: translateY(-2px);
    background: ${(props) => props.theme.cardBackground};
  }

  &:disabled {
    background-color: ${(props) => props.theme.background};
    color: ${(props) => props.theme.textSecondary};
    cursor: not-allowed;
    opacity: 0.6;
  }

  &::placeholder {
    color: ${(props) => props.theme.textSecondary};
    font-family: "Inter", sans-serif;
  }
`;

const ButtonGroup = styled(motion.div)`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
`;

const ExampleButton = styled(motion.button)`
  background: ${(props) => props.theme.glass};
  backdrop-filter: blur(20px);
  border: 1.5px solid ${(props) => props.theme.glassBorder};
  color: ${(props) => props.theme.text};
  padding: 14px 24px;
  border-radius: 16px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;

  &:hover {
    background: ${(props) => props.theme.accent};
    border-color: ${(props) => props.theme.accent};
    color: white;
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 12px 30px rgba(129, 140, 248, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const AutoScanButton = styled(motion.button)`
  background: ${(props) => props.theme.accentGradient};
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(129, 140, 248, 0.4);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: 0.5s;
  }

  &:hover:not(:disabled) {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 15px 35px rgba(129, 140, 248, 0.5);

    &::before {
      left: 100%;
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ScanButton = styled(motion.button)`
  background: ${(props) => {
    if (props.disabled) return props.theme.glass;
    if (props.scanning) return props.theme.warning;
    return props.theme.accentGradient;
  }};
  color: white;
  border: none;
  padding: 20px 40px;
  border-radius: 20px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  transition: all 0.3s ease;
  width: 100%;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 18px 40px rgba(129, 140, 248, 0.4);
  }
`;

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 2;
`;

const ScanProgress = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  width: ${(props) => props.progress}%;
  transition: width 0.3s ease;
`;

const ResultSection = styled(motion.section)`
  margin-top: 20px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
`;

const ResultCard = styled(motion.div)`
  border-radius: 24px;
  padding: 0;
  overflow: hidden;
  background: ${(props) => props.theme.glass};
  backdrop-filter: blur(20px);
  border: 1px solid ${(props) => props.theme.glassBorder};
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
`;

const ResultHeader = styled.div`
  background: ${(props) => {
    switch (props.threatLevel) {
      case "CRITICAL":
        return "linear-gradient(135deg, rgba(254, 226, 226, 0.2) 0%, rgba(254, 202, 202, 0.3) 100%)";
      case "HIGH":
        return "linear-gradient(135deg, rgba(255, 237, 213, 0.2) 0%, rgba(254, 215, 170, 0.3) 100%)";
      case "MEDIUM":
        return "linear-gradient(135deg, rgba(254, 243, 199, 0.2) 0%, rgba(253, 230, 138, 0.3) 100%)";
      case "LOW":
        return "linear-gradient(135deg, rgba(236, 253, 245, 0.2) 0%, rgba(209, 250, 229, 0.3) 100%)";
      default:
        return "linear-gradient(135deg, rgba(240, 249, 255, 0.2) 0%, rgba(224, 242, 254, 0.3) 100%)";
    }
  }};
  padding: 28px 32px;
  border-bottom: 1px solid ${(props) => props.theme.glassBorder};
`;

const ThreatLevel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const ThreatTitle = styled(motion.h3)`
  font-size: 1.6rem;
  font-weight: 800;
  color: ${(props) => {
    switch (props.level) {
      case "CRITICAL":
        return props.theme.danger;
      case "HIGH":
        return "#f97316";
      case "MEDIUM":
        return "#eab308";
      case "LOW":
        return props.theme.success;
      default:
        return props.theme.info;
    }
  }};
  display: flex;
  align-items: center;
  gap: 14px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
`;

const RiskScore = styled(motion.div)`
  background: ${(props) => props.theme.glass};
  backdrop-filter: blur(20px);
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: 700;
  color: ${(props) => props.theme.text};
  font-size: 1.1rem;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  border: 1px solid ${(props) => props.theme.glassBorder};
`;

const ThreatDescription = styled.p`
  color: ${(props) => props.theme.text};
  font-size: 1.1rem;
  line-height: 1.6;
  font-weight: 500;
`;

const ResultContent = styled.div`
  padding: 32px;
`;

const Section = styled(motion.div)`
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h4`
  font-size: 1.3rem;
  font-weight: 700;
  color: ${(props) => props.theme.text};
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled(motion.li)`
  padding: 18px 0;
  border-bottom: 1px solid ${(props) => props.theme.glassBorder};
  display: flex;
  align-items: flex-start;
  gap: 16px;
  line-height: 1.6;
  transition: all 0.3s ease;

  &:hover {
    background: ${(props) => props.theme.glass};
    padding-left: 16px;
    border-radius: 12px;
    transform: translateX(8px);
  }

  &:last-child {
    border-bottom: none;
  }

  &::before {
    content: "${(props) => props.icon || "⚡"}";
    font-size: 1.2rem;
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const WarningItem = styled(ListItem)`
  color: ${(props) => props.theme.danger};
  font-weight: 600;
`;

const RecommendationItem = styled(ListItem)`
  color: ${(props) => props.theme.success};
`;

const ZKProofSection = styled(motion.div)`
  background: ${(props) => props.theme.glass};
  backdrop-filter: blur(20px);
  border: 1px solid ${(props) => props.theme.glassBorder};
  border-radius: 20px;
  padding: 24px;
  margin-top: 24px;
`;

const ZKProofTitle = styled.h5`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${(props) => props.theme.text};
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ZKProofCode = styled.code`
  background: rgba(15, 23, 42, 0.8);
  color: ${(props) => props.theme.text};
  padding: 20px;
  border-radius: 16px;
  font-size: 0.9rem;
  font-family: "Fira Code", monospace;
  display: block;
  overflow-x: auto;
  word-break: break-all;
  border: 1px solid ${(props) => props.theme.glassBorder};
  line-height: 1.5;
`;

const Message = styled(motion.div)`
  background: ${(props) =>
    props.type === "error"
      ? "rgba(254, 242, 242, 0.1)"
      : "rgba(255, 251, 235, 0.1)"};
  border: 1px solid
    ${(props) =>
      props.type === "error"
        ? "rgba(248, 113, 113, 0.3)"
        : "rgba(251, 191, 36, 0.3)"};
  color: ${(props) =>
    props.type === "error" ? props.theme.danger : props.theme.warning};
  padding: 24px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  border-left: 4px solid
    ${(props) =>
      props.type === "error" ? props.theme.danger : props.theme.warning};
  backdrop-filter: blur(20px);
`;

const Loader = styled(motion.div)`
  width: 26px;
  height: 26px;
  border: 3px solid transparent;
  border-top: 3px solid currentColor;
  border-radius: 50%;
`;

function TransactionScanner({ web3Enabled, backendStatus, autoConnect }) {
  const [transactionData, setTransactionData] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const textareaRef = useRef(null);

  // Sample transaction data for quick testing
  const sampleTransactions = {
    safe: JSON.stringify(
      {
        to: "0x742d35Cc6634C0532925a3b8D3Bf5d1C4f1E8a1f",
        value: "0xde0b6b3a7640000",
        data: "0x",
        gasPrice: "0x4a817c800",
        gas: "0x5208",
      },
      null,
      2
    ),

    suspicious: JSON.stringify(
      {
        to: "0x8576acc5c05d6ce88f4e49f65b8677898efc8d8a",
        value: "0x1bc16d674ec80000",
        data: "0xa9059cbb0000000000000000000000000000000000000000000000000000000000000000",
        gasPrice: "0x2cb417800",
        gas: "0x186a0",
      },
      null,
      2
    ),

    critical: JSON.stringify(
      {
        to: "0x901bb9583b24d97e995513c6778dc6888ab6870e",
        value: "0x8ac7230489e80000",
        data: "0x095ea7b30000000000000000000000000000000000000000000000000000000000000000",
        gasPrice: "0x4a817c800",
        gas: "0x30d40",
      },
      null,
      2
    ),
  };

  const loadExample = (type) => {
    setTransactionData(sampleTransactions[type]);
    setError(null);
    setResult(null);

    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const autoScanTransaction = async () => {
    if (!web3Enabled || !window.ethereum) {
      setError("Please connect your wallet first");
      return;
    }

    setScanning(true);
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const userAddress = accounts[0];
      const response = await axios.post(
        "http://localhost:5000/api/scan/auto-scan",
        {
          userAddress: userAddress,
        }
      );

      clearInterval(progressInterval);
      setProgress(100);

      setTimeout(() => {
        setResult(response.data);
        setScanning(false);
        setProgress(0);

        if (response.data.transaction) {
          setTransactionData(
            JSON.stringify(response.data.transaction, null, 2)
          );
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
        setError("Failed to auto-scan transaction. Please try again.");
      }

      console.error("Auto-scan error:", error);
    }
  };

  const validateTransactionData = (data) => {
    if (!data.trim()) {
      throw new Error("Transaction data is required");
    }

    try {
      const parsed = JSON.parse(data);

      if (typeof parsed !== "object" || parsed === null) {
        throw new Error("Transaction data must be a valid JSON object");
      }

      if (!parsed.to && !parsed.data) {
        throw new Error('Transaction must have either "to" address or "data"');
      }

      return parsed;
    } catch (parseError) {
      throw new Error(
        "Invalid JSON format. Please check your transaction data."
      );
    }
  };

  const scanTransaction = async () => {
    if (!transactionData.trim()) return;

    setScanning(true);
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      const parsedData = validateTransactionData(transactionData);

      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await axios.post(
        "http://localhost:5000/api/scan/transaction",
        {
          transactionData: parsedData,
          userAddress: window.ethereum?.selectedAddress || "anonymous",
        }
      );

      clearInterval(progressInterval);
      setProgress(100);

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
        setError("Failed to scan transaction. Please try again.");
      }

      console.error("Scan error:", error);
    }
  };

  const getThreatLevelText = (level) => {
    const levels = ["SAFE", "LOW", "MEDIUM", "HIGH", "CRITICAL"];
    return levels[level] || "UNKNOWN";
  };

  const getThreatIcon = (level) => {
    switch (level) {
      case "CRITICAL":
        return "🚨";
      case "HIGH":
        return "⚠️";
      case "MEDIUM":
        return "🔍";
      case "LOW":
        return "📝";
      default:
        return "✅";
    }
  };

  const getThreatDescription = (level, riskScore) => {
    switch (level) {
      case "CRITICAL":
        return "Immediate action required. This transaction shows clear signs of malicious intent.";
      case "HIGH":
        return "High risk detected. Proceed with extreme caution and verify all details.";
      case "MEDIUM":
        return "Moderate risk detected. Review transaction details carefully before proceeding.";
      case "LOW":
        return "Low risk detected. Standard security review recommended.";
      default:
        return "Transaction appears safe. Always verify addresses before sending.";
    }
  };

  const canScan =
    transactionData.trim() &&
    !scanning &&
    web3Enabled &&
    backendStatus === "connected";

  return (
    <ThemeProvider theme={elegantTheme}>
      <GlobalStyles />
      <ScannerContainer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <ScannerHeader
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <Title>
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
            >
              🔍
            </motion.span>
            Transaction Security Scanner
          </Title>
          <Description>
            AI-powered analysis of blockchain transactions with Zero-Knowledge
            Proof verification. Scan for malicious contracts, suspicious
            patterns, and potential threats.
          </Description>
        </ScannerHeader>

        <InputSection
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <InputGroup>
            <Label>
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                📝
              </motion.span>
              Transaction Data (JSON Format)
            </Label>
            <TextArea
              ref={textareaRef}
              placeholder={`Paste your transaction data as JSON:\n\n{\n  "to": "0x742d35Cc6634C0532925a3b8D3Bf5d1C4f1E8a1f",\n  "value": "0xde0b6b3a7640000",\n  "data": "0x",\n  "gasPrice": "0x4a817c800",\n  "gas": "0x5208"\n}`}
              value={transactionData}
              onChange={(e) => {
                setTransactionData(e.target.value);
                setError(null);
              }}
              disabled={!web3Enabled || scanning}
              error={!!error}
              spellCheck={false}
              whileFocus={{ scale: 1.01 }}
            />
          </InputGroup>

          <ButtonGroup>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <ExampleButton
                onClick={() => loadExample("safe")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={scanning}
              >
                🛡️ Safe Example
              </ExampleButton>
              <ExampleButton
                onClick={() => loadExample("suspicious")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={scanning}
              >
                🔍 Suspicious Example
              </ExampleButton>
              <ExampleButton
                onClick={() => loadExample("critical")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={scanning}
              >
                🚨 Critical Example
              </ExampleButton>
            </div>

            <AutoScanButton
              onClick={autoScanTransaction}
              disabled={!web3Enabled || scanning}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
              >
                🔄
              </motion.span>
              Auto-Scan Current TX
            </AutoScanButton>
          </ButtonGroup>

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
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🛡️
                  </motion.span>
                  Scan Transaction
                </>
              )}
            </ButtonContent>
          </ScanButton>
        </InputSection>

        <AnimatePresence>
          {!web3Enabled && (
            <Message
              type="warning"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <span>🔗</span>
              Please connect your Web3 wallet to enable transaction scanning.
            </Message>
          )}

          {web3Enabled && backendStatus !== "connected" && (
            <Message
              type="warning"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <span>🔌</span>
              Backend service is unavailable. Please check if the server is
              running.
            </Message>
          )}

          {error && (
            <Message
              type="error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <span>❌</span>
              {error}
            </Message>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {result && (
            <ResultSection
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <ResultCard
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ResultHeader
                  threatLevel={getThreatLevelText(result.analysis.threatLevel)}
                >
                  <ThreatLevel>
                    <ThreatTitle
                      level={getThreatLevelText(result.analysis.threatLevel)}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {getThreatIcon(result.analysis.threatLevel)}
                      Threat Level:{" "}
                      {getThreatLevelText(result.analysis.threatLevel)}
                    </ThreatTitle>
                    <RiskScore whileHover={{ scale: 1.1 }}>
                      Risk Score: {result.analysis.riskScore}/100
                    </RiskScore>
                  </ThreatLevel>
                  <ThreatDescription>
                    {getThreatDescription(
                      getThreatLevelText(result.analysis.threatLevel),
                      result.analysis.riskScore
                    )}
                  </ThreatDescription>
                </ResultHeader>

                <ResultContent>
                  {result.analysis.warnings &&
                    result.analysis.warnings.length > 0 && (
                      <Section
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <SectionTitle>
                          <span>⚠️</span>
                          Security Warnings
                        </SectionTitle>
                        <List>
                          {result.analysis.warnings.map((warning, index) => (
                            <WarningItem
                              key={index}
                              icon="🚨"
                              whileHover={{ x: 10 }}
                            >
                              {warning}
                            </WarningItem>
                          ))}
                        </List>
                      </Section>
                    )}

                  {result.analysis.risks &&
                    result.analysis.risks.length > 0 && (
                      <Section
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <SectionTitle>
                          <span>🔍</span>
                          Identified Risks
                        </SectionTitle>
                        <List>
                          {result.analysis.risks.map((risk, index) => (
                            <ListItem
                              key={index}
                              icon="🎯"
                              whileHover={{ x: 10 }}
                            >
                              {risk.replace(/_/g, " ")}
                            </ListItem>
                          ))}
                        </List>
                      </Section>
                    )}

                  {result.analysis.recommendations &&
                    result.analysis.recommendations.length > 0 && (
                      <Section
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <SectionTitle>
                          <span>💡</span>
                          Recommendations
                        </SectionTitle>
                        <List>
                          {result.analysis.recommendations.map(
                            (recommendation, index) => (
                              <RecommendationItem
                                key={index}
                                icon="✅"
                                whileHover={{ x: 10 }}
                              >
                                {recommendation}
                              </RecommendationItem>
                            )
                          )}
                        </List>
                      </Section>
                    )}

                  <ZKProofSection
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <ZKProofTitle>
                      <motion.span
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        🔒
                      </motion.span>
                      Zero-Knowledge Proof Generated
                    </ZKProofTitle>
                    <ZKProofCode>
                      {result.zkpData?.proof || "ZK-Proof generation complete"}
                    </ZKProofCode>
                    <div
                      style={{
                        marginTop: "16px",
                        fontSize: "0.9rem",
                        color: elegantTheme.textSecondary,
                      }}
                    >
                      This ZK-proof allows anonymous contribution to threat
                      intelligence without revealing your data.
                    </div>
                  </ZKProofSection>
                </ResultContent>
              </ResultCard>
            </ResultSection>
          )}
        </AnimatePresence>
      </ScannerContainer>
    </ThemeProvider>
  );
}

export default TransactionScanner;

// import React, { useState, useRef } from 'react';
// import styled from 'styled-components';
// import { motion, AnimatePresence } from 'framer-motion';
// import axios from 'axios';

// const ScannerContainer = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: 24px;
// `;

// const ScannerHeader = styled.div`
//   text-align: center;
//   margin-bottom: 8px;
// `;

// const Title = styled.h2`
//   font-size: 1.8rem;
//   font-weight: 700;
//   color: #1f2937;
//   margin-bottom: 8px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   gap: 12px;
// `;

// const Description = styled.p`
//   color: #6b7280;
//   font-size: 1rem;
//   line-height: 1.6;
//   max-width: 600px;
//   margin: 0 auto;
// `;

// const InputSection = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: 16px;
// `;

// const InputGroup = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: 8px;
// `;

// const Label = styled.label`
//   font-weight: 600;
//   color: #374151;
//   font-size: 0.95rem;
// `;

// const TextArea = styled.textarea`
//   padding: 16px;
//   border: 2px solid ${props => props.error ? '#ef4444' : '#e5e7eb'};
//   border-radius: 12px;
//   font-size: 14px;
//   font-family: 'Fira Code', monospace;
//   min-height: 120px;
//   resize: vertical;
//   transition: all 0.3s ease;
//   background: white;
//   line-height: 1.5;

//   &:focus {
//     outline: none;
//     border-color: ${props => props.error ? '#ef4444' : '#667eea'};
//     box-shadow: 0 0 0 3px ${props => props.error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(102, 126, 234, 0.1)'};
//   }

//   &:disabled {
//     background-color: #f9fafb;
//     color: #9ca3af;
//     cursor: not-allowed;
//   }

//   &::placeholder {
//     color: #9ca3af;
//     font-family: 'Inter', sans-serif;
//   }
// `;

// const QuickExampleButton = styled(motion.button)`
//   align-self: flex-start;
//   background: transparent;
//   border: 1px solid #d1d5db;
//   color: #6b7280;
//   padding: 8px 16px;
//   border-radius: 8px;
//   font-size: 0.85rem;
//   cursor: pointer;
//   transition: all 0.2s ease;

//   &:hover {
//     background: #f9fafb;
//     border-color: #9ca3af;
//     color: #374151;
//   }
// `;

// const AutoScanButton = styled(motion.button)`
//   background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
//   color: white;
//   border: none;
//   padding: 12px 24px;
//   border-radius: 10px;
//   font-size: 0.9rem;
//   font-weight: 600;
//   cursor: pointer;
//   display: flex;
//   align-items: center;
//   gap: 8px;
//   transition: all 0.3s ease;

//   &:hover:not(:disabled) {
//     transform: translateY(-2px);
//     box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
//   }

//   &:disabled {
//     opacity: 0.6;
//     cursor: not-allowed;
//   }
// `;

// const ScanButton = styled(motion.button)`
//   background: ${props => {
//     if (props.disabled) return '#d1d5db';
//     if (props.scanning) return '#f59e0b';
//     return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
//   }};
//   color: white;
//   border: none;
//   padding: 16px 32px;
//   border-radius: 12px;
//   font-size: 1rem;
//   font-weight: 600;
//   cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   gap: 10px;
//   transition: all 0.3s ease;
//   width: 100%;
//   position: relative;
//   overflow: hidden;

//   &:hover:not(:disabled) {
//     transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
//     box-shadow: ${props => props.disabled ? 'none' : '0 8px 25px rgba(102, 126, 234, 0.3)'};
//   }
// `;

// const ButtonContent = styled.div`
//   display: flex;
//   align-items: center;
//   gap: 8px;
//   z-index: 2;
// `;

// const ScanProgress = styled(motion.div)`
//   position: absolute;
//   top: 0;
//   left: 0;
//   height: 100%;
//   background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
//   width: ${props => props.progress}%;
//   transition: width 0.3s ease;
// `;

// const ResultSection = styled(motion.section)`
//   margin-top: 8px;
// `;

// const ResultCard = styled(motion.div)`
//   border-radius: 16px;
//   padding: 0;
//   overflow: hidden;
//   background: white;
//   border: 1px solid #e5e7eb;
//   box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
// `;

// const ResultHeader = styled.div`
//   background: ${props => {
//     switch (props.threatLevel) {
//       case 'CRITICAL': return '#fee2e2';
//       case 'HIGH': return '#ffedd5';
//       case 'MEDIUM': return '#fef3c7';
//       case 'LOW': return '#ecfdf5';
//       default: return '#f0f9ff';
//     }
//   }};
//   padding: 20px 24px;
//   border-bottom: 1px solid #e5e7eb;
// `;

// const ThreatLevel = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
//   margin-bottom: 8px;
// `;

// const ThreatTitle = styled.h3`
//   font-size: 1.3rem;
//   font-weight: 700;
//   color: ${props => {
//     switch (props.level) {
//       case 'CRITICAL': return '#dc2626';
//       case 'HIGH': return '#ea580c';
//       case 'MEDIUM': return '#d97706';
//       case 'LOW': return '#059669';
//       default: return '#0369a1';
//     }
//   }};
//   display: flex;
//   align-items: center;
//   gap: 8px;
// `;

// const RiskScore = styled.div`
//   background: white;
//   padding: 6px 12px;
//   border-radius: 20px;
//   font-weight: 600;
//   color: #374151;
//   font-size: 0.9rem;
//   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
// `;

// const ThreatDescription = styled.p`
//   color: #6b7280;
//   font-size: 0.95rem;
//   line-height: 1.5;
// `;

// const ResultContent = styled.div`
//   padding: 24px;
// `;

// const Section = styled.div`
//   margin-bottom: 24px;

//   &:last-child {
//     margin-bottom: 0;
//   }
// `;

// const SectionTitle = styled.h4`
//   font-size: 1.1rem;
//   font-weight: 600;
//   color: #374151;
//   margin-bottom: 12px;
//   display: flex;
//   align-items: center;
//   gap: 8px;
// `;

// const List = styled.ul`
//   list-style: none;
//   padding: 0;
//   margin: 0;
// `;

// const ListItem = styled.li`
//   padding: 12px 0;
//   border-bottom: 1px solid #f3f4f6;
//   display: flex;
//   align-items: flex-start;
//   gap: 12px;
//   line-height: 1.5;

//   &:last-child {
//     border-bottom: none;
//   }

//   &::before {
//     content: '${props => props.icon || '⚡'}';
//     font-size: 1rem;
//     flex-shrink: 0;
//     margin-top: 2px;
//   }
// `;

// const WarningItem = styled(ListItem)`
//   color: #dc2626;
//   font-weight: 500;
// `;

// const RecommendationItem = styled(ListItem)`
//   color: #059669;
// `;

// const ZKProofSection = styled.div`
//   background: #f8fafc;
//   border: 1px solid #e2e8f0;
//   border-radius: 12px;
//   padding: 16px;
//   margin-top: 16px;
// `;

// const ZKProofTitle = styled.h5`
//   font-size: 0.9rem;
//   font-weight: 600;
//   color: #475569;
//   margin-bottom: 8px;
//   display: flex;
//   align-items: center;
//   gap: 6px;
// `;

// const ZKProofCode = styled.code`
//   background: #1e293b;
//   color: #e2e8f0;
//   padding: 12px;
//   border-radius: 8px;
//   font-size: 0.8rem;
//   font-family: 'Fira Code', monospace;
//   display: block;
//   overflow-x: auto;
//   word-break: break-all;
// `;

// const ErrorMessage = styled(motion.div)`
//   background: #fef2f2;
//   border: 1px solid #fecaca;
//   color: #dc2626;
//   padding: 16px;
//   border-radius: 12px;
//   display: flex;
//   align-items: center;
//   gap: 12px;
//   margin-top: 16px;
// `;

// const WarningMessage = styled(motion.div)`
//   background: #fffbeb;
//   border: 1px solid #fed7aa;
//   color: #d97706;
//   padding: 16px;
//   border-radius: 12px;
//   display: flex;
//   align-items: center;
//   gap: 12px;
//   margin-top: 16px;
// `;

// const Loader = styled(motion.div)`
//   width: 20px;
//   height: 20px;
//   border: 2px solid transparent;
//   border-top: 2px solid currentColor;
//   border-radius: 50%;
// `;

// function TransactionScanner({ web3Enabled, backendStatus, autoConnect }) {
//   const [transactionData, setTransactionData] = useState('');
//   const [scanning, setScanning] = useState(false);
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState(null);
//   const [progress, setProgress] = useState(0);
//   const textareaRef = useRef(null);

//   // Sample transaction data for quick testing
//   const sampleTransactions = {
//     safe: JSON.stringify({
//       to: '0x742d35Cc6634C0532925a3b8D3Bf5d1C4f1E8a1f',
//       value: '0xde0b6b3a7640000', // 1 ETH
//       data: '0x',
//       gasPrice: '0x4a817c800', // 20 Gwei
//       gas: '0x5208' // 21000
//     }, null, 2),

//     suspicious: JSON.stringify({
//       to: '0x8576acc5c05d6ce88f4e49f65b8677898efc8d8a',
//       value: '0x1bc16d674ec80000', // 2 ETH
//       data: '0xa9059cbb0000000000000000000000000000000000000000000000000000000000000000',
//       gasPrice: '0x2cb417800', // 12 Gwei
//       gas: '0x186a0' // 100,000
//     }, null, 2),

//     critical: JSON.stringify({
//       to: '0x901bb9583b24d97e995513c6778dc6888ab6870e',
//       value: '0x8ac7230489e80000', // 10 ETH
//       data: '0x095ea7b30000000000000000000000000000000000000000000000000000000000000000',
//       gasPrice: '0x4a817c800', // 20 Gwei
//       gas: '0x30d40' // 200,000
//     }, null, 2)
//   };

//   const loadExample = (type) => {
//     setTransactionData(sampleTransactions[type]);
//     setError(null);
//     setResult(null);

//     // Focus the textarea
//     if (textareaRef.current) {
//       textareaRef.current.focus();
//     }
//   };

//   const autoScanTransaction = async () => {
//     if (!web3Enabled || !window.ethereum) {
//       setError('Please connect your wallet first');
//       return;
//     }

//     setScanning(true);
//     setError(null);
//     setResult(null);
//     setProgress(0);

//     try {
//       const progressInterval = setInterval(() => {
//         setProgress(prev => {
//           if (prev >= 90) {
//             clearInterval(progressInterval);
//             return 90;
//           }
//           return prev + 10;
//         });
//       }, 200);

//       // Get current account
//       const accounts = await window.ethereum.request({
//         method: 'eth_requestAccounts'
//       });

//       if (accounts.length === 0) {
//         throw new Error('No accounts found');
//       }

//       const userAddress = accounts[0];

//       // Auto-scan current transaction
//       const response = await axios.post('http://localhost:5000/api/scan/auto-scan', {
//         userAddress: userAddress
//       });

//       clearInterval(progressInterval);
//       setProgress(100);

//       setTimeout(() => {
//         setResult(response.data);
//         setScanning(false);
//         setProgress(0);

//         // Populate the textarea with the scanned transaction
//         if (response.data.transaction) {
//           setTransactionData(JSON.stringify(response.data.transaction, null, 2));
//         }
//       }, 500);

//     } catch (error) {
//       setScanning(false);
//       setProgress(0);

//       if (error.response?.data?.error) {
//         setError(error.response.data.error);
//       } else if (error.message) {
//         setError(error.message);
//       } else {
//         setError('Failed to auto-scan transaction. Please try again.');
//       }

//       console.error('Auto-scan error:', error);
//     }
//   };

//   const validateTransactionData = (data) => {
//     if (!data.trim()) {
//       throw new Error('Transaction data is required');
//     }

//     try {
//       const parsed = JSON.parse(data);

//       if (typeof parsed !== 'object' || parsed === null) {
//         throw new Error('Transaction data must be a valid JSON object');
//       }

//       if (!parsed.to && !parsed.data) {
//         throw new Error('Transaction must have either "to" address or "data"');
//       }

//       return parsed;
//     } catch (parseError) {
//       throw new Error('Invalid JSON format. Please check your transaction data.');
//     }
//   };

//   const scanTransaction = async () => {
//     if (!transactionData.trim()) return;

//     setScanning(true);
//     setError(null);
//     setResult(null);
//     setProgress(0);

//     try {
//       // Validate input
//       const parsedData = validateTransactionData(transactionData);

//       // Simulate progress for better UX
//       const progressInterval = setInterval(() => {
//         setProgress(prev => {
//           if (prev >= 90) {
//             clearInterval(progressInterval);
//             return 90;
//           }
//           return prev + 10;
//         });
//       }, 200);

//       // Make API call
//       const response = await axios.post('http://localhost:5000/api/scan/transaction', {
//         transactionData: parsedData,
//         userAddress: window.ethereum?.selectedAddress || 'anonymous'
//       });

//       clearInterval(progressInterval);
//       setProgress(100);

//       // Small delay to show completion
//       setTimeout(() => {
//         setResult(response.data);
//         setScanning(false);
//         setProgress(0);
//       }, 500);

//     } catch (error) {
//       setScanning(false);
//       setProgress(0);

//       if (error.response?.data?.error) {
//         setError(error.response.data.error);
//       } else if (error.message) {
//         setError(error.message);
//       } else {
//         setError('Failed to scan transaction. Please try again.');
//       }

//       console.error('Scan error:', error);
//     }
//   };

//   const getThreatLevelText = (level) => {
//     const levels = ['SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
//     return levels[level] || 'UNKNOWN';
//   };

//   const getThreatIcon = (level) => {
//     switch (level) {
//       case 'CRITICAL': return '🚨';
//       case 'HIGH': return '⚠️';
//       case 'MEDIUM': return '🔍';
//       case 'LOW': return '📝';
//       default: return '✅';
//     }
//   };

//   const getThreatDescription = (level, riskScore) => {
//     switch (level) {
//       case 'CRITICAL':
//         return 'Immediate action required. This transaction shows clear signs of malicious intent.';
//       case 'HIGH':
//         return 'High risk detected. Proceed with extreme caution and verify all details.';
//       case 'MEDIUM':
//         return 'Moderate risk detected. Review transaction details carefully before proceeding.';
//       case 'LOW':
//         return 'Low risk detected. Standard security review recommended.';
//       default:
//         return 'Transaction appears safe. Always verify addresses before sending.';
//     }
//   };

//   const canScan = transactionData.trim() && !scanning && web3Enabled && backendStatus === 'connected';

//   return (
//     <ScannerContainer>
//       <ScannerHeader>
//         <Title>
//           <span>🔍</span>
//           Transaction Security Scanner
//         </Title>
//         <Description>
//           AI-powered analysis of blockchain transactions with Zero-Knowledge Proof verification.
//           Scan for malicious contracts, suspicious patterns, and potential threats.
//         </Description>
//       </ScannerHeader>

//       <InputSection>
//         <InputGroup>
//           <Label htmlFor="transaction-data">
//             Transaction Data (JSON Format)
//           </Label>
//           <TextArea
//             ref={textareaRef}
//             id="transaction-data"
//             placeholder={`Paste your transaction data as JSON:\n\n{\n  "to": "0x742d35Cc6634C0532925a3b8D3Bf5d1C4f1E8a1f",\n  "value": "0xde0b6b3a7640000",\n  "data": "0x",\n  "gasPrice": "0x4a817c800",\n  "gas": "0x5208"\n}`}
//             value={transactionData}
//             onChange={(e) => {
//               setTransactionData(e.target.value);
//               setError(null);
//             }}
//             disabled={!web3Enabled || scanning}
//             error={!!error}
//             spellCheck={false}
//           />
//         </InputGroup>

//         <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
//           <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
//             <QuickExampleButton
//               onClick={() => loadExample('safe')}
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               disabled={scanning}
//             >
//               Load Safe Example
//             </QuickExampleButton>
//             <QuickExampleButton
//               onClick={() => loadExample('suspicious')}
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               disabled={scanning}
//             >
//               Load Suspicious Example
//             </QuickExampleButton>
//             <QuickExampleButton
//               onClick={() => loadExample('critical')}
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               disabled={scanning}
//             >
//               Load Critical Example
//             </QuickExampleButton>
//           </div>

//           <AutoScanButton
//             onClick={autoScanTransaction}
//             disabled={!web3Enabled || scanning}
//             whileHover={web3Enabled && !scanning ? { scale: 1.02 } : {}}
//             whileTap={web3Enabled && !scanning ? { scale: 0.98 } : {}}
//           >
//             <span>🔍</span>
//             Auto-Scan Current Transaction
//           </AutoScanButton>
//         </div>

//         <ScanButton
//           onClick={scanTransaction}
//           disabled={!canScan}
//           scanning={scanning}
//           whileHover={canScan ? { scale: 1.02 } : {}}
//           whileTap={canScan ? { scale: 0.98 } : {}}
//         >
//           {scanning && <ScanProgress progress={progress} />}
//           <ButtonContent>
//             {scanning ? (
//               <>
//                 <Loader />
//                 Scanning... {progress}%
//               </>
//             ) : (
//               <>
//                 <span>🛡️</span>
//                 Scan Transaction
//               </>
//             )}
//           </ButtonContent>
//         </ScanButton>
//       </InputSection>

//       <AnimatePresence>
//         {!web3Enabled && (
//           <WarningMessage
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: 'auto' }}
//             exit={{ opacity: 0, height: 0 }}
//           >
//             <span>🔗</span>
//             Please connect your Web3 wallet to enable transaction scanning.
//           </WarningMessage>
//         )}

//         {web3Enabled && backendStatus !== 'connected' && (
//           <WarningMessage
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: 'auto' }}
//             exit={{ opacity: 0, height: 0 }}
//           >
//             <span>🔌</span>
//             Backend service is unavailable. Please check if the server is running.
//           </WarningMessage>
//         )}

//         {error && (
//           <ErrorMessage
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: 'auto' }}
//             exit={{ opacity: 0, height: 0 }}
//           >
//             <span>❌</span>
//             {error}
//           </ErrorMessage>
//         )}
//       </AnimatePresence>

//       <AnimatePresence>
//         {result && (
//           <ResultSection
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//           >
//             <ResultCard>
//               <ResultHeader threatLevel={getThreatLevelText(result.analysis.threatLevel)}>
//                 <ThreatLevel>
//                   <ThreatTitle level={getThreatLevelText(result.analysis.threatLevel)}>
//                     {getThreatIcon(result.analysis.threatLevel)}
//                     Threat Level: {getThreatLevelText(result.analysis.threatLevel)}
//                   </ThreatTitle>
//                   <RiskScore>
//                     Risk Score: {result.analysis.riskScore}/100
//                   </RiskScore>
//                 </ThreatLevel>
//                 <ThreatDescription>
//                   {getThreatDescription(getThreatLevelText(result.analysis.threatLevel), result.analysis.riskScore)}
//                 </ThreatDescription>
//               </ResultHeader>

//               <ResultContent>
//                 {result.analysis.warnings && result.analysis.warnings.length > 0 && (
//                   <Section>
//                     <SectionTitle>
//                       <span>⚠️</span>
//                       Security Warnings
//                     </SectionTitle>
//                     <List>
//                       {result.analysis.warnings.map((warning, index) => (
//                         <WarningItem key={index} icon="🚨">
//                           {warning}
//                         </WarningItem>
//                       ))}
//                     </List>
//                   </Section>
//                 )}

//                 {result.analysis.risks && result.analysis.risks.length > 0 && (
//                   <Section>
//                     <SectionTitle>
//                       <span>🔍</span>
//                       Identified Risks
//                     </SectionTitle>
//                     <List>
//                       {result.analysis.risks.map((risk, index) => (
//                         <ListItem key={index} icon="🎯">
//                           {risk.replace(/_/g, ' ')}
//                         </ListItem>
//                       ))}
//                     </List>
//                   </Section>
//                 )}

//                 {result.analysis.recommendations && result.analysis.recommendations.length > 0 && (
//                   <Section>
//                     <SectionTitle>
//                       <span>💡</span>
//                       Recommendations
//                     </SectionTitle>
//                     <List>
//                       {result.analysis.recommendations.map((recommendation, index) => (
//                         <RecommendationItem key={index} icon="✅">
//                           {recommendation}
//                         </RecommendationItem>
//                       ))}
//                     </List>
//                   </Section>
//                 )}

//                 <ZKProofSection>
//                   <ZKProofTitle>
//                     <span>🔒</span>
//                     Zero-Knowledge Proof Generated
//                   </ZKProofTitle>
//                   <ZKProofCode>
//                     {result.zkpData?.proof || 'ZK-Proof generation complete'}
//                   </ZKProofCode>
//                   <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#64748b' }}>
//                     This ZK-proof allows anonymous contribution to threat intelligence without revealing your data.
//                   </div>
//                 </ZKProofSection>
//               </ResultContent>
//             </ResultCard>
//           </ResultSection>
//         )}
//       </AnimatePresence>
//     </ScannerContainer>
//   );
// }

// export default TransactionScanner;
