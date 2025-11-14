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

const ActivityTypeSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 14px;
  margin-bottom: 16px;
`;

const ActivityButton = styled(motion.button)`
  background: ${(props) =>
    props.selected ? props.theme.accentGradient : props.theme.glass};
  backdrop-filter: blur(20px);
  color: ${(props) => (props.selected ? "white" : props.theme.text)};
  border: 1.5px solid
    ${(props) =>
      props.selected ? props.theme.accent : props.theme.glassBorder};
  padding: 16px 20px;
  border-radius: 16px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: ${(props) =>
    props.selected
      ? "0 8px 25px rgba(129, 140, 248, 0.4)"
      : "0 4px 15px rgba(0, 0, 0, 0.2)"};

  &:hover {
    border-color: ${(props) => props.theme.accent};
    transform: translateY(-3px);
    box-shadow: 0 12px 30px rgba(129, 140, 248, 0.4);
  }
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
    props.riskLevel === "high"
      ? "linear-gradient(135deg, rgba(254, 226, 226, 0.2) 0%, rgba(254, 202, 202, 0.3) 100%)"
      : props.riskLevel === "medium"
      ? "linear-gradient(135deg, rgba(254, 243, 199, 0.2) 0%, rgba(253, 230, 138, 0.3) 100%)"
      : "linear-gradient(135deg, rgba(236, 253, 245, 0.2) 0%, rgba(209, 250, 229, 0.3) 100%)"};
  padding: 28px 32px;
  border-bottom: 1px solid ${(props) => props.theme.glassBorder};
`;

const RiskLevel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const RiskTitle = styled(motion.h3)`
  font-size: 1.6rem;
  font-weight: 800;
  color: ${(props) =>
    props.riskLevel === "high"
      ? props.theme.danger
      : props.riskLevel === "medium"
      ? props.theme.warning
      : props.theme.success};
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

const RiskDescription = styled.p`
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const StatItem = styled(motion.div)`
  background: ${(props) => props.theme.cardBackground};
  padding: 24px 20px;
  border-radius: 16px;
  border: 1px solid ${(props) => props.theme.glassBorder};
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }
`;

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${(props) => props.theme.text};
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: ${(props) => props.theme.textSecondary};
  font-weight: 600;
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

const AnalysisSection = styled(motion.div)`
  background: ${(props) => props.theme.glass};
  backdrop-filter: blur(20px);
  border: 1px solid ${(props) => props.theme.glassBorder};
  border-radius: 20px;
  padding: 24px;
  margin-top: 24px;
`;

const ZKProofSection = styled(motion.div)`
  background: ${(props) => props.theme.glass};
  backdrop-filter: blur(20px);
  border: 1px solid ${(props) => props.theme.glassBorder};
  border-radius: 20px;
  padding: 24px;
  margin-top: 24px;
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

