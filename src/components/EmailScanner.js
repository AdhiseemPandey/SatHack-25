import React, { useState, useRef } from "react";
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
  font-family: "Inter", sans-serif;
  min-height: 200px;
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
  gap: 14px;
  flex-wrap: wrap;
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
  background: ${(props) =>
    props.isSpam
      ? "linear-gradient(135deg, rgba(254, 226, 226, 0.2) 0%, rgba(254, 202, 202, 0.3) 100%)"
      : "linear-gradient(135deg, rgba(236, 253, 245, 0.2) 0%, rgba(209, 250, 229, 0.3) 100%)"};
  padding: 28px 32px;
  border-bottom: 1px solid ${(props) => props.theme.glassBorder};
`;

const ResultTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const SpamStatus = styled(motion.h3)`
  font-size: 1.6rem;
  font-weight: 800;
  color: ${(props) =>
    props.isSpam ? props.theme.danger : props.theme.success};
  display: flex;
  align-items: center;
  gap: 14px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
`;

const ConfidenceScore = styled(motion.div)`
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

const ResultDescription = styled.p`
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

const RiskItem = styled(ListItem)`
  color: ${(props) => props.theme.danger};
  font-weight: 600;
`;

const AnalysisSection = styled(motion.div)`
  background: ${(props) => props.theme.glass};
  backdrop-filter: blur(20px);
  border: 1px solid ${(props) => props.theme.glassBorder};
  border-radius: 20px;
  padding: 24px;
  margin-top: 24px;
`;

const AnalysisTitle = styled.h5`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${(props) => props.theme.text};
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AnalysisGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const AnalysisItem = styled(motion.div)`
  background: ${(props) => props.theme.cardBackground};
  padding: 20px;
  border-radius: 16px;
  border: 1px solid ${(props) => props.theme.glassBorder};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }
`;

const AnalysisLabel = styled.div`
  font-size: 0.9rem;
  color: ${(props) => props.theme.textSecondary};
  margin-bottom: 8px;
  font-weight: 600;
`;

const AnalysisValue = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  color: ${(props) => props.theme.text};
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

