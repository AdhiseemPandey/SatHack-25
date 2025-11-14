import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { createGlobalStyle, ThemeProvider } from "styled-components";
import { motion } from "framer-motion";
import TransactionScanner from "./TransactionScanner";
import Web3Integration from "./Web3Integration";

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
};

const PageContainer = styled.div`
  min-height: 100vh;
  padding: 20px;
  background: ${(props) => props.theme.background};
  position: relative;
  overflow-x: hidden;

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

const Header = styled(motion.header)`
  text-align: center;
  padding: 40px 20px 60px;
  color: white;
  max-width: 900px;
  margin: 0 auto;
  position: relative;
`;

const Title = styled.h1`
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  margin-bottom: 20px;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  background: ${(props) => props.theme.accentGradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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

const BackButton = styled(motion.button)`
  position: absolute;
  top: 30px;
  left: 30px;
  background: ${(props) => props.theme.glass};
  backdrop-filter: blur(20px);
  color: ${(props) => props.theme.text};
  border: 1.5px solid ${(props) => props.theme.glassBorder};
  padding: 14px 24px;
  border-radius: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  z-index: 100;

  &:hover {
    background: ${(props) => props.theme.accent};
    border-color: ${(props) => props.theme.accent};
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(129, 140, 248, 0.4);
  }
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 40px;
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

function TransactionScannerPage({ backendStatus }) {
  const navigate = useNavigate();
  const [web3Enabled, setWeb3Enabled] = useState(false);
  const [autoConnected, setAutoConnected] = useState(false);

  // Auto-connect wallet when component mounts
  useEffect(() => {
    const autoConnectWallet = async () => {
      if (window.ethereum && !autoConnected) {
        try {
          console.log("Auto-connecting wallet...");
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });

          if (accounts.length > 0) {
            setWeb3Enabled(true);
            setAutoConnected(true);
            console.log("Wallet auto-connected successfully");
          }
        } catch (error) {
          console.log(
            "Auto-connect failed, user will need to connect manually:",
            error
          );
        }
      }
    };

    autoConnectWallet();
  }, [autoConnected]);

  return (
    <ThemeProvider theme={elegantTheme}>
      <GlobalStyles />
      <PageContainer>
        <FloatingBackground
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 2 }}
        />

        <BackButton
          onClick={() => navigate("/")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.span
            animate={{ x: [-5, 0, -5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ←
          </motion.span>
          Back to Home
        </BackButton>

        <Header
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Title>
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 3 }}
            >
              🔗
            </motion.span>
            Transaction Security Scanner
          </Title>
          <Subtitle>
            Automatic wallet connection • Real-time threat analysis •
            Zero-knowledge proof verification
          </Subtitle>
        </Header>

        <ContentContainer>
          <Web3Integration
            onWeb3Enabled={setWeb3Enabled}
            backendStatus={backendStatus}
            autoConnect={true}
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <TransactionScanner
              web3Enabled={web3Enabled}
              backendStatus={backendStatus}
              autoConnect={true}
            />
          </motion.div>
        </ContentContainer>
      </PageContainer>
    </ThemeProvider>
  );
}

export default TransactionScannerPage;
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import styled from 'styled-components';
// import { motion } from 'framer-motion';
// import TransactionScanner from './TransactionScanner';
// import Web3Integration from './Web3Integration';

// const PageContainer = styled.div`
//   min-height: 100vh;
//   padding: 20px;
// `;

// const Header = styled(motion.header)`
//   text-align: center;
//   padding: 20px 20px 40px;
//   color: white;
//   max-width: 800px;
//   margin: 0 auto;
// `;

// const Title = styled.h1`
//   font-size: clamp(2rem, 4vw, 3rem);
//   font-weight: 700;
//   margin-bottom: 16px;
//   text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   gap: 16px;
// `;

// const Subtitle = styled.p`
//   font-size: clamp(0.9rem, 2vw, 1.1rem);
//   opacity: 0.9;
//   font-weight: 400;
//   max-width: 600px;
//   margin: 0 auto;
//   line-height: 1.6;
// `;

// const BackButton = styled(motion.button)`
//   position: absolute;
//   top: 20px;
//   left: 20px;
//   background: rgba(255, 255, 255, 0.2);
//   color: white;
//   border: none;
//   padding: 12px 20px;
//   border-radius: 12px;
//   font-weight: 600;
//   cursor: pointer;
//   display: flex;
//   align-items: center;
//   gap: 8px;
//   backdrop-filter: blur(10px);
//   border: 1px solid rgba(255, 255, 255, 0.3);

//   &:hover {
//     background: rgba(255, 255, 255, 0.3);
//   }
// `;

// const ContentContainer = styled.div`
//   max-width: 1000px;
//   margin: 0 auto;
//   padding: 0 20px;
// `;

// function TransactionScannerPage({ backendStatus }) {
//   const navigate = useNavigate();
//   const [web3Enabled, setWeb3Enabled] = useState(false);
//   const [autoConnected, setAutoConnected] = useState(false);

//   // Auto-connect wallet when component mounts
//   useEffect(() => {
//     const autoConnectWallet = async () => {
//       if (window.ethereum && !autoConnected) {
//         try {
//           console.log('Auto-connecting wallet...');
//           const accounts = await window.ethereum.request({
//             method: 'eth_requestAccounts'
//           });

//           if (accounts.length > 0) {
//             setWeb3Enabled(true);
//             setAutoConnected(true);
//             console.log('Wallet auto-connected successfully');
//           }
//         } catch (error) {
//           console.log('Auto-connect failed, user will need to connect manually:', error);
//         }
//       }
//     };

//     autoConnectWallet();
//   }, [autoConnected]);

//   return (
//     <PageContainer>
//       <BackButton
//         onClick={() => navigate('/')}
//         whileHover={{ scale: 1.05 }}
//         whileTap={{ scale: 0.95 }}
//       >
//         ← Back to Home
//       </BackButton>

//       <Header
//         initial={{ opacity: 0, y: -30 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//       >
//         <Title>
//           <span>🔗</span>
//           Transaction Security Scanner
//         </Title>
//         <Subtitle>
//           Automatic wallet connection • Real-time threat analysis • Zero-knowledge proof verification
//         </Subtitle>
//       </Header>

//       <ContentContainer>
//         <Web3Integration
//           onWeb3Enabled={setWeb3Enabled}
//           backendStatus={backendStatus}
//           autoConnect={true}
//         />

//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.3, duration: 0.5 }}
//         >
//           <TransactionScanner
//             web3Enabled={web3Enabled}
//             backendStatus={backendStatus}
//             autoConnect={true}
//           />
//         </motion.div>
//       </ContentContainer>
//     </PageContainer>
//   );
// }

// export default TransactionScannerPage;