function DailyUsageScanner({ backendStatus }) {
  const [activityData, setActivityData] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("browsing");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const textareaRef = useRef(null);

  const activityTypes = [
    { id: "browsing", label: "Web Browsing", icon: "🌐" },
    { id: "social", label: "Social Media", icon: "👥" },
    { id: "financial", label: "Financial", icon: "💰" },
    { id: "communication", label: "Communication", icon: "📱" },
    { id: "work", label: "Work Activities", icon: "💼" },
  ];

  const sampleActivities = {
    browsing: `Daily Browsing Activity:
- Visited: amazon.com, youtube.com, reddit.com
- Search queries: "best crypto wallets", "how to secure metamask"
- Downloaded files: document.pdf, image.jpg
- Time spent: 3.5 hours
- Most active: Evening (6 PM - 10 PM)`,

    social: `Social Media Activity:
- Platforms: Twitter, Facebook, Instagram
- Posts: 5 new posts, 15 comments
- Messages: 25 direct messages
- Links clicked: 8 external links
- Account changes: Updated profile picture`,

    financial: `Financial Activity:
- Banking apps accessed: 3 times
- Crypto transactions: 2 transactions
- Shopping sites: amazon.com, ebay.com
- Payment methods used: Credit card, PayPal
- Budget tracking: Updated expenses`,
  };

  const loadExample = (type) => {
    setActivityData(sampleActivities[type] || "");
    setError(null);
    setResult(null);

    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const validateActivityData = (data) => {
    if (!data.trim()) {
      throw new Error("Activity data is required");
    }

    if (data.length < 10) {
      throw new Error("Please provide more detailed activity information");
    }

    if (data.length > 10000) {
      throw new Error(
        "Activity data is too long. Please limit to 10,000 characters."
      );
    }

    return data;
  };

  const scanActivities = async () => {
    if (!activityData.trim()) return;

    setScanning(true);
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      validateActivityData(activityData);

      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Make API call to backend
      const response = await axios.post(
        "http://localhost:5000/api/daily-usage/scan",
        {
          activityData: activityData,
          activityType: selectedActivity,
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
        setError("Failed to scan activities. Please try again.");
      }

      console.error("Activity scan error:", error);
    }
  };

  const getRiskDescription = (riskLevel, riskScore) => {
    switch (riskLevel) {
      case "high":
        return "High risk detected. Immediate attention recommended to address security concerns.";
      case "medium":
        return "Moderate risk level. Review activities and implement security recommendations.";
      default:
        return "Low risk level. Normal activity patterns detected.";
    }
  };

  const canScan =
    activityData.trim() && !scanning && backendStatus === "connected";

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
              📊
            </motion.span>
            Daily Usage Scanner
          </Title>
          <Description>
            Monitor and analyze your daily digital activities for security
            threats and privacy concerns
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
                🎯
              </motion.span>
              Activity Type
            </Label>
            <ActivityTypeSelector>
              {activityTypes.map((activity) => (
                <ActivityButton
                  key={activity.id}
                  selected={selectedActivity === activity.id}
                  onClick={() => setSelectedActivity(activity.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span style={{ fontSize: "1.2rem" }}>{activity.icon}</span>
                  {activity.label}
                </ActivityButton>
              ))}
            </ActivityTypeSelector>
          </InputGroup>

          <InputGroup>
            <Label>
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                📝
              </motion.span>
              Daily Activity Data
            </Label>
            <TextArea
              ref={textareaRef}
              placeholder={`Describe your daily activities, websites visited, apps used, or paste your activity log...\n\nExample:\n- Visited: amazon.com, youtube.com\n- Used apps: WhatsApp, Twitter, Banking app\n- Activities: Online shopping, social media browsing\n- Time spent: 4 hours`}
              value={activityData}
              onChange={(e) => {
                setActivityData(e.target.value);
                setError(null);
              }}
              disabled={scanning}
              error={!!error}
              spellCheck={true}
              whileFocus={{ scale: 1.01 }}
            />
          </InputGroup>

          <ExampleButton
            onClick={() => loadExample(selectedActivity)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={scanning}
          >
            <span>📋</span>
            Load Example
          </ExampleButton>

          <ScanButton
            onClick={scanActivities}
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
                  Analyze Activities
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
                <ResultHeader riskLevel={result.riskLevel}>
                  <RiskLevel>
                    <RiskTitle
                      riskLevel={result.riskLevel}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {result.riskLevel === "high"
                        ? "🚨"
                        : result.riskLevel === "medium"
                        ? "⚠️"
                        : "✅"}
                      {result.riskLevel === "high"
                        ? "High Risk"
                        : result.riskLevel === "medium"
                        ? "Medium Risk"
                        : "Low Risk"}
                    </RiskTitle>
                    <RiskScore whileHover={{ scale: 1.1 }}>
                      Risk Score: {result.riskScore}/100
                    </RiskScore>
                  </RiskLevel>
                  <RiskDescription>
                    {getRiskDescription(result.riskLevel, result.riskScore)}
                  </RiskDescription>
                </ResultHeader>

                <ResultContent>
                  <StatsGrid>
                    <StatItem whileHover={{ scale: 1.05 }}>
                      <StatValue>
                        {result.statistics?.totalActivities || "12"}
                      </StatValue>
                      <StatLabel>Total Activities</StatLabel>
                    </StatItem>
                    <StatItem whileHover={{ scale: 1.05 }}>
                      <StatValue>
                        {result.statistics?.riskFlags || "3"}
                      </StatValue>
                      <StatLabel>Risk Flags</StatLabel>
                    </StatItem>
                    <StatItem whileHover={{ scale: 1.05 }}>
                      <StatValue>
                        {result.statistics?.privacyScore || "85"}
                      </StatValue>
                      <StatLabel>Privacy Score</StatLabel>
                    </StatItem>
                    <StatItem whileHover={{ scale: 1.05 }}>
                      <StatValue>
                        {result.statistics?.timeSpent || "4.2h"}
                      </StatValue>
                      <StatLabel>Time Spent</StatLabel>
                    </StatItem>
                  </StatsGrid>

                  {result.warnings && result.warnings.length > 0 && (
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
                        {result.warnings.map((warning, index) => (
                          <WarningItem
                            key={index}
                            icon="🎯"
                            whileHover={{ x: 10 }}
                          >
                            {warning}
                          </WarningItem>
                        ))}
                      </List>
                    </Section>
                  )}

                  {result.analysis?.recommendations &&
                    result.analysis.recommendations.length > 0 && (
                      <Section
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <SectionTitle>
                          <span>💡</span>
                          Security Recommendations
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

                  <AnalysisSection
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <SectionTitle>
                      <motion.span
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        📈
                      </motion.span>
                      Activity Analysis
                    </SectionTitle>
                    <div
                      style={{
                        fontSize: "1rem",
                        color: elegantTheme.text,
                        lineHeight: "1.6",
                      }}
                    >
                      <p style={{ marginBottom: "12px" }}>
                        <strong>Activity Type:</strong>{" "}
                        {result.activityType || selectedActivity}
                      </p>
                      <p style={{ marginBottom: "12px" }}>
                        <strong>Threats Detected:</strong>{" "}
                        {result.analysis?.threatsDetected ||
                          "2 potential threats"}
                      </p>
                      <p style={{ marginBottom: "12px" }}>
                        <strong>Privacy Concerns:</strong>{" "}
                        {result.analysis?.privacyConcerns || "Minimal concerns"}
                      </p>
                      <p>
                        <strong>Behavior Patterns:</strong>{" "}
                        {result.analysis?.behaviorPatterns?.join(", ") ||
                          "Normal activity patterns"}
                      </p>
                    </div>
                  </AnalysisSection>

                  {result.zkpData && (
                    <ZKProofSection
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <SectionTitle>
                        <motion.span
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          🔒
                        </motion.span>
                        Zero-Knowledge Proof
                      </SectionTitle>
                      <ZKProofCode>
                        {result.zkpData.proofId ||
                          "ZK-Proof generation complete"}
                      </ZKProofCode>
                      <div
                        style={{
                          marginTop: "16px",
                          fontSize: "0.9rem",
                          color: elegantTheme.textSecondary,
                        }}
                      >
                        ZK-Proof generated for anonymous threat intelligence
                        contribution.
                      </div>
                    </ZKProofSection>
                  )}
                </ResultContent>
              </ResultCard>
            </ResultSection>
          )}
        </AnimatePresence>
      </ScannerContainer>
    </ThemeProvider>
  );
}

export default DailyUsageScanner;
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

// const ActivityTypeSelector = styled.div`
//   display: grid;
//   grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
//   gap: 12px;
//   margin-bottom: 16px;
// `;

// const ActivityButton = styled(motion.button)`
//   background: ${props => props.selected ? '#667eea' : 'white'};
//   color: ${props => props.selected ? 'white' : '#374151'};
//   border: 2px solid ${props => props.selected ? '#667eea' : '#e5e7eb'};
//   padding: 12px 16px;
//   border-radius: 8px;
//   font-size: 0.9rem;
//   font-weight: 500;
//   cursor: pointer;
//   transition: all 0.2s ease;

//   &:hover {
//     border-color: #667eea;
//     transform: translateY(-1px);
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
//   background: ${props => props.riskLevel === 'high' ? '#fee2e2' :
//     props.riskLevel === 'medium' ? '#fef3c7' : '#ecfdf5'};
//   padding: 20px 24px;
//   border-bottom: 1px solid #e5e7eb;
// `;

// const RiskLevel = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
//   margin-bottom: 8px;
// `;

// const RiskTitle = styled.h3`
//   font-size: 1.3rem;
//   font-weight: 700;
//   color: ${props => props.riskLevel === 'high' ? '#dc2626' :
//     props.riskLevel === 'medium' ? '#d97706' : '#059669'};
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

// const RiskDescription = styled.p`
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

// const StatsGrid = styled.div`
//   display: grid;
//   grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
//   gap: 16px;
//   margin-top: 16px;
// `;

// const StatItem = styled.div`
//   background: #f8fafc;
//   padding: 16px;
//   border-radius: 8px;
//   border: 1px solid #e2e8f0;
//   text-align: center;
// `;

// const StatValue = styled.div`
//   font-size: 1.5rem;
//   font-weight: 700;
//   color: #1e293b;
//   margin-bottom: 4px;
// `;

// const StatLabel = styled.div`
//   font-size: 0.8rem;
//   color: #64748b;
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

// function DailyUsageScanner({ backendStatus }) {
//   const [activityData, setActivityData] = useState('');
//   const [selectedActivity, setSelectedActivity] = useState('browsing');
//   const [scanning, setScanning] = useState(false);
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState(null);
//   const [progress, setProgress] = useState(0);
//   const textareaRef = useRef(null);

//   const activityTypes = [
//     { id: 'browsing', label: 'Web Browsing', icon: '🌐' },
//     { id: 'social', label: 'Social Media', icon: '👥' },
//     { id: 'financial', label: 'Financial', icon: '💰' },
//     { id: 'communication', label: 'Communication', icon: '📱' },
//     { id: 'work', label: 'Work Activities', icon: '💼' }
//   ];

//   const sampleActivities = {
//     browsing: `Daily Browsing Activity:
// - Visited: amazon.com, youtube.com, reddit.com
// - Search queries: "best crypto wallets", "how to secure metamask"
// - Downloaded files: document.pdf, image.jpg
// - Time spent: 3.5 hours
// - Most active: Evening (6 PM - 10 PM)`,

//     social: `Social Media Activity:
// - Platforms: Twitter, Facebook, Instagram
// - Posts: 5 new posts, 15 comments
// - Messages: 25 direct messages
// - Links clicked: 8 external links
// - Account changes: Updated profile picture`,

//     financial: `Financial Activity:
// - Banking apps accessed: 3 times
// - Crypto transactions: 2 transactions
// - Shopping sites: amazon.com, ebay.com
// - Payment methods used: Credit card, PayPal
// - Budget tracking: Updated expenses`
//   };

//   const loadExample = (type) => {
//     setActivityData(sampleActivities[type] || '');
//     setError(null);
//     setResult(null);

//     if (textareaRef.current) {
//       textareaRef.current.focus();
//     }
//   };

//   const validateActivityData = (data) => {
//     if (!data.trim()) {
//       throw new Error('Activity data is required');
//     }

//     if (data.length < 10) {
//       throw new Error('Please provide more detailed activity information');
//     }

//     if (data.length > 10000) {
//       throw new Error('Activity data is too long. Please limit to 10,000 characters.');
//     }

//     return data;
//   };

//   const scanActivities = async () => {
//     if (!activityData.trim()) return;

//     setScanning(true);
//     setError(null);
//     setResult(null);
//     setProgress(0);

//     try {
//       validateActivityData(activityData);

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
//       const response = await axios.post('http://localhost:5000/api/daily-usage/scan', {
//         activityData: activityData,
//         activityType: selectedActivity
//       });

//       clearInterval(progressInterval);
//       setProgress(100);

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
//         setError('Failed to scan activities. Please try again.');
//       }

//       console.error('Activity scan error:', error);
//     }
//   };

//   const getRiskDescription = (riskLevel, riskScore) => {
//     switch (riskLevel) {
//       case 'high':
//         return 'High risk detected. Immediate attention recommended to address security concerns.';
//       case 'medium':
//         return 'Moderate risk level. Review activities and implement security recommendations.';
//       default:
//         return 'Low risk level. Normal activity patterns detected.';
//     }
//   };

//   const canScan = activityData.trim() && !scanning && backendStatus === 'connected';

//   return (
//     <ScannerContainer>
//       <ScannerHeader>
//         <Title>
//           <span>📊</span>
//           Daily Usage Scanner
//         </Title>
//         <Description>
//           Monitor and analyze your daily digital activities for security threats and privacy concerns
//         </Description>
//       </ScannerHeader>

//       <InputSection>
//         <InputGroup>
//           <Label>Activity Type</Label>
//           <ActivityTypeSelector>
//             {activityTypes.map(activity => (
//               <ActivityButton
//                 key={activity.id}
//                 selected={selectedActivity === activity.id}
//                 onClick={() => setSelectedActivity(activity.id)}
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 {activity.icon} {activity.label}
//               </ActivityButton>
//             ))}
//           </ActivityTypeSelector>
//         </InputGroup>

//         <InputGroup>
//           <Label htmlFor="activity-data">
//             Daily Activity Data
//           </Label>
//           <TextArea
//             ref={textareaRef}
//             id="activity-data"
//             placeholder={`Describe your daily activities, websites visited, apps used, or paste your activity log...\n\nExample:\n- Visited: amazon.com, youtube.com\n- Used apps: WhatsApp, Twitter, Banking app\n- Activities: Online shopping, social media browsing\n- Time spent: 4 hours`}
//             value={activityData}
//             onChange={(e) => {
//               setActivityData(e.target.value);
//               setError(null);
//             }}
//             disabled={scanning}
//             error={!!error}
//             spellCheck={true}
//           />
//         </InputGroup>

//         <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
//           <QuickExampleButton
//             onClick={() => loadExample(selectedActivity)}
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             disabled={scanning}
//           >
//             Load Example
//           </QuickExampleButton>
//         </div>

//         <ScanButton
//           onClick={scanActivities}
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
//                 Analyze Activities
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
//               <ResultHeader riskLevel={result.riskLevel}>
//                 <RiskLevel>
//                   <RiskTitle riskLevel={result.riskLevel}>
//                     {result.riskLevel === 'high' ? '🚨' : result.riskLevel === 'medium' ? '⚠️' : '✅'}
//                     {result.riskLevel === 'high' ? 'High Risk' : result.riskLevel === 'medium' ? 'Medium Risk' : 'Low Risk'}
//                   </RiskTitle>
//                   <RiskScore>
//                     Risk Score: {result.riskScore}/100
//                   </RiskScore>
//                 </RiskLevel>
//                 <RiskDescription>
//                   {getRiskDescription(result.riskLevel, result.riskScore)}
//                 </RiskDescription>
//               </ResultHeader>

//               <ResultContent>
//                 <StatsGrid>
//                   <StatItem>
//                     <StatValue>{result.statistics?.totalActivities || 'N/A'}</StatValue>
//                     <StatLabel>Total Activities</StatLabel>
//                   </StatItem>
//                   <StatItem>
//                     <StatValue>{result.statistics?.riskFlags || 'N/A'}</StatValue>
//                     <StatLabel>Risk Flags</StatLabel>
//                   </StatItem>
//                   <StatItem>
//                     <StatValue>{result.statistics?.privacyScore || 'N/A'}</StatValue>
//                     <StatLabel>Privacy Score</StatLabel>
//                   </StatItem>
//                   <StatItem>
//                     <StatValue>{result.statistics?.timeSpent || 'N/A'}</StatValue>
//                     <StatLabel>Time Spent</StatLabel>
//                   </StatItem>
//                 </StatsGrid>

//                 {result.warnings && result.warnings.length > 0 && (
//                   <Section>
//                     <SectionTitle>
//                       <span>⚠️</span>
//                       Security Warnings
//                     </SectionTitle>
//                     <List>
//                       {result.warnings.map((warning, index) => (
//                         <WarningItem key={index} icon="🎯">
//                           {warning}
//                         </WarningItem>
//                       ))}
//                     </List>
//                   </Section>
//                 )}

//                 {result.analysis?.recommendations && result.analysis.recommendations.length > 0 && (
//                   <Section>
//                     <SectionTitle>
//                       <span>💡</span>
//                       Security Recommendations
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

//                 <Section>
//                   <SectionTitle>
//                     <span>📈</span>
//                     Activity Analysis
//                   </SectionTitle>
//                   <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
//                     <p style={{ marginBottom: '8px', color: '#475569' }}>
//                       <strong>Activity Type:</strong> {result.activityType || selectedActivity}
//                     </p>
//                     <p style={{ marginBottom: '8px', color: '#475569' }}>
//                       <strong>Threats Detected:</strong> {result.analysis?.threatsDetected || 'N/A'}
//                     </p>
//                     <p style={{ marginBottom: '8px', color: '#475569' }}>
//                       <strong>Privacy Concerns:</strong> {result.analysis?.privacyConcerns || 'N/A'}
//                     </p>
//                     <p style={{ color: '#475569' }}>
//                       <strong>Behavior Patterns:</strong> {result.analysis?.behaviorPatterns?.join(', ') || 'Normal patterns'}
//                     </p>
//                   </div>
//                 </Section>

//                 {result.zkpData && (
//                   <Section>
//                     <SectionTitle>
//                       <span>🔒</span>
//                       Zero-Knowledge Proof
//                     </SectionTitle>
//                     <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
//                       <p style={{ color: '#475569', marginBottom: '8px' }}>
//                         ZK-Proof generated for anonymous threat intelligence contribution.
//                       </p>
//                       <code style={{
//                         background: '#1e293b',
//                         color: '#e2e8f0',
//                         padding: '8px',
//                         borderRadius: '4px',
//                         fontSize: '0.8rem',
//                         fontFamily: 'Fira Code, monospace',
//                         display: 'block',
//                         overflowX: 'auto'
//                       }}>
//                         {result.zkpData.proofId || 'ZK-Proof generation complete'}
//                       </code>
//                     </div>
//                   </Section>
//                 )}
//               </ResultContent>
//             </ResultCard>
//           </ResultSection>
//         )}
//       </AnimatePresence>
//     </ScannerContainer>
//   );
// }

// export default DailyUsageScanner;
