# 🤖 AI Models - Sovereign Identity Guardian

Advanced machine learning models for transaction risk assessment and email spam detection.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt

# Train all models at once
python train_all_models.py

# Or use the data accumulation tool
python accumulate_data.py

# Or train individually
cd transaction_scanner
python model.py

cd ../email_scanner
python model.py




**********************************************************************************************************************************************
-------------------------------- 
To add the data and all 
--------------------------------

ai-modles / acummulate_data =>
steps - 
For Data Collection:
Choose 1 - Add transaction samples (financial data, user interactions)

Choose 2 - Add email samples (communication patterns, authentication data)

For Analysis:
Choose 3 - View current statistics of your accumulated data

Choose 4 - Review existing samples you've collected

For Model Improvement:
Choose 5 - Retrain AI models with new accumulated data

⚠️ Use with Caution:
Choose 6 - Only if you need to completely clear your dataset

Choose 7 - To exit the program safely

💡 Suggested First Steps:
If you're just starting, I'd recommend:

Start with option 1 or 2 to begin accumulating data samples

Then check option 3 to see your data statistics

Later use option 5 to retrain models with new data




cd ai-models
pip install -r requirements.txt

python data_storage.py

python accumulate_data.py(manual training)

python train_all_models.py(train all models)

// Test Individual Models
# Test email model
python -c "from email_scanner.model import AdvancedEmailSpamModel; model = AdvancedEmailSpamModel(); model.load_model(); print(model.predict_spam('Test email content'))"

# Test transaction model  
python -c "from transaction_scanner.model import AdvancedTransactionRiskModel; model = AdvancedTransactionRiskModel(); model.load_model(); print(model.predict_risk({'to': '0x123...', 'value': '0x0'}))"

# Test daily usage model
python -c "from daily_usage_scanner.model import AdvancedDailyUsageModel; model = AdvancedDailyUsageModel(); model.load_model(); print(model.predict_risk('Daily activities log'))"



// FEATURES

Self-Training: All models automatically use accumulated data for continuous improvement

Manual Training: Use the data accumulation tool to add labeled samples

Batch Training: Train all models simultaneously with one command

Feature Engineering: Advanced feature extraction for each domain

Model Persistence: Save and load trained models with metadata

Performance Tracking: Monitor model accuracy and training statistics

Data Management: Centralized storage for all training data