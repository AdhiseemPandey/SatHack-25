// const express = require('express');
// const { Web3 } = require('web3');
// const router = express.Router();

// // Initialize Web3 with free providers
// const web3Providers = [
//   'https://eth-mainnet.g.alchemy.com/v2/demo',
//   'https://mainnet.infura.io/v3/84842078b09946638c03157f83405213',
//   'https://rpc.ankr.com/eth'
// ];

// let currentProviderIndex = 0;
// const web3 = new Web3(web3Providers[currentProviderIndex]);

// // Enhanced malicious patterns database
// const MALICIOUS_PATTERNS = {
//   blacklistedAddresses: new Set([
//     '0x8576acc5c05d6ce88f4e49f65b8677898efc8d8a',
//     '0x901bb9583b24d97e995513c6778dc6888ab6870e',
//     '0xa7e5d5a720f06526557c513402f2e6b5fa20b00',
//     '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2'
//   ]),
//   suspiciousMethods: new Set([
//     '0x0e0a1c3d', // malicious approve
//     '0x095ea7b3', // approve
//     '0xa9059cbb', // transfer
//     '0x23b872dd'  // transferFrom
//   ]),
//   knownExploits: new Set([
//     '0x60806040', // contract creation patterns
//     '0x60a06040'  // proxy patterns
//   ])
// };

// // Enhanced Transaction Scanner Class
// class AdvancedTransactionScanner {
//   constructor() {
//     this.threatLevels = {
//       SAFE: 0,
//       LOW: 1,
//       MEDIUM: 2, 
//       HIGH: 3,
//       CRITICAL: 4
//     };
    
//     this.riskFactors = [];
//   }

//   async scanTransaction(transactionData) {
//     this.riskFactors = []; // Reset risk factors
    
//     const analysis = {
//       threatLevel: this.threatLevels.SAFE,
//       riskScore: 0,
//       warnings: [],
//       risks: [],
//       recommendations: [],
//       contractAnalysis: null,
//       gasAnalysis: null,
//       timestamp: new Date().toISOString()
//     };

//     try {
//       // 1. Address Analysis
//       await this.analyzeAddress(transactionData, analysis);
      
//       // 2. Value Analysis
//       this.analyzeValue(transactionData, analysis);
      
//       // 3. Data Analysis
//       await this.analyzeTransactionData(transactionData, analysis);
      
//       // 4. Gas Analysis
//       this.analyzeGas(transactionData, analysis);
      
//       // 5. Behavioral Analysis
//       this.analyzeBehavior(transactionData, analysis);

//       // Calculate final risk score
//       analysis.riskScore = this.calculateRiskScore(analysis);
//       analysis.threatLevel = this.determineThreatLevel(analysis.riskScore);

//       // Generate recommendations
//       analysis.recommendations = this.generateRecommendations(analysis);

//     } catch (error) {
//       console.error('Scan error:', error);
//       analysis.warnings.push('Scan incomplete due to technical issues');
//     }

//     return analysis;
//   }

//   async analyzeAddress(transactionData, analysis) {
//     const toAddress = transactionData.to?.toLowerCase();
//     const fromAddress = transactionData.from?.toLowerCase();

//     // Check blacklisted addresses
//     if (toAddress && MALICIOUS_PATTERNS.blacklistedAddresses.has(toAddress)) {
//       analysis.risks.push('BLACKLISTED_RECIPIENT');
//       analysis.warnings.push('Recipient address is on global blacklist');
//       analysis.riskScore += 40;
//     }

//     // Check if contract address
//     if (toAddress) {
//       try {
//         const code = await web3.eth.getCode(toAddress);
//         if (code !== '0x') {
//           analysis.contractAnalysis = {
//             isContract: true,
//             codeSize: code.length
//           };
//           // Contracts carry higher risk
//           analysis.riskScore += 10;
//         }
//       } catch (error) {
//         console.error('Error checking contract code:', error);
//       }
//     }
//   }

//   analyzeValue(transactionData, analysis) {
//     const value = transactionData.value ? 
//       parseFloat(web3.utils.fromWei(transactionData.value, 'ether')) : 0;

//     analysis.valueAnalysis = {
//       valueInEth: value,
//       isHighValue: value > 1,
//       isVeryHighValue: value > 10
//     };

//     if (value > 1) {
//       analysis.risks.push('HIGH_VALUE_TRANSACTION');
//       analysis.warnings.push(`High value transaction: ${value.toFixed(4)} ETH`);
//       analysis.riskScore += value > 10 ? 25 : 15;
//     }
//   }