function EmailScanner({ backendStatus }) {
  const [emailContent, setEmailContent] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const textareaRef = useRef(null);

  // Sample email content for quick testing
  const sampleEmails = {
    spam: `Urgent: Your Account Will Be Suspended!

Dear User,

We have detected suspicious activity on your account. To prevent immediate suspension, you must verify your account within 24 hours.

CLICK HERE TO VERIFY: http://fake-security-update.com/verify

This is your final warning. Failure to comply will result in permanent account termination.

Best regards,
Security Team
Fake Bank Corporation`,

    phishing: `Congratulations! You've Won $1,000,000!

You are our 1,000,000th visitor! Click the link below to claim your prize:

http://free-money-now.com/claim?user=12345

But hurry! This offer expires in 15 minutes.

Don't miss this once-in-a-lifetime opportunity!`,

    legitimate: `Hi John,

Attached is the quarterly report you requested. I've included all the relevant data and analysis for Q3 2024.

Let me know if you need any additional information or would like to schedule a meeting to discuss the findings.

Best regards,
Sarah Johnson
Finance Department
Acme Corporation`,
  };

  const loadExample = (type) => {
    setEmailContent(sampleEmails[type]);
    setError(null);
    setResult(null);

    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const validateEmailContent = (content) => {
    if (!content.trim()) {
      throw new Error("Email content is required");
    }

    if (content.length < 10) {
      throw new Error(
        "Email content seems too short. Please provide more context."
      );
    }

    if (content.length > 10000) {
      throw new Error(
        "Email content is too long. Please limit to 10,000 characters."
      );
    }

    return content;
  };

  const scanEmail = async () => {
    if (!emailContent.trim()) return;

    setScanning(true);
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      validateEmailContent(emailContent);

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
        "http://localhost:5000/api/scan/email",
        {
          emailContent: emailContent,
          scanType: "comprehensive",
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
        setError("Failed to scan email. Please try again.");
      }

      console.error("Email scan error:", error);
    }
  };

  const getSpamDescription = (isSpam, confidence) => {
    if (isSpam) {
      if (confidence > 85) {
        return "This email shows clear signs of being spam or phishing. Do not interact with any links or provide personal information.";
      } else {
        return "This email is likely spam. Exercise caution and verify the sender before taking any action.";
      }
    } else {
      if (confidence > 80) {
        return "This email appears to be legitimate. Always verify unexpected requests directly with the sender.";
      } else {
        return "This email shows no obvious spam indicators. Use normal caution when handling emails.";
      }
    }
  };

  const canScan =
    emailContent.trim() && !scanning && backendStatus === "connected";

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
              📧
            </motion.span>
            Email Spam Detection
          </Title>
          <Description>
            AI-powered spam and phishing detection for emails. Advanced pattern
            recognition identifies suspicious content and potential threats.
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
              Email Content
            </Label>
            <TextArea
              ref={textareaRef}
              placeholder="Paste the email content you want to analyze for spam or phishing attempts..."
              value={emailContent}
              onChange={(e) => {
                setEmailContent(e.target.value);
                setError(null);
              }}
              disabled={scanning}
              error={!!error}
              spellCheck={true}
              whileFocus={{ scale: 1.01 }}
            />
          </InputGroup>

          <ButtonGroup>
            <ExampleButton
              onClick={() => loadExample("spam")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={scanning}
            >
              🚫 Spam Example
            </ExampleButton>
            <ExampleButton
              onClick={() => loadExample("phishing")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={scanning}
            >
              🎣 Phishing Example
            </ExampleButton>
            <ExampleButton
              onClick={() => loadExample("legitimate")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={scanning}
            >
              ✅ Legitimate Example
            </ExampleButton>
          </ButtonGroup>

          <ScanButton
            onClick={scanEmail}
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
                  Analyzing... {progress}%
                </>
              ) : (
                <>
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🔍
                  </motion.span>
                  Analyze Email
                </>
              )}
            </ButtonContent>
          </ScanButton>
        </InputSection>

        <AnimatePresence>
          {backendStatus !== "connected" && (
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
                <ResultHeader isSpam={result.isSpam}>
                  <ResultTitle>
                    <SpamStatus
                      isSpam={result.isSpam}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {result.isSpam
                        ? "🚫 SPAM DETECTED"
                        : "✅ LEGITIMATE EMAIL"}
                    </SpamStatus>
                    <ConfidenceScore whileHover={{ scale: 1.1 }}>
                      Confidence: {result.confidence}%
                    </ConfidenceScore>
                  </ResultTitle>
                  <ResultDescription>
                    {getSpamDescription(result.isSpam, result.confidence)}
                  </ResultDescription>
                </ResultHeader>

                <ResultContent>
                  {result.riskFactors && result.riskFactors.length > 0 && (
                    <Section
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <SectionTitle>
                        <span>⚠️</span>
                        Detected Risk Factors
                      </SectionTitle>
                      <List>
                        {result.riskFactors.map((factor, index) => (
                          <RiskItem
                            key={index}
                            icon="🎯"
                            whileHover={{ x: 10 }}
                          >
                            {factor}
                          </RiskItem>
                        ))}
                      </List>
                    </Section>
                  )}

                  <Section
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <SectionTitle>
                      <span>📊</span>
                      Email Analysis
                    </SectionTitle>
                    <AnalysisGrid>
                      <AnalysisItem whileHover={{ scale: 1.05 }}>
                        <AnalysisLabel>Spam Score</AnalysisLabel>
                        <AnalysisValue>{result.confidence}/100</AnalysisValue>
                      </AnalysisItem>
                      <AnalysisItem whileHover={{ scale: 1.05 }}>
                        <AnalysisLabel>AI Confidence</AnalysisLabel>
                        <AnalysisValue>{result.confidence}%</AnalysisValue>
                      </AnalysisItem>
                      {result.features && (
                        <>
                          <AnalysisItem whileHover={{ scale: 1.05 }}>
                            <AnalysisLabel>Keywords Found</AnalysisLabel>
                            <AnalysisValue>
                              {result.features.spam_keyword_score || "N/A"}
                            </AnalysisValue>
                          </AnalysisItem>
                          <AnalysisItem whileHover={{ scale: 1.05 }}>
                            <AnalysisLabel>URL Analysis</AnalysisLabel>
                            <AnalysisValue>
                              {result.features.suspicious_url_ratio || "N/A"}
                            </AnalysisValue>
                          </AnalysisItem>
                        </>
                      )}
                    </AnalysisGrid>
                  </Section>

                  <AnalysisSection
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <AnalysisTitle>
                      <motion.span
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        🤖
                      </motion.span>
                      AI Analysis Notes
                    </AnalysisTitle>
                    <div
                      style={{
                        fontSize: "1rem",
                        color: elegantTheme.text,
                        lineHeight: "1.6",
                      }}
                    >
                      {result.isSpam ? (
                        <p>
                          This email was flagged as potential spam based on AI
                          pattern matching and content analysis. Common spam
                          indicators include urgent language, financial
                          incentives, and suspicious links.
                        </p>
                      ) : (
                        <p>
                          This email appears legitimate based on AI content
                          analysis. No strong spam indicators were detected.
                        </p>
                      )}
                      <p
                        style={{
                          marginTop: "12px",
                          fontStyle: "italic",
                          color: elegantTheme.textSecondary,
                        }}
                      >
                        Note: This analysis is powered by machine learning and
                        should be used as a guide, not a definitive
                        classification.
                      </p>
                    </div>
                  </AnalysisSection>
                </ResultContent>
              </ResultCard>
            </ResultSection>
          )}
        </AnimatePresence>
      </ScannerContainer>
    </ThemeProvider>
  );
}

