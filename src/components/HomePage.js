import React from "react";
import { useNavigate } from "react-router-dom";
import styled, {
  createGlobalStyle,
  ThemeProvider,
  keyframes,
} from "styled-components";
import { motion } from "framer-motion";

// Global styles with elegant dark theme
const GlobalStyles = createGlobalStyle`
  * {
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
  }
  
  body {
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
    margin: 0;
    padding: 0;
    min-height: 100vh;
  }
`;

const elegantTheme = {
  background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
  cardBackground: "rgba(30, 41, 59, 0.8)",
  text: "#f1f5f9",
  textSecondary: "#94a3b8",
  border: "rgba(255, 255, 255, 0.1)",
  accent: "#818cf8",
  accentGradient: "linear-gradient(135deg, #818cf8 0%, #c084fc 100%)",
  glass: "rgba(255, 255, 255, 0.05)",
  glassBorder: "rgba(255, 255, 255, 0.1)",
  success: "#34d399",
  danger: "#f87171",
};

// 🌑 Background glow animation
const pulse = keyframes`
  0%, 100% { opacity: 0.1; transform: scale(1); }
  50% { opacity: 0.2; transform: scale(1.05); }
`;

const HomeContainer = styled.div`
  min-height: 100vh;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.theme.background};
  color: ${(props) => props.theme.text};
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

// 🌌 Subtle animated background gradient
const BackgroundGlow = styled.div`
  position: absolute;
  top: -10%;
  left: -10%;
  width: 120%;
  height: 120%;
  background: radial-gradient(
    circle at 30% 30%,
    rgba(129, 140, 248, 0.15),
    transparent 60%
  );
  animation: ${pulse} 8s infinite;
  pointer-events: none;
`;

const FloatingBackground = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
  opacity: 0.1;

  &::before {
    content: "";
    position: absolute;
    top: 20%;
    left: 10%;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: ${(props) => props.theme.accent};
    filter: blur(60px);
  }

  &::after {
    content: "";
    position: absolute;
    bottom: 20%;
    right: 10%;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: #c084fc;
    filter: blur(60px);
  }
`;

const Header = styled(motion.header)`
  text-align: center;
  padding: 40px 20px 60px;
  max-width: 800px;
  z-index: 2;
`;

const Title = styled.h1`
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  margin-bottom: 20px;
  background: ${(props) => props.theme.accentGradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 20px rgba(129, 140, 248, 0.3);
`;

const Subtitle = styled.p`
  font-size: clamp(1rem, 2.5vw, 1.3rem);
  opacity: 0.9;
  font-weight: 400;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.7;
  color: ${(props) => props.theme.textSecondary};
`;

const ScannerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
  max-width: 1100px;
  width: 100%;
  padding: 0 20px;
  z-index: 2;
  margin-bottom: 40px;
`;

const ScannerCard = styled(motion.div)`
  background: ${(props) => props.theme.glass};
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px 32px;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
  border: 1px solid ${(props) => props.theme.glassBorder};
  text-align: center;
  cursor: pointer;
  transition: all 0.4s ease;
  min-height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transition: 0.5s;
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 25px 60px rgba(129, 140, 248, 0.3);
    border-color: ${(props) => props.theme.accent};

    &::before {
      left: 100%;
    }
  }
`;

const ScannerIcon = styled(motion.div)`
  font-size: 3.5rem;
  margin-bottom: 24px;
  filter: drop-shadow(0 0 12px rgba(129, 140, 248, 0.4));
`;

const ScannerTitle = styled.h2`
  font-size: 1.6rem;
  font-weight: 700;
  color: ${(props) => props.theme.text};
  margin-bottom: 16px;
  background: ${(props) => props.theme.accentGradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const ScannerDescription = styled.p`
  color: ${(props) => props.theme.textSecondary};
  font-size: 1.05rem;
  line-height: 1.6;
  margin-bottom: 24px;
`;

const ScannerFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
  width: 100%;
`;

const FeatureItem = styled(motion.li)`
  padding: 10px 0;
  color: ${(props) => props.theme.text};
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  border-bottom: 1px solid ${(props) => props.theme.glassBorder};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    color: ${(props) => props.theme.accent};
    transform: translateX(8px);
  }

  &::before {
    content: "✓";
    color: ${(props) => props.theme.accent};
    font-weight: bold;
    font-size: 1.1rem;
  }
`;

const StatusBadge = styled(motion.div)`
  background: ${(props) =>
    props.status === "connected" ? props.theme.success : props.theme.danger};
  color: #0f172a;
  padding: 12px 24px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 700;
  z-index: 2;
  box-shadow: 0 8px 25px
    ${(props) =>
      props.status === "connected"
        ? "rgba(52, 211, 153, 0.4)"
        : "rgba(248, 113, 113, 0.4)"};
  backdrop-filter: blur(20px);
  border: 1px solid
    ${(props) =>
      props.status === "connected"
        ? "rgba(52, 211, 153, 0.3)"
        : "rgba(248, 113, 113, 0.3)"};
