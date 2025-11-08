const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const router = express.Router();

// Daily Usage Scanner Class
class DailyUsageScanner {
  constructor() {
    this.riskLevels = {
      LOW: 0,
      MEDIUM: 1,
      HIGH: 2
    };
  }

  async scanActivitiesWithAI(activityData, activityType = 'general') {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [
        path.join(__dirname, '../../../ai-models/daily_usage_scanner/predict.py'),
        JSON.stringify({ 
          activity_data: activityData,
          activity_type: activityType
        })
      ]);

      let result = '';
      let error = '';

      pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const analysis = JSON.parse(result);
            resolve(analysis);
          } catch (e) {
            reject(new Error('Failed to parse AI model response'));
          }
        } else {
          reject(new Error(`AI model failed: ${error}`));
        }
      });
    });
  }

  async scanActivities(activityData, activityType = 'general') {
    const analysis = {
      riskLevel: this.riskLevels.LOW,
      riskScore: 0,
      activityType: activityType,
      analysis: {
        threatsDetected: 0,
        privacyConcerns: 0,
        behaviorPatterns: [],
        recommendations: []
      },
      warnings: [],
      statistics: {
        totalActivities: 0,
        riskFlags: 0,
        privacyScore: 100,
        timeSpent: '0 hours'
      },
      aiAnalysis: null,
      timestamp: new Date().toISOString()
    };

    try {
      // Try AI model first
      try {
        analysis.aiAnalysis = await this.scanActivitiesWithAI(activityData, activityType);
        analysis.riskScore = analysis.aiAnalysis.risk_score || 0;
        analysis.riskLevel = this.determineRiskLevel(analysis.riskScore);
        
        if (analysis.aiAnalysis.warnings) {
          analysis.warnings.push(...analysis.aiAnalysis.warnings);
        }
        
        if (analysis.aiAnalysis.analysis) {
          analysis.analysis = { ...analysis.analysis, ...analysis.aiAnalysis.analysis };
        }
        
        if (analysis.aiAnalysis.statistics) {
          analysis.statistics = { ...analysis.statistics, ...analysis.aiAnalysis.statistics };
        }
      } catch (aiError) {
        console.warn('AI model scan failed, using rule-based analysis:', aiError.message);
        // Fallback to rule-based analysis
        this.ruleBasedAnalysis(activityData, activityType, analysis);
      }

      // Generate recommendations if not provided by AI
      if (!analysis.analysis.recommendations || analysis.analysis.recommendations.length === 0) {
        analysis.analysis.recommendations = this.generateRecommendations(analysis);
      }

    } catch (error) {
      console.error('Activity scan error:', error);
      analysis.warnings.push('Analysis incomplete due to technical issues');
    }

    return analysis;
  }

  ruleBasedAnalysis(activityData, activityType, analysis) {
    const text = activityData.toLowerCase();
    
    // Threat detection patterns
    const threatPatterns = [
      { pattern: /phishing|scam|fraud/gi, weight: 3 },
      { pattern: /password|login|credentials/gi, weight: 2 },
      { pattern: /banking|financial|crypto/gi, weight: 2 },
      { pattern: /suspicious|malicious|dangerous/gi, weight: 3 },
      { pattern: /unsecured|vulnerable|weak/gi, weight: 2 }
    ];

    // Privacy concern patterns
    const privacyPatterns = [
      { pattern: /personal information|private data/gi, weight: 3 },
      { pattern: /social security|ssn|id number/gi, weight: 4 },
      { pattern: /credit card|debit card/gi, weight: 3 },
      { pattern: /address|phone number|email/gi, weight: 2 }
    ];

    let threatScore = 0;
    let privacyScore = 0;

    // Calculate threat score
    threatPatterns.forEach(pattern => {
      const matches = text.match(pattern.pattern);
      if (matches) {
        threatScore += matches.length * pattern.weight;
      }
    });

    // Calculate privacy score
    privacyPatterns.forEach(pattern => {
      const matches = text.match(pattern.pattern);
      if (matches) {
        privacyScore += matches.length * pattern.weight;
      }
    });

    // Calculate overall risk score
    analysis.riskScore = Math.min(100, threatScore + privacyScore);
    analysis.riskLevel = this.determineRiskLevel(analysis.riskScore);
    
    // Generate warnings
    if (threatScore > 10) {
      analysis.warnings.push('Potential security threats detected in activities');
    }
    if (privacyScore > 10) {
      analysis.warnings.push('Privacy concerns identified in shared information');
    }

    // Generate statistics
    const lines = activityData.split('\n').filter(line => line.trim());
    analysis.statistics.totalActivities = lines.length;
    analysis.statistics.riskFlags = Math.floor(threatScore / 5) + Math.floor(privacyScore / 5);
    analysis.statistics.privacyScore = Math.max(0, 100 - analysis.riskScore);

    // Extract time spent
    const timeMatch = activityData.match(/(\d+(\.\d+)?)\s*hours?/i);
    if (timeMatch) {
      analysis.statistics.timeSpent = timeMatch[0];
    }

    analysis.analysis.threatsDetected = Math.floor(threatScore / 10);
    analysis.analysis.privacyConcerns = Math.floor(privacyScore / 10);
    analysis.analysis.behaviorPatterns = this.detectBehaviorPatterns(activityData);
  }

  detectBehaviorPatterns(activityData) {
    const patterns = [];
    const text = activityData.toLowerCase();

    if (text.includes('night') || text.includes('midnight') || text.includes('3am') || text.includes('4am')) {
      patterns.push('Unusual nighttime activity');
    }

    if ((text.match(/http|https/g) || []).length > 5) {
      patterns.push('High number of website visits');
    }

    if (text.includes('failed') && text.includes('login')) {
      patterns.push('Failed login attempts detected');
    }

    if (text.includes('unknown') || text.includes('unrecognized')) {
      patterns.push('Unrecognized activity patterns');
    }

    return patterns.length > 0 ? patterns : ['Normal activity patterns'];
  }

  determineRiskLevel(riskScore) {
    if (riskScore >= 70) return this.riskLevels.HIGH;
    if (riskScore >= 40) return this.riskLevels.MEDIUM;
    return this.riskLevels.LOW;
  }

  generateRecommendations(analysis) {
    const recommendations = [];

    if (analysis.riskLevel === this.riskLevels.HIGH) {
      recommendations.push('Immediately review and secure your accounts');
      recommendations.push('Enable two-factor authentication on all platforms');
      recommendations.push('Avoid accessing sensitive information on public networks');
      recommendations.push('Run a full security scan on your devices');
    }

    if (analysis.riskLevel >= this.riskLevels.MEDIUM) {
      recommendations.push('Use a password manager for better security');
      recommendations.push('Regularly update your security software');
      recommendations.push('Be cautious of unsolicited messages and links');
      recommendations.push('Review connected applications and services');
    }

    recommendations.push('Monitor your accounts for unusual activity');
    recommendations.push('Use VPN for enhanced privacy protection');
    recommendations.push('Regularly review privacy settings on social platforms');
    recommendations.push('Keep your operating system and apps updated');

    return recommendations;
  }
}

