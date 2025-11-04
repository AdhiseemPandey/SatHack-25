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
  font-family: 'Inter', sans-serif;
  min-height: 200px;
  resize: vertical;
  transition: all 0.3s ease;
  background: white;
  line-height: 1.6;

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
  background: ${props => props.isSpam ? '#fee2e2' : '#ecfdf5'};
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
`;

const ResultTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const SpamStatus = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: ${props => props.isSpam ? '#dc2626' : '#059669'};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ConfidenceScore = styled.div`
  background: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ResultDescription = styled.p`
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

const RiskItem = styled(ListItem)`
  color: #dc2626;
  font-weight: 500;
`;

const FeatureItem = styled(ListItem)`
  color: #059669;
`;

const AnalysisSection = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
`;

const AnalysisTitle = styled.h5`
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const AnalysisGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 12px;
`;

const AnalysisItem = styled.div`
  background: white;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const AnalysisLabel = styled.div`
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 4px;
`;

const AnalysisValue = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
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

const Loader = styled(motion.div)`
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
`;

function EmailScanner() {
  const [emailContent, setEmailContent] = useState('');
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
Acme Corporation`
  };

  const loadExample = (type) => {
    setEmailContent(sampleEmails[type]);
    setError(null);
    setResult(null);
    
    // Focus the textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const validateEmailContent = (content) => {
    if (!content.trim()) {
      throw new Error('Email content is required');
    }

    if (content.length < 10) {
      throw new Error('Email content seems too short. Please provide more context.');
    }

    if (content.length > 10000) {
      throw new Error('Email content is too long. Please limit to 10,000 characters.');
    }

    return content;
  };

  // Simple AI-based email analysis (mocked - would call backend in production)
  const analyzeEmailContent = (content) => {
    const spamIndicators = [
      { pattern: /urgent|immediately|asap/gi, weight: 3 },
      { pattern: /free|winner|prize|million|dollar/gi, weight: 2 },
      { pattern: /click here|click below|link below/gi, weight: 3 },
      { pattern: /verify your account|password reset|account suspended/gi, weight: 4 },
      { pattern: /limited time|expires soon|act now/gi, weight: 2 },
      { pattern: /congratulations|you won|you've been selected/gi, weight: 2 },
      { pattern: /http:\/\/|https:\/\//gi, weight: 1 },
      { pattern: /dear user|dear customer/gi, weight: 1 },
      { pattern: /bank|paypal|amazon|microsoft/gi, weight: 1 },
      { pattern: /\$\d+|\d+\s*(dollars|usd)/gi, weight: 2 }
    ];

    const contentLower = content.toLowerCase();
    let spamScore = 0;
    let maxPossibleScore = 0;
    const detectedPatterns = [];

    spamIndicators.forEach(indicator => {
      const matches = contentLower.match(indicator.pattern);
      if (matches) {
        const patternScore = matches.length * indicator.weight;
        spamScore += patternScore;
        maxPossibleScore += indicator.weight * 5; // Assume max 5 occurrences per pattern
        
        detectedPatterns.push({
          pattern: indicator.pattern.toString(),
          occurrences: matches.length,
          score: patternScore,
          examples: matches.slice(0, 3)
        });
      }
    });

    // Text statistics
    const wordCount = content.split(/\s+/).length;
    const sentenceCount = content.split(/[.!?]+/).length;
    const avgSentenceLength = wordCount / Math.max(sentenceCount, 1);
    
    // URL detection
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = content.match(urlRegex) || [];
    
    // Email address detection
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = content.match(emailRegex) || [];

    // Capital letter ratio (common in spam)
    const capsRatio = (content.replace(/[^A-Z]/g, '').length / Math.max(content.length, 1)) * 100;

    // Adjust score based on text statistics
    if (avgSentenceLength < 8) spamScore += 2; // Very short sentences
    if (urls.length > 2) spamScore += urls.length * 2;
    if (emails.length > 3) spamScore += 2;
    if (capsRatio > 30) spamScore += 3;

    // Normalize score to 0-100
    const normalizedScore = Math.min(100, (spamScore / Math.max(maxPossibleScore, 20)) * 100);

    return {
      isSpam: normalizedScore > 60,
      confidence: Math.round(normalizedScore),
      riskFactors: detectedPatterns.slice(0, 5).map(p => 
        `Found "${p.pattern.split('/')[1]}" (${p.occurrences}x)`
      ),
      statistics: {
        wordCount,
        sentenceCount,
        urlCount: urls.length,
        emailCount: emails.length,
        capsRatio: Math.round(capsRatio)
      },
      detectedUrls: urls.slice(0, 3),
      analysis: detectedPatterns
    };
  };

  const scanEmail = async () => {
    if (!emailContent.trim()) return;

    setScanning(true);
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      // Validate input
      validateEmailContent(emailContent);

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

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Analyze email content
      const analysis = analyzeEmailContent(emailContent);

      clearInterval(progressInterval);
      setProgress(100);

      // Small delay to show completion
      setTimeout(() => {
        setResult(analysis);
        setScanning(false);
        setProgress(0);
      }, 500);

    } catch (error) {
      setScanning(false);
      setProgress(0);
      setError(error.message);
      console.error('Email scan error:', error);
    }
  };

  const getSpamDescription = (isSpam, confidence) => {
    if (isSpam) {
      if (confidence > 85) {
        return 'This email shows clear signs of being spam or phishing. Do not interact with any links or provide personal information.';
      } else {
        return 'This email is likely spam. Exercise caution and verify the sender before taking any action.';
      }
    } else {
      if (confidence > 80) {
        return 'This email appears to be legitimate. Always verify unexpected requests directly with the sender.';
      } else {
        return 'This email shows no obvious spam indicators. Use normal caution when handling emails.';
      }
    }
  };

  const canScan = emailContent.trim() && !scanning;

  return (
    <ScannerContainer>
      <ScannerHeader>
        <Title>
          <span>📧</span>
          Email Spam Detection
        </Title>
        <Description>
          AI-powered spam and phishing detection for emails. 
          Advanced pattern recognition identifies suspicious content and potential threats.
        </Description>
      </ScannerHeader>

      <InputSection>
        <InputGroup>
          <Label htmlFor="email-content">
            Email Content
          </Label>
          <TextArea
            ref={textareaRef}
            id="email-content"
            placeholder="Paste the email content you want to analyze for spam or phishing attempts..."
            value={emailContent}
            onChange={(e) => {
              setEmailContent(e.target.value);
              setError(null);
            }}
            disabled={scanning}
            error={!!error}
            spellCheck={true}
          />
        </InputGroup>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <QuickExampleButton
            onClick={() => loadExample('spam')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={scanning}
          >
            Load Spam Example
          </QuickExampleButton>
          <QuickExampleButton
            onClick={() => loadExample('phishing')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={scanning}
          >
            Load Phishing Example
          </QuickExampleButton>
          <QuickExampleButton
            onClick={() => loadExample('legitimate')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={scanning}
          >
            Load Legitimate Example
          </QuickExampleButton>
        </div>

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
                <span>🔍</span>
                Analyze Email
              </>
            )}
          </ButtonContent>
        </ScanButton>
      </InputSection>

      <AnimatePresence>
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
              <ResultHeader isSpam={result.isSpam}>
                <ResultTitle>
                  <SpamStatus isSpam={result.isSpam}>
                    {result.isSpam ? '🚫 SPAM DETECTED' : '✅ LEGITIMATE EMAIL'}
                  </SpamStatus>
                  <ConfidenceScore>
                    Confidence: {result.confidence}%
                  </ConfidenceScore>
                </ResultTitle>
                <ResultDescription>
                  {getSpamDescription(result.isSpam, result.confidence)}
                </ResultDescription>
              </ResultHeader>

              <ResultContent>
                {result.riskFactors.length > 0 && (
                  <Section>
                    <SectionTitle>
                      <span>⚠️</span>
                      Detected Risk Factors
                    </SectionTitle>
                    <List>
                      {result.riskFactors.map((factor, index) => (
                        <RiskItem key={index} icon="🎯">
                          {factor}
                        </RiskItem>
                      ))}
                    </List>
                  </Section>
                )}

                <Section>
                  <SectionTitle>
                    <span>📊</span>
                    Email Analysis
                  </SectionTitle>
                  <AnalysisGrid>
                    <AnalysisItem>
                      <AnalysisLabel>Word Count</AnalysisLabel>
                      <AnalysisValue>{result.statistics.wordCount}</AnalysisValue>
                    </AnalysisItem>
                    <AnalysisItem>
                      <AnalysisLabel>Sentence Count</AnalysisLabel>
                      <AnalysisValue>{result.statistics.sentenceCount}</AnalysisValue>
                    </AnalysisItem>
                    <AnalysisItem>
                      <AnalysisLabel>URLs Found</AnalysisLabel>
                      <AnalysisValue>{result.statistics.urlCount}</AnalysisValue>
                    </AnalysisItem>
                    <AnalysisItem>
                      <AnalysisLabel>Email Addresses</AnalysisLabel>
                      <AnalysisValue>{result.statistics.emailCount}</AnalysisValue>
                    </AnalysisItem>
                    <AnalysisItem>
                      <AnalysisLabel>Capitalization Ratio</AnalysisLabel>
                      <AnalysisValue>{result.statistics.capsRatio}%</AnalysisValue>
                    </AnalysisItem>
                    <AnalysisItem>
                      <AnalysisLabel>Spam Score</AnalysisLabel>
                      <AnalysisValue>{result.confidence}/100</AnalysisValue>
                    </AnalysisItem>
                  </AnalysisGrid>
                </Section>

                {result.detectedUrls.length > 0 && (
                  <Section>
                    <SectionTitle>
                      <span>🔗</span>
                      Detected URLs
                    </SectionTitle>
                    <List>
                      {result.detectedUrls.map((url, index) => (
                        <ListItem key={index} icon="🌐">
                          <code style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>
                            {url}
                          </code>
                        </ListItem>
                      ))}
                    </List>
                  </Section>
                )}

                <AnalysisSection>
                  <AnalysisTitle>
                    <span>🤖</span>
                    AI Analysis Notes
                  </AnalysisTitle>
                  <div style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.5' }}>
                    {result.isSpam ? (
                      <p>
                        This email was flagged as potential spam based on pattern matching and content analysis. 
                        Common spam indicators include urgent language, financial incentives, and suspicious links.
                      </p>
                    ) : (
                      <p>
                        This email appears legitimate based on content analysis. No strong spam indicators were detected.
                      </p>
                    )}
                    <p style={{ marginTop: '8px', fontStyle: 'italic' }}>
                      Note: This analysis is based on pattern recognition and should be used as a guide, not a definitive classification.
                    </p>
                  </div>
                </AnalysisSection>
              </ResultContent>
            </ResultCard>
          </ResultSection>
        )}
      </AnimatePresence>
    </ScannerContainer>
  );
}

export default EmailScanner;