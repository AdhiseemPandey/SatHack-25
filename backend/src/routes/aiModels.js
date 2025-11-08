const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const router = express.Router();

// Train AI models endpoint
router.post('/train', (req, res) => {
  const { modelType, useAccumulatedData } = req.body;

  const validModels = ['all', 'email', 'transaction', 'daily_usage'];
  
  if (modelType && !validModels.includes(modelType)) {
    return res.status(400).json({
      success: false,
      error: `Invalid model type. Must be one of: ${validModels.join(', ')}`
    });
  }

  const trainScript = modelType === 'all' ? 'train_all_models.py' : 'train_single_model.py';
  const args = [path.join(__dirname, '../../../ai-models', trainScript)];

  if (modelType && modelType !== 'all') {
    args.push('--model', modelType);
  }

  if (useAccumulatedData !== undefined) {
    args.push('--use-accumulated-data', useAccumulatedData.toString());
  }

  const pythonProcess = spawn('python', args);

  let output = '';
  let error = '';

  pythonProcess.stdout.on('data', (data) => {
    output += data.toString();
    console.log(`AI Training: ${data.toString()}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    error += data.toString();
    console.error(`AI Training Error: ${data.toString()}`);
  });

  pythonProcess.on('close', (code) => {
    if (code === 0) {
      res.json({
        success: true,
        message: 'AI model training completed successfully',
        modelType: modelType || 'all',
        output: output,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'AI model training failed',
        details: error,
        output: output
      });
    }
  });

  // Handle client disconnect
  req.on('close', () => {
    if (!pythonProcess.killed) {
      pythonProcess.kill();
    }
  });
});

// Get AI models status
router.get('/status', (req, res) => {
  const pythonProcess = spawn('python', [
    path.join(__dirname, '../../../ai-models/check_models.py')
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
        const status = JSON.parse(result);
        res.json({
          success: true,
          status: status,
          timestamp: new Date().toISOString()
        });
      } catch (e) {
        res.status(500).json({
          success: false,
          error: 'Failed to parse model status',
          details: result
        });
      }
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to get model status',
        details: error
      });
    }
  });
});

// Add training data
router.post('/add-training-data', (req, res) => {
  const { dataType, data, label, source, description } = req.body;

  const validDataTypes = ['email', 'transaction', 'daily_usage'];
  
  if (!validDataTypes.includes(dataType)) {
    return res.status(400).json({
      success: false,
      error: `Invalid data type. Must be one of: ${validDataTypes.join(', ')}`
    });
  }

  if (!data || label === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Data and label are required'
    });
  }

  const pythonProcess = spawn('python', [
    path.join(__dirname, '../../../ai-models/add_training_data.py'),
    '--data-type', dataType,
    '--data', JSON.stringify(data),
    '--label', label.toString(),
    '--source', source || 'api',
    '--description', description || ''
  ]);

  let output = '';
  let error = '';

  pythonProcess.stdout.on('data', (data) => {
    output += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    error += data.toString();
  });

  pythonProcess.on('close', (code) => {
    if (code === 0) {
      res.json({
        success: true,
        message: 'Training data added successfully',
        dataType: dataType,
        output: output
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to add training data',
        details: error
      });
    }
  });
});

// Get training data statistics
router.get('/training-stats', (req, res) => {
  const pythonProcess = spawn('python', [
    path.join(__dirname, '../../../ai-models/get_training_stats.py')
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
        const stats = JSON.parse(result);
        res.json({
          success: true,
          statistics: stats,
          timestamp: new Date().toISOString()
        });
      } catch (e) {
        res.status(500).json({
          success: false,
          error: 'Failed to parse training statistics',
          details: result
        });
      }
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to get training statistics',
        details: error
      });
    }
  });
});

// Clear training data
router.delete('/training-data', (req, res) => {
  const { dataType } = req.body;

  const validDataTypes = ['all', 'email', 'transaction', 'daily_usage'];
  
  if (!validDataTypes.includes(dataType)) {
    return res.status(400).json({
      success: false,
      error: `Invalid data type. Must be one of: ${validDataTypes.join(', ')}`
    });
  }

  const pythonProcess = spawn('python', [
    path.join(__dirname, '../../../ai-models/clear_training_data.py'),
    '--data-type', dataType
  ]);

  let output = '';
  let error = '';

  pythonProcess.stdout.on('data', (data) => {
    output += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    error += data.toString();
  });

  pythonProcess.on('close', (code) => {
    if (code === 0) {
      res.json({
        success: true,
        message: `Training data cleared for: ${dataType}`,
        output: output
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to clear training data',
        details: error
      });
    }
  });
});

module.exports = router;