//   async analyzeTransactionData(transactionData, analysis) {
//     const data = transactionData.data || '0x';
    
//     if (data && data !== '0x') {
//       const methodId = data.slice(0, 10).toLowerCase();
      
//       analysis.dataAnalysis = {
//         hasData: true,
//         methodId: methodId,
//         dataLength: data.length
//       };

//       // Check suspicious methods
//       if (MALICIOUS_PATTERNS.suspiciousMethods.has(methodId)) {
//         analysis.risks.push('SUSPICIOUS_METHOD');
//         analysis.warnings.push(`Suspicious contract method called: ${methodId}`);
//         analysis.riskScore += 20;
//       }

//       // Check for known exploit patterns
//       if (MALICIOUS_PATTERNS.knownExploits.has(methodId)) {
//         analysis.risks.push('KNOWN_EXPLOIT_PATTERN');
//         analysis.warnings.push('Transaction matches known exploit pattern');
//         analysis.riskScore += 35;
//       }
//     }
//   }

//   analyzeGas(transactionData, analysis) {
//     const gasPrice = transactionData.gasPrice ? 
//       parseInt(transactionData.gasPrice) : 0;
//     const gasLimit = transactionData.gas ? 
//       parseInt(transactionData.gas) : 21000;

//     analysis.gasAnalysis = {
//       gasPrice: gasPrice,
//       gasLimit: gasLimit,
//       isHighGasPrice: gasPrice > 200000000000, // 200 Gwei
//       isHighGasLimit: gasLimit > 300000
//     };

//     if (gasPrice > 200000000000) {
//       analysis.risks.push('HIGH_GAS_PRICE');
//       analysis.warnings.push('Unusually high gas price detected');
//       analysis.riskScore += 10;
//     }

//     if (gasLimit > 300000) {
//       analysis.risks.push('HIGH_GAS_LIMIT');
//       analysis.warnings.push('High gas limit suggests complex contract interaction');
//       analysis.riskScore += 15;
//     }
//   }

//   analyzeBehavior(transactionData, analysis) {
//     // Check for common scam patterns
//     const value = transactionData.value ? 
//       parseFloat(web3.utils.fromWei(transactionData.value, 'ether')) : 0;
    
//     // Pattern: High value + contract call + high gas
//     if (value > 0.1 && 
//         analysis.dataAnalysis?.hasData && 
//         analysis.gasAnalysis?.isHighGasPrice) {
//       analysis.risks.push('SUSPICIOUS_BEHAVIOR_PATTERN');
//       analysis.warnings.push('Transaction matches suspicious behavioral pattern');
//       analysis.riskScore += 20;
//     }
//   }

//   calculateRiskScore(analysis) {
//     // Cap the risk score at 100
//     return Math.min(analysis.riskScore, 100);
//   }

//   determineThreatLevel(riskScore) {
//     if (riskScore >= 80) return this.threatLevels.CRITICAL;
//     if (riskScore >= 60) return this.threatLevels.HIGH;
//     if (riskScore >= 40) return this.threatLevels.MEDIUM;
//     if (riskScore >= 20) return this.threatLevels.LOW;
//     return this.threatLevels.SAFE;
//   }

//   generateRecommendations(analysis) {
//     const recommendations = [];
//     const threatLevel = analysis.threatLevel;

//     if (threatLevel >= this.threatLevels.CRITICAL) {
//       recommendations.push('🚨 IMMEDIATELY REJECT THIS TRANSACTION');
//       recommendations.push('🚨 Recipient is potentially malicious');
//       recommendations.push('🚨 Do not proceed under any circumstances');
//     } else if (threatLevel >= this.threatLevels.HIGH) {
//       recommendations.push('⚠️ Highly recommended to reject this transaction');
//       recommendations.push('⚠️ Verify recipient from trusted sources');
//       recommendations.push('⚠️ Consider using a hardware wallet');
//     } else if (threatLevel >= this.threatLevels.MEDIUM) {
//       recommendations.push('🔍 Proceed with extreme caution');
//       recommendations.push('🔍 Double-check all transaction details');
//       recommendations.push('🔍 Verify contract address from official sources');
//     } else if (threatLevel >= this.threatLevels.LOW) {
//       recommendations.push('📝 Review transaction details carefully');
//       recommendations.push('📝 Ensure you trust the recipient');
//     } else {
//       recommendations.push('✅ Transaction appears safe');
//       recommendations.push('✅ Always verify addresses before sending');
//     }

//     return recommendations;
//   }
// }

// const scanner = new AdvancedTransactionScanner();

