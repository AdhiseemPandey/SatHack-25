import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const HomeContainer = styled.div`
  min-height: 100vh;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Header = styled(motion.header)`
  text-align: center;
  padding: 40px 20px 60px;
  color: white;
  max-width: 800px;
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
`;

const Subtitle = styled.p`
  font-size: clamp(1rem, 2.5vw, 1.3rem);
  opacity: 0.9;
  font-weight: 400;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const ScannerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1000px;
  width: 100%;
  padding: 0 20px;
`;

const ScannerCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 40px 30px;
  box-shadow: var(--shadow-large);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  }
`;

const ScannerIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 20px;
`;

const ScannerTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 12px;
`;

const ScannerDescription = styled.p`
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 20px;
`;

const ScannerFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
  width: 100%;
`;

const FeatureItem = styled.li`
  padding: 8px 0;
  color: #4b5563;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '✓';
    color: var(--success-color);
    font-weight: bold;
  }
`;

const StatusBadge = styled.div`
  background: ${props => props.status === 'connected' ? 'var(--success-color)' : '#ef4444'};
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 20px;
`;

function HomePage({ backendStatus }) {
  const navigate = useNavigate();

  const scanners = [
    {
      id: 'email',
      icon: '📧',
      title: 'Email Security Scanner',
      description: 'AI-powered spam and phishing detection for emails with advanced pattern recognition.',
      features: [
        'Real-time spam detection',
        'Phishing attempt identification',
        'Attachment analysis',
        'Sender reputation check'
      ],
      path: '/email-scanner'
    },
    {
      id: 'transaction',
      icon: '🔗',
      title: 'Transaction Security Scanner',
      description: 'Blockchain transaction analysis with automatic wallet connection and threat detection.',
      features: [
        'Automatic wallet connection',
        'Smart contract analysis',
        'Real-time threat detection',
        'Zero-knowledge proofs'
      ],
      path: '/transaction-scanner'
    },
    {
      id: 'daily-usage',
      icon: '📊',
      title: 'Daily Usage Scanner',
      description: 'Comprehensive daily activity monitoring and security threat analysis.',
      features: [
        'Activity pattern analysis',
        'Behavioral threat detection',
        'Privacy risk assessment',
        'Real-time monitoring'
      ],
      path: '/daily-usage-scanner'
    }
  ];

  const handleScannerClick = (path) => {
    navigate(path);
  };

  return (
    <HomeContainer>
      <Header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Title>🛡️ Sovereign Identity Guardian</Title>
        <Subtitle>
          Advanced AI Security Platform • Zero-Knowledge Proofs • Real-time Threat Detection
        </Subtitle>
      </Header>

      <ScannerGrid>
        {scanners.map((scanner, index) => (
          <ScannerCard
            key={scanner.id}
            onClick={() => handleScannerClick(scanner.path)}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ScannerIcon>{scanner.icon}</ScannerIcon>
            <ScannerTitle>{scanner.title}</ScannerTitle>
            <ScannerDescription>{scanner.description}</ScannerDescription>
            <ScannerFeatures>
              {scanner.features.map((feature, idx) => (
                <FeatureItem key={idx}>{feature}</FeatureItem>
              ))}
            </ScannerFeatures>
          </ScannerCard>
        ))}
      </ScannerGrid>

      <StatusBadge status={backendStatus}>
        Backend: {backendStatus === 'connected' ? 'Connected' : 'Disconnected'}
      </StatusBadge>
    </HomeContainer>
  );
}

export default HomePage;