`;

function HomePage({ backendStatus }) {
  const navigate = useNavigate();

  const scanners = [
    {
      id: "email",
      icon: "📧",
      title: "Email Security Scanner",
      description:
        "AI-powered spam and phishing detection for emails with advanced pattern recognition.",
      features: [
        "Real-time spam detection",
        "Phishing attempt identification",
        "Attachment analysis",
        "Sender reputation check",
      ],
      path: "/email-scanner",
    },
    {
      id: "transaction",
      icon: "🔗",
      title: "Transaction Security Scanner",
      description:
        "Blockchain transaction analysis with automatic wallet connection and threat detection.",
      features: [
        "Automatic wallet connection",
        "Smart contract analysis",
        "Real-time threat detection",
        "Zero-knowledge proofs",
      ],
      path: "/transaction-scanner",
    },
    {
      id: "daily-usage",
      icon: "📊",
      title: "Daily Usage Scanner",
      description:
        "Comprehensive daily activity monitoring and security threat analysis.",
      features: [
        "Activity pattern analysis",
        "Behavioral threat detection",
        "Privacy risk assessment",
        "Real-time monitoring",
      ],
      path: "/daily-usage-scanner",
    },
  ];

  const handleScannerClick = (path) => {
    navigate(path);
  };

  return (
    <ThemeProvider theme={elegantTheme}>
      <GlobalStyles />
      <HomeContainer>
        <FloatingBackground
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 2 }}
        />
        <BackgroundGlow />

        <Header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Title>
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 3 }}
            >
              🛡️
            </motion.span>
            Sovereign Identity Guardian
          </Title>
          <Subtitle>
            Advanced AI Security Platform • Zero-Knowledge Proofs • Real-time
            Threat Detection
          </Subtitle>
        </Header>

        <ScannerGrid>
          {scanners.map((scanner, index) => (
            <ScannerCard
              key={scanner.id}
              onClick={() => handleScannerClick(scanner.path)}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <ScannerIcon
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{
                  repeat: Infinity,
                  repeatDelay: 5,
                  duration: 3,
                }}
              >
                {scanner.icon}
              </ScannerIcon>
              <ScannerTitle>{scanner.title}</ScannerTitle>
              <ScannerDescription>{scanner.description}</ScannerDescription>
              <ScannerFeatures>
                {scanner.features.map((feature, idx) => (
                  <FeatureItem
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.15 + idx * 0.1 }}
                  >
                    {feature}
                  </FeatureItem>
                ))}
              </ScannerFeatures>
            </ScannerCard>
          ))}
        </ScannerGrid>

        <StatusBadge
          status={backendStatus}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
        >
          Backend:{" "}
          {backendStatus === "connected" ? "Connected" : "Disconnected"}
        </StatusBadge>
      </HomeContainer>
    </ThemeProvider>
  );
}

export default HomePage;
// import React from "react";
// import { useNavigate } from "react-router-dom";
// import styled, { keyframes } from "styled-components";
// import { motion } from "framer-motion";

// // 🌑 Background glow animation
// const pulse = keyframes`
//   0%, 100% { opacity: 0.4; transform: scale(1); }
//   50% { opacity: 0.7; transform: scale(1.1); }
// `;

// const HomeContainer = styled.div`
//   min-height: 100vh;
//   padding: 40px 20px;
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
//   background: radial-gradient(circle at top, #0f2027, #203a43, #2c5364);
//   color: #e5e7eb;
//   position: relative;
//   overflow: hidden;
// `;

// // 🌌 Subtle animated background gradient
// const BackgroundGlow = styled.div`
//   position: absolute;
//   top: -10%;
//   left: -10%;
//   width: 120%;
//   height: 120%;
//   background: radial-gradient(
//     circle at 30% 30%,
//     rgba(0, 255, 170, 0.15),
//     transparent 60%
//   );
//   animation: ${pulse} 8s infinite;
//   pointer-events: none;
// `;

// const Header = styled(motion.header)`
//   text-align: center;
//   padding: 40px 20px 60px;
//   max-width: 800px;
//   z-index: 2;
// `;

// const Title = styled.h1`
//   font-size: clamp(2.5rem, 5vw, 4rem);
//   font-weight: 700;
//   margin-bottom: 16px;
//   background: linear-gradient(90deg, #00ffd0, #00b8ff, #a855f7);
//   -webkit-background-clip: text;
//   -webkit-text-fill-color: transparent;
// `;

// const Subtitle = styled.p`
//   font-size: clamp(1rem, 2.5vw, 1.3rem);
//   opacity: 0.9;
//   font-weight: 400;
//   max-width: 600px;
//   margin: 0 auto;
//   line-height: 1.6;
// `;

// const ScannerGrid = styled.div`
//   display: grid;
//   grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
//   gap: 30px;
//   max-width: 1000px;
//   width: 100%;
//   padding: 0 20px;
//   z-index: 2;
// `;

// const ScannerCard = styled(motion.div)`
//   background: rgba(30, 41, 59, 0.8);
//   border-radius: 24px;
//   padding: 40px 30px;
//   box-shadow: 0 0 20px rgba(0, 255, 170, 0.05);
//   backdrop-filter: blur(20px);
//   border: 1px solid rgba(255, 255, 255, 0.05);
//   text-align: center;
//   cursor: pointer;
//   transition: all 0.4s ease;
//   min-height: 280px;
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;