// // Scan transaction endpoint
// router.post('/transaction', async (req, res) => {
//   try {
//     const { transactionData, userAddress } = req.body;

//     // Input validation
//     if (!transactionData || typeof transactionData !== 'object') {
//       return res.status(400).json({
//         success: false,
//         error: 'Valid transaction data object is required'
//       });
//     }

//     console.log(`Scanning transaction for user: ${userAddress || 'anonymous'}`);

//     const analysis = await scanner.scanTransaction(transactionData);

//     // Generate ZKP-ready data
//     const zkpData = generateZKPData(analysis, userAddress);

//     res.json({
//       success: true,
//       analysis: analysis,
//       zkpData: zkpData,
//       scanId: generateScanId(),
//       timestamp: new Date().toISOString()
//     });

//   } catch (error) {
//     console.error('Transaction scan error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to scan transaction',
//       details: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// });

// // Generate ZKP data (conceptual - real implementation would use Circom/SnarkJS)
// function generateZKPData(analysis, userAddress) {
//   return {
//     proofId: `zkp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
//     publicSignals: {
//       threatDetected: analysis.threatLevel > 2,
//       riskScore: analysis.riskScore,
//       timestamp: Date.now(),
//       userHash: userAddress ? 
//         Buffer.from(userAddress).toString('base64').slice(0, 16) : 'anonymous'
//     },
//     verificationKey: 'mock_verification_key_sovereign_guardian_v1',
//     // In production, this would be a real ZK proof
//     proof: `mock_zk_proof_${Buffer.from(JSON.stringify({
//       threatLevel: analysis.threatLevel,
//       risks: analysis.risks
//     })).toString('base64')}`
//   };
// }

// function generateScanId() {
//   return `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
// }

// // Health check for scanner
// router.get('/status', (req, res) => {
//   res.json({
//     status: 'operational',
//     scanner: 'AdvancedTransactionScanner',
//     version: '2.0.0',
//     lastUpdated: new Date().toISOString(),
//     threatDatabase: {
//       blacklistedAddresses: MALICIOUS_PATTERNS.blacklistedAddresses.size,
//       suspiciousMethods: MALICIOUS_PATTERNS.suspiciousMethods.size,
//       knownExploits: MALICIOUS_PATTERNS.knownExploits.size
//     }
//   });
// });

// module.exports = router;




// without moralis

const express = require('express');
const { Web3 } = require('web3');
const router = express.Router();

// Initialize Web3 with free providers
const web3Providers = [
  'https://eth-mainnet.g.alchemy.com/v2/demo',
  'https://mainnet.infura.io/v3/84842078b09946638c03157f83405213',
  'https://rpc.ankr.com/eth'
];

let currentProviderIndex = 0;
const web3 = new Web3(web3Providers[currentProviderIndex]);

// Enhanced malicious patterns database
const MALICIOUS_PATTERNS = {
  blacklistedAddresses: new Set([
    '0x8576acc5c05d6ce88f4e49f65b8677898efc8d8a',
    '0x901bb9583b24d97e995513c6778dc6888ab6870e',
    '0xa7e5d5a720f06526557c513402f2e6b5fa20b00',
    '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
    '0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a',
    '0x5a4f765476fd8c36357a2e8a5c4a1e4b5a5e5e5e'
  ]),
  suspiciousMethods: new Set([
    '0x0e0a1c3d', // malicious approve
    '0x095ea7b3', // approve
    '0xa9059cbb', // transfer
    '0x23b872dd'  // transferFrom
  ]),
  knownExploits: new Set([
    '0x60806040', // contract creation patterns
    '0x60a06040'  // proxy patterns
  ])
};

// Enhanced Transaction Scanner Class
class AdvancedTransactionScanner {
  constructor() {
    this.threatLevels = {
      SAFE: 0,
      LOW: 1,
      MEDIUM: 2, 
      HIGH: 3,
      CRITICAL: 4
    };
    
    this.riskFactors = [];
  }