export default EmailScanner;
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
//   font-family: 'Inter', sans-serif;
//   min-height: 200px;
//   resize: vertical;
//   transition: all 0.3s ease;
//   background: white;
//   line-height: 1.6;

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
//   background: ${props => props.isSpam ? '#fee2e2' : '#ecfdf5'};
//   padding: 20px 24px;
//   border-bottom: 1px solid #e5e7eb;
// `;

// const ResultTitle = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
//   margin-bottom: 8px;
// `;

// const SpamStatus = styled.h3`
//   font-size: 1.3rem;
//   font-weight: 700;
//   color: ${props => props.isSpam ? '#dc2626' : '#059669'};
//   display: flex;
//   align-items: center;
//   gap: 8px;
// `;

// const ConfidenceScore = styled.div`
//   background: white;
//   padding: 6px 12px;
//   border-radius: 20px;
//   font-weight: 600;
//   color: #374151;
//   font-size: 0.9rem;
//   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
// `;

// const ResultDescription = styled.p`
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

// const RiskItem = styled(ListItem)`
//   color: #dc2626;
//   font-weight: 500;
// `;

// const AnalysisSection = styled.div`
//   background: #f8fafc;
//   border: 1px solid #e2e8f0;
//   border-radius: 12px;
//   padding: 16px;
//   margin-top: 16px;
// `;

// const AnalysisTitle = styled.h5`
//   font-size: 0.9rem;
//   font-weight: 600;
//   color: #475569;
//   margin-bottom: 8px;
//   display: flex;
//   align-items: center;
//   gap: 6px;
// `;

// const AnalysisGrid = styled.div`
//   display: grid;
//   grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
//   gap: 12px;
//   margin-top: 12px;
// `;

// const AnalysisItem = styled.div`
//   background: white;
//   padding: 12px;
//   border-radius: 8px;
//   border: 1px solid #e2e8f0;
// `;

// const AnalysisLabel = styled.div`
//   font-size: 0.8rem;
//   color: #64748b;
//   margin-bottom: 4px;
// `;

// const AnalysisValue = styled.div`
//   font-size: 1rem;
//   font-weight: 600;
//   color: #1e293b;
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

// const Loader = styled(motion.div)`
//   width: 20px;
//   height: 20px;
//   border: 2px solid transparent;
//   border-top: 2px solid currentColor;
//   border-radius: 50%;
// `;

// function EmailScanner({ backendStatus }) {
//   const [emailContent, setEmailContent] = useState('');
//   const [scanning, setScanning] = useState(false);
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState(null);
//   const [progress, setProgress] = useState(0);
//   const textareaRef = useRef(null);