const scanner = new DailyUsageScanner();

// Scan daily activities endpoint
router.post('/scan', async (req, res) => {
  try {
    const { activityData, activityType } = req.body;

    if (!activityData || typeof activityData !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Valid activity data string is required'
      });
    }

    console.log(`Scanning daily activities for type: ${activityType || 'general'}`);

    const analysis = await scanner.scanActivities(activityData, activityType || 'general');

    // Generate ZKP-ready data
    const zkpData = generateZKPData(analysis);

    res.json({
      success: true,
      riskLevel: analysis.riskLevel,
      riskScore: analysis.riskScore,
      activityType: analysis.activityType,
      analysis: analysis.analysis,
      warnings: analysis.warnings,
      statistics: analysis.statistics,
      aiAnalysis: analysis.aiAnalysis,
      zkpData: zkpData,
      scanId: generateScanId(),
      timestamp: analysis.timestamp
    });

  } catch (error) {
    console.error('Daily usage scan error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to scan daily activities',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Batch scan multiple activities
router.post('/batch-scan', async (req, res) => {
  try {
    const { activities } = req.body;

    if (!Array.isArray(activities) || activities.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Activities array is required'
      });
    }

    console.log(`Batch scanning ${activities.length} activities`);

    const results = [];
    for (const activity of activities) {
      try {
        const analysis = await scanner.scanActivities(
          activity.data, 
          activity.type || 'general'
        );
        results.push({
          activityId: activity.id,
          success: true,
          analysis: analysis
        });
      } catch (error) {
        results.push({
          activityId: activity.id,
          success: false,
          error: error.message
        });
      }
    }

    // Generate overall risk assessment
    const overallRiskScore = results
      .filter(r => r.success)
      .reduce((sum, r) => sum + r.analysis.riskScore, 0) / 
      Math.max(results.filter(r => r.success).length, 1);

    res.json({
      success: true,
      results: results,
      overallRiskScore: Math.round(overallRiskScore),
      totalScanned: results.length,
      successfulScans: results.filter(r => r.success).length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Batch scan error:', error);
    res.status(500).json({
      success: false,
      error: 'Batch scan failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Generate ZKP data
function generateZKPData(analysis) {
  return {
    proofId: `zkp_daily_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    publicSignals: {
      riskDetected: analysis.riskLevel > 0,
      riskScore: analysis.riskScore,
      activityType: analysis.activityType,
      timestamp: Date.now()
    },
    verificationKey: 'mock_verification_key_daily_usage_v1',
    proof: `mock_zk_proof_${Buffer.from(JSON.stringify({
      riskLevel: analysis.riskLevel,
      threats: analysis.analysis.threatsDetected
    })).toString('base64')}`
  };
}

function generateScanId() {
  return `daily_scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Health check for daily usage scanner
router.get('/status', (req, res) => {
  res.json({
    status: 'operational',
    scanner: 'DailyUsageScanner',
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    features: ['ai-integration', 'batch-scan', 'behavior-patterns', 'privacy-analysis']
  });
});

module.exports = router;