  async scanTransaction(transactionData) {
    this.riskFactors = []; // Reset risk factors
    
    const analysis = {
      threatLevel: this.threatLevels.SAFE,
      riskScore: 0,
      warnings: [],
      risks: [],
      recommendations: [],
      contractAnalysis: null,
      gasAnalysis: null,
      timestamp: new Date().toISOString()
    };

    try {
      // 1. Address Analysis
      await this.analyzeAddress(transactionData, analysis);
      
      // 2. Value Analysis
      this.analyzeValue(transactionData, analysis);
      
      // 3. Data Analysis
      await this.analyzeTransactionData(transactionData, analysis);
      
      // 4. Gas Analysis
      this.analyzeGas(transactionData, analysis);
      
      // 5. Behavioral Analysis
      this.analyzeBehavior(transactionData, analysis);

      // Calculate final risk score
      analysis.riskScore = this.calculateRiskScore(analysis);
      analysis.threatLevel = this.determineThreatLevel(analysis.riskScore);

      // Generate recommendations
      analysis.recommendations = this.generateRecommendations(analysis);

    } catch (error) {
      console.error('Scan error:', error);
      analysis.warnings.push('Scan incomplete due to technical issues');
    }

    return analysis;
  }

  async analyzeAddress(transactionData, analysis) {
    const toAddress = transactionData.to?.toLowerCase();
    const fromAddress = transactionData.from?.toLowerCase();

    // Check blacklisted addresses
    if (toAddress && MALICIOUS_PATTERNS.blacklistedAddresses.has(toAddress)) {
      analysis.risks.push('BLACKLISTED_RECIPIENT');
      analysis.warnings.push('Recipient address is on global blacklist');
      analysis.riskScore += 40;
    }

    // Check if contract address
    if (toAddress) {
      try {
        const code = await web3.eth.getCode(toAddress);
        if (code !== '0x') {
          analysis.contractAnalysis = {
            isContract: true,
            codeSize: code.length
          };
          // Contracts carry higher risk
          analysis.riskScore += 10;
        }
      } catch (error) {
        console.error('Error checking contract code:', error);
      }
    }
  }

  analyzeValue(transactionData, analysis) {
    const value = transactionData.value ? 
      parseFloat(web3.utils.fromWei(transactionData.value, 'ether')) : 0;

    analysis.valueAnalysis = {
      valueInEth: value,
      isHighValue: value > 1,
      isVeryHighValue: value > 10
    };

    if (value > 1) {
      analysis.risks.push('HIGH_VALUE_TRANSACTION');
      analysis.warnings.push(`High value transaction: ${value.toFixed(4)} ETH`);
      analysis.riskScore += value > 10 ? 25 : 15;
    }
  }

  async analyzeTransactionData(transactionData, analysis) {
    const data = transactionData.data || '0x';
    
    if (data && data !== '0x') {
      const methodId = data.slice(0, 10).toLowerCase();
      
      analysis.dataAnalysis = {
        hasData: true,
        methodId: methodId,
        dataLength: data.length
      };

      // Check suspicious methods
      if (MALICIOUS_PATTERNS.suspiciousMethods.has(methodId)) {
        analysis.risks.push('SUSPICIOUS_METHOD');
        analysis.warnings.push(`Suspicious contract method called: ${methodId}`);
        analysis.riskScore += 20;
      }

      // Check for known exploit patterns
      if (MALICIOUS_PATTERNS.knownExploits.has(methodId)) {
        analysis.risks.push('KNOWN_EXPLOIT_PATTERN');
        analysis.warnings.push('Transaction matches known exploit pattern');
        analysis.riskScore += 35;
      }
    }
  }

  analyzeGas(transactionData, analysis) {
    const gasPrice = transactionData.gasPrice ? 
      parseInt(transactionData.gasPrice) : 0;
    const gasLimit = transactionData.gas ? 
      parseInt(transactionData.gas) : 21000;

    analysis.gasAnalysis = {
      gasPrice: gasPrice,
      gasLimit: gasLimit,
      isHighGasPrice: gasPrice > 200000000000, // 200 Gwei
      isHighGasLimit: gasLimit > 300000
    };

    if (gasPrice > 200000000000) {
      analysis.risks.push('HIGH_GAS_PRICE');
      analysis.warnings.push('Unusually high gas price detected');
      analysis.riskScore += 10;
    }

    if (gasLimit > 300000) {
      analysis.risks.push('HIGH_GAS_LIMIT');
      analysis.warnings.push('High gas limit suggests complex contract interaction');
      analysis.riskScore += 15;
    }
  }

  analyzeBehavior(transactionData, analysis) {
    // Check for common scam patterns
    const value = transactionData.value ? 
      parseFloat(web3.utils.fromWei(transactionData.value, 'ether')) : 0;
    
    // Pattern: High value + contract call + high gas
    if (value > 0.1 && 
        analysis.dataAnalysis?.hasData && 
        analysis.gasAnalysis?.isHighGasPrice) {
      analysis.risks.push('SUSPICIOUS_BEHAVIOR_PATTERN');
      analysis.warnings.push('Transaction matches suspicious behavioral pattern');
      analysis.riskScore += 20;
    }
  }