//   // Sample email content for quick testing
//   const sampleEmails = {
//     spam: `Urgent: Your Account Will Be Suspended!

// Dear User,

// We have detected suspicious activity on your account. To prevent immediate suspension, you must verify your account within 24 hours.

// CLICK HERE TO VERIFY: http://fake-security-update.com/verify

// This is your final warning. Failure to comply will result in permanent account termination.

// Best regards,
// Security Team
// Fake Bank Corporation`,

//     phishing: `Congratulations! You've Won $1,000,000!

// You are our 1,000,000th visitor! Click the link below to claim your prize:

// http://free-money-now.com/claim?user=12345

// But hurry! This offer expires in 15 minutes.

// Don't miss this once-in-a-lifetime opportunity!`,

//     legitimate: `Hi John,

// Attached is the quarterly report you requested. I've included all the relevant data and analysis for Q3 2024.

// Let me know if you need any additional information or would like to schedule a meeting to discuss the findings.

// Best regards,
// Sarah Johnson
// Finance Department
// Acme Corporation`
//   };

//   const loadExample = (type) => {
//     setEmailContent(sampleEmails[type]);
//     setError(null);
//     setResult(null);

//     // Focus the textarea
//     if (textareaRef.current) {
//       textareaRef.current.focus();
//     }
//   };

//   const validateEmailContent = (content) => {
//     if (!content.trim()) {
//       throw new Error('Email content is required');
//     }

//     if (content.length < 10) {
//       throw new Error('Email content seems too short. Please provide more context.');
//     }

//     if (content.length > 10000) {
//       throw new Error('Email content is too long. Please limit to 10,000 characters.');
//     }

//     return content;
//   };

//   const scanEmail = async () => {
//     if (!emailContent.trim()) return;

//     setScanning(true);
//     setError(null);
//     setResult(null);
//     setProgress(0);

//     try {
//       // Validate input
//       validateEmailContent(emailContent);

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

//       // Make API call to backend
//       const response = await axios.post('http://localhost:5000/api/scan/email', {
//         emailContent: emailContent,
//         scanType: 'comprehensive'
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
//         setError('Failed to scan email. Please try again.');
//       }

//       console.error('Email scan error:', error);
//     }
//   };

//   const getSpamDescription = (isSpam, confidence) => {
//     if (isSpam) {
//       if (confidence > 85) {
//         return 'This email shows clear signs of being spam or phishing. Do not interact with any links or provide personal information.';
//       } else {
//         return 'This email is likely spam. Exercise caution and verify the sender before taking any action.';
//       }
//     } else {
//       if (confidence > 80) {
//         return 'This email appears to be legitimate. Always verify unexpected requests directly with the sender.';
//       } else {
//         return 'This email shows no obvious spam indicators. Use normal caution when handling emails.';
//       }
//     }
//   };

//   const canScan = emailContent.trim() && !scanning && backendStatus === 'connected';

//   return (
//     <ScannerContainer>
//       <ScannerHeader>
//         <Title>
//           <span>📧</span>
//           Email Spam Detection
//         </Title>
//         <Description>
//           AI-powered spam and phishing detection for emails.
//           Advanced pattern recognition identifies suspicious content and potential threats.
//         </Description>
//       </ScannerHeader>

//       <InputSection>
//         <InputGroup>
//           <Label htmlFor="email-content">
//             Email Content
//           </Label>
//           <TextArea
//             ref={textareaRef}
//             id="email-content"
//             placeholder="Paste the email content you want to analyze for spam or phishing attempts..."
//             value={emailContent}
//             onChange={(e) => {
//               setEmailContent(e.target.value);
//               setError(null);
//             }}
//             disabled={scanning}
//             error={!!error}
//             spellCheck={true}
//           />
//         </InputGroup>

//         <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
//           <QuickExampleButton
//             onClick={() => loadExample('spam')}
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             disabled={scanning}
//           >
//             Load Spam Example
//           </QuickExampleButton>
//           <QuickExampleButton
//             onClick={() => loadExample('phishing')}
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             disabled={scanning}
//           >
//             Load Phishing Example
//           </QuickExampleButton>
//           <QuickExampleButton
//             onClick={() => loadExample('legitimate')}
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             disabled={scanning}
//           >
//             Load Legitimate Example
//           </QuickExampleButton>
//         </div>