//   &:hover {
//     transform: translateY(-10px);
//     box-shadow: 0 0 25px rgba(0, 255, 170, 0.3);
//     border-color: rgba(0, 255, 170, 0.4);
//   }
// `;

// const ScannerIcon = styled(motion.div)`
//   font-size: 3rem;
//   margin-bottom: 20px;
//   filter: drop-shadow(0 0 8px rgba(0, 255, 170, 0.5));
// `;

// const ScannerTitle = styled.h2`
//   font-size: 1.5rem;
//   font-weight: 700;
//   color: #f9fafb;
//   margin-bottom: 12px;
// `;

// const ScannerDescription = styled.p`
//   color: #9ca3af;
//   font-size: 1rem;
//   line-height: 1.5;
//   margin-bottom: 20px;
// `;

// const ScannerFeatures = styled.ul`
//   list-style: none;
//   padding: 0;
//   margin: 0;
//   text-align: left;
//   width: 100%;
// `;

// const FeatureItem = styled.li`
//   padding: 8px 0;
//   color: #d1d5db;
//   font-size: 0.9rem;
//   display: flex;
//   align-items: center;
//   gap: 8px;

//   &::before {
//     content: "✓";
//     color: #00ffd0;
//     font-weight: bold;
//   }
// `;

// const StatusBadge = styled.div`
//   background: ${(props) =>
//     props.status === "connected" ? "#00ffd0" : "#ef4444"};
//   color: #0f172a;
//   padding: 8px 16px;
//   border-radius: 20px;
//   font-size: 0.85rem;
//   font-weight: 700;
//   margin-top: 30px;
//   z-index: 2;
//   box-shadow: 0 0 10px
//     ${(props) => (props.status === "connected" ? "#00ffd0" : "#ef4444")};
// `;

// function HomePage({ backendStatus }) {
//   const navigate = useNavigate();

//   const scanners = [
//     {
//       id: "email",
//       icon: "📧",
//       title: "Email Security Scanner",
//       description:
//         "AI-powered spam and phishing detection for emails with advanced pattern recognition.",
//       features: [
//         "Real-time spam detection",
//         "Phishing attempt identification",
//         "Attachment analysis",
//         "Sender reputation check",
//       ],
//       path: "/email-scanner",
//     },
//     {
//       id: "transaction",
//       icon: "🔗",
//       title: "Transaction Security Scanner",
//       description:
//         "Blockchain transaction analysis with automatic wallet connection and threat detection.",
//       features: [
//         "Automatic wallet connection",
//         "Smart contract analysis",
//         "Real-time threat detection",
//         "Zero-knowledge proofs",
//       ],
//       path: "/transaction-scanner",
//     },
//     {
//       id: "daily-usage",
//       icon: "📊",
//       title: "Daily Usage Scanner",
//       description:
//         "Comprehensive daily activity monitoring and security threat analysis.",
//       features: [
//         "Activity pattern analysis",
//         "Behavioral threat detection",
//         "Privacy risk assessment",
//         "Real-time monitoring",
//       ],
//       path: "/daily-usage-scanner",
//     },
//   ];

//   const handleScannerClick = (path) => {
//     navigate(path);
//   };

//   return (
//     <HomeContainer>
//       <BackgroundGlow />
//       <Header
//         initial={{ opacity: 0, y: -50 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8, ease: "easeOut" }}
//       >
//         <Title>🛡️ Sovereign Identity Guardian</Title>
//         <Subtitle>
//           Advanced AI Security Platform • Zero-Knowledge Proofs • Real-time
//           Threat Detection
//         </Subtitle>
//       </Header>

//       <ScannerGrid>
//         {scanners.map((scanner, index) => (
//           <ScannerCard
//             key={scanner.id}
//             onClick={() => handleScannerClick(scanner.path)}
//             initial={{ opacity: 0, y: 50 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5, delay: index * 0.1 }}
//             whileHover={{ scale: 1.05, rotate: 1 }}
//             whileTap={{ scale: 0.97 }}
//           >
//             <ScannerIcon
//               animate={{ rotate: [0, 10, -10, 0] }}
//               transition={{
//                 repeat: Infinity,
//                 repeatDelay: 3,
//                 duration: 2,
//               }}
//             >
//               {scanner.icon}
//             </ScannerIcon>
//             <ScannerTitle>{scanner.title}</ScannerTitle>
//             <ScannerDescription>{scanner.description}</ScannerDescription>
//             <ScannerFeatures>
//               {scanner.features.map((feature, idx) => (
//                 <FeatureItem key={idx}>{feature}</FeatureItem>
//               ))}
//             </ScannerFeatures>
//           </ScannerCard>
//         ))}
//       </ScannerGrid>

//       <StatusBadge status={backendStatus}>
//         Backend: {backendStatus === "connected" ? "Connected" : "Disconnected"}
//       </StatusBadge>
//     </HomeContainer>
//   );
// }

// export default HomePage;