  calculateRiskScore(analysis) {
    // Cap the risk score at 100
    return Math.min(analysis.riskScore, 100);
  }

  determineThreatLevel(riskScore) {
    if (riskScore >= 80) return this.threatLevels.CRITICAL;
    if (riskScore >= 60) return this.threatLevels.HIGH;
    if (riskScore >= 40) return this.threatLevels.MEDIUM;
    if (riskScore >= 20) return this.threatLevels.LOW;
    return this.threatLevels.SAFE;
  }

  generateRecommendations(analysis) {
    const recommendations = [];
    const threatLevel = analysis.threatLevel;

    if (threatLevel >= this.threatLevels.CRITICAL) {
      recommendations.push('🚨 IMMEDIATELY REJECT THIS TRANSACTION');
      recommendations.push('🚨 Recipient is potentially malicious');
      recommendations.push('🚨 Do not proceed under any circumstances');
    } else if (threatLevel >= this.threatLevels.HIGH) {
      recommendations.push('⚠️ Highly recommended to reject this transaction');
      recommendations.push('⚠️ Verify recipient from trusted sources');
      recommendations.push('⚠️ Consider using a hardware wallet');
    } else if (threatLevel >= this.threatLevels.MEDIUM) {
      recommendations.push('🔍 Proceed with extreme caution');
      recommendations.push('🔍 Double-check all transaction details');
      recommendations.push('🔍 Verify contract address from official sources');
    } else if (threatLevel >= this.threatLevels.LOW) {
      recommendations.push('📝 Review transaction details carefully');
      recommendations.push('📝 Ensure you trust the recipient');
    } else {
      recommendations.push('✅ Transaction appears safe');
      recommendations.push('✅ Always verify addresses before sending');
    }

    return recommendations;
  }
}

const scanner = new AdvancedTransactionScanner();

// Scan transaction endpoint
router.post('/transaction', async (req, res) => {
  try {
    const { transactionData, userAddress } = req.body;

    // Input validation
    if (!transactionData || typeof transactionData !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Valid transaction data object is required'
      });
    }

    console.log(`Scanning transaction for user: ${userAddress || 'anonymous'}`);

    const analysis = await scanner.scanTransaction(transactionData);

    // Generate ZKP-ready data
    const zkpData = generateZKPData(analysis, userAddress);

    res.json({
      success: true,
      analysis: analysis,
      zkpData: zkpData,
      scanId: generateScanId(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Transaction scan error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to scan transaction',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Generate ZKP data (conceptual - real implementation would use Circom/SnarkJS)
function generateZKPData(analysis, userAddress) {
  return {
    proofId: `zkp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    publicSignals: {
      threatDetected: analysis.threatLevel > 2,
      riskScore: analysis.riskScore,
      timestamp: Date.now(),
      userHash: userAddress ? 
        Buffer.from(userAddress).toString('base64').slice(0, 16) : 'anonymous'
    },
    verificationKey: 'mock_verification_key_sovereign_guardian_v1',
    // In production, this would be a real ZK proof
    proof: `mock_zk_proof_${Buffer.from(JSON.stringify({
      threatLevel: analysis.threatLevel,
      risks: analysis.risks
    })).toString('base64')}`
  };
}

function generateScanId() {
  return `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Health check for scanner
router.get('/status', (req, res) => {
  res.json({
    status: 'operational',
    scanner: 'AdvancedTransactionScanner',
    version: '2.0.0',
    lastUpdated: new Date().toISOString(),
    threatDatabase: {
      blacklistedAddresses: MALICIOUS_PATTERNS.blacklistedAddresses.size,
      suspiciousMethods: MALICIOUS_PATTERNS.suspiciousMethods.size,
      knownExploits: MALICIOUS_PATTERNS.knownExploits.size
    },
    web3Provider: web3Providers[currentProviderIndex]
  });
});

// Test endpoint with sample transaction
router.get('/test-scan', async (req, res) => {
  try {
    const sampleTransaction = {
      to: '0x8576acc5c05d6ce88f4e49f65b8677898efc8d8a',
      value: '0xde0b6b3a7640000', // 1 ETH
      data: '0xa9059cbb0000000000000000000000000000000000000000000000000000000000000000',
      gasPrice: '0x4a817c800',
      gas: '0x186a0'
    };

    const analysis = await scanner.scanTransaction(sampleTransaction);
    
    res.json({
      success: true,
      message: 'Test scan completed',
      sampleTransaction,
      analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Test scan failed',
      details: error.message
    });
  }
});

module.exports = router;