//         <ScanButton
//           onClick={scanEmail}
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
//                 Analyzing... {progress}%
//               </>
//             ) : (
//               <>
//                 <span>🔍</span>
//                 Analyze Email
//               </>
//             )}
//           </ButtonContent>
//         </ScanButton>
//       </InputSection>

//       <AnimatePresence>
//         {backendStatus !== 'connected' && (
//           <ErrorMessage
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: 'auto' }}
//             exit={{ opacity: 0, height: 0 }}
//           >
//             <span>🔌</span>
//             Backend service is unavailable. Please check if the server is running.
//           </ErrorMessage>
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
//               <ResultHeader isSpam={result.isSpam}>
//                 <ResultTitle>
//                   <SpamStatus isSpam={result.isSpam}>
//                     {result.isSpam ? '🚫 SPAM DETECTED' : '✅ LEGITIMATE EMAIL'}
//                   </SpamStatus>
//                   <ConfidenceScore>
//                     Confidence: {result.confidence}%
//                   </ConfidenceScore>
//                 </ResultTitle>
//                 <ResultDescription>
//                   {getSpamDescription(result.isSpam, result.confidence)}
//                 </ResultDescription>
//               </ResultHeader>

//               <ResultContent>
//                 {result.riskFactors && result.riskFactors.length > 0 && (
//                   <Section>
//                     <SectionTitle>
//                       <span>⚠️</span>
//                       Detected Risk Factors
//                     </SectionTitle>
//                     <List>
//                       {result.riskFactors.map((factor, index) => (
//                         <RiskItem key={index} icon="🎯">
//                           {factor}
//                         </RiskItem>
//                       ))}
//                     </List>
//                   </Section>
//                 )}

//                 <Section>
//                   <SectionTitle>
//                     <span>📊</span>
//                     Email Analysis
//                   </SectionTitle>
//                   <AnalysisGrid>
//                     <AnalysisItem>
//                       <AnalysisLabel>Spam Score</AnalysisLabel>
//                       <AnalysisValue>{result.confidence}/100</AnalysisValue>
//                     </AnalysisItem>
//                     <AnalysisItem>
//                       <AnalysisLabel>AI Confidence</AnalysisLabel>
//                       <AnalysisValue>{result.confidence}%</AnalysisValue>
//                     </AnalysisItem>
//                     {result.features && (
//                       <>
//                         <AnalysisItem>
//                           <AnalysisLabel>Keywords Found</AnalysisLabel>
//                           <AnalysisValue>{result.features.spam_keyword_score || 'N/A'}</AnalysisValue>
//                         </AnalysisItem>
//                         <AnalysisItem>
//                           <AnalysisLabel>URL Analysis</AnalysisLabel>
//                           <AnalysisValue>{result.features.suspicious_url_ratio || 'N/A'}</AnalysisValue>
//                         </AnalysisItem>
//                       </>
//                     )}
//                   </AnalysisGrid>
//                 </Section>

//                 <AnalysisSection>
//                   <AnalysisTitle>
//                     <span>🤖</span>
//                     AI Analysis Notes
//                   </AnalysisTitle>
//                   <div style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.5' }}>
//                     {result.isSpam ? (
//                       <p>
//                         This email was flagged as potential spam based on AI pattern matching and content analysis.
//                         Common spam indicators include urgent language, financial incentives, and suspicious links.
//                       </p>
//                     ) : (
//                       <p>
//                         This email appears legitimate based on AI content analysis. No strong spam indicators were detected.
//                       </p>
//                     )}
//                     <p style={{ marginTop: '8px', fontStyle: 'italic' }}>
//                       Note: This analysis is powered by machine learning and should be used as a guide, not a definitive classification.
//                     </p>
//                   </div>
//                 </AnalysisSection>
//               </ResultContent>
//             </ResultCard>
//           </ResultSection>
//         )}
//       </AnimatePresence>
//     </ScannerContainer>
//   );
// }

// export default EmailScanner;
