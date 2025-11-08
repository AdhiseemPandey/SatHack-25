#!/usr/bin/env python3
"""
Batch Training Script for Sovereign Identity Guardian
Train all AI models with one command - supports both manual and automatic training
"""

import os
import sys
from datetime import datetime

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from data_storage import data_storage
from transaction_scanner.model import AdvancedTransactionRiskModel
from email_scanner.model import AdvancedEmailSpamModel
from daily_usage_scanner.model import AdvancedDailyUsageModel

def print_header(text):
    """Print formatted header"""
    print(f"\n{'='*60}")
    print(f"🤖 {text}")
    print(f"{'='*60}")

def train_transaction_model():
    """Train the transaction risk model"""
    print_header("TRAINING TRANSACTION RISK MODEL")
    
    try:
        model = AdvancedTransactionRiskModel()
        
        # Check if we have accumulated data - with error handling
        try:
            stats = data_storage.get_stats()['transactions']
            print(f"📊 Available data: {stats['total_samples']} samples")
            
            if stats['total_samples'] >= 4:
                print("✅ Using accumulated training data")
                metadata = model.train(use_accumulated_data=True)
            else:
                print("⚠️  Using sample data (not enough accumulated data)")
                metadata = model.train(use_accumulated_data=False)
        except (KeyError, TypeError) as e:
            print("⚠️  No accumulated data found, using sample data")
            metadata = model.train(use_accumulated_data=False)
        
        # Save the model
        model_path = 'transaction_scanner/advanced_transaction_model.joblib'
        model.save_model(model_path)
        
        print(f"✅ Transaction model trained successfully!")
        print(f"📊 Accuracy: {metadata.get('test_accuracy', 0):.4f}")
        print(f"📊 Samples used: {metadata.get('total_samples', 0)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error training transaction model: {e}")
        return False

def train_email_model():
    """Train the email spam model"""
    print_header("TRAINING EMAIL SPAM MODEL")
    
    try:
        model = AdvancedEmailSpamModel()
        
        # Check if we have accumulated data - with error handling
        try:
            stats = data_storage.get_stats()['emails']
            print(f"📊 Available data: {stats['total_samples']} samples")
            
            if stats['total_samples'] >= 4:
                print("✅ Using accumulated training data")
                metadata = model.train(use_accumulated_data=True)
            else:
                print("⚠️  Using sample data (not enough accumulated data)")
                metadata = model.train(use_accumulated_data=False)
        except (KeyError, TypeError) as e:
            print("⚠️  No accumulated data found, using sample data")
            metadata = model.train(use_accumulated_data=False)
        
        # Save the model
        model_path = 'email_scanner/advanced_email_spam_model.joblib'
        model.save_model(model_path)
        
        print(f"✅ Email model trained successfully!")
        print(f"📊 Accuracy: {metadata.get('test_accuracy', 0):.4f}")
        print(f"📊 Samples used: {metadata.get('total_samples', 0)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error training email model: {e}")
        return False

def train_daily_usage_model():
    """Train the daily usage model"""
    print_header("TRAINING DAILY USAGE MODEL")
    
    try:
        model = AdvancedDailyUsageModel()
        
        # Check if we have accumulated data - with error handling
        try:
            stats = data_storage.get_stats()['daily_usage']
            print(f"📊 Available data: {stats['total_samples']} samples")
            
            if stats['total_samples'] >= 4:
                print("✅ Using accumulated training data")
                metadata = model.train(use_accumulated_data=True)
            else:
                print("⚠️  Using sample data (not enough accumulated data)")
                metadata = model.train(use_accumulated_data=False)
        except (KeyError, TypeError) as e:
            print("⚠️  No accumulated data found, using sample data")
            metadata = model.train(use_accumulated_data=False)
        
        # Save the model
        model_path = 'daily_usage_scanner/advanced_daily_usage_model.joblib'
        model.save_model(model_path)
        
        print(f"✅ Daily usage model trained successfully!")
        print(f"📊 Accuracy: {metadata.get('test_accuracy', 0):.4f}")
        print(f"📊 Samples used: {metadata.get('total_samples', 0)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error training daily usage model: {e}")
        return False

def show_training_summary():
    """Show summary of training data and model performance"""
    print_header("TRAINING SUMMARY")
    
    try:
        stats = data_storage.get_stats()
        model_metadata = data_storage.get_model_metadata()
        
        print("📊 DATA SUMMARY:")
        print(f"   Transactions: {stats['transactions']['total_samples']} samples")
        print(f"   Emails: {stats['emails']['total_samples']} samples")
        print(f"   Daily Usage: {stats['daily_usage']['total_samples']} samples")
        
        print("\n🤖 MODEL PERFORMANCE:")
        
        # Transaction model info
        tx_meta = model_metadata.get('transaction_scanner', {})
        if tx_meta:
            print(f"   Transaction Model:")
            print(f"     - Accuracy: {tx_meta.get('test_accuracy', 0):.4f}")
            print(f"     - Samples: {tx_meta.get('total_samples', 0)}")
            print(f"     - Trained: {tx_meta.get('trained_at', 'Unknown')}")
        else:
            print("   Transaction Model: Not trained yet")
        
        # Email model info
        email_meta = model_metadata.get('email_scanner', {})
        if email_meta:
            print(f"   Email Model:")
            print(f"     - Accuracy: {email_meta.get('test_accuracy', 0):.4f}")
            print(f"     - Samples: {email_meta.get('total_samples', 0)}")
            print(f"     - Trained: {email_meta.get('trained_at', 'Unknown')}")
        else:
            print("   Email Model: Not trained yet")
            
        # Daily usage model info
        daily_meta = model_metadata.get('daily_usage_scanner', {})
        if daily_meta:
            print(f"   Daily Usage Model:")
            print(f"     - Accuracy: {daily_meta.get('test_accuracy', 0):.4f}")
            print(f"     - Samples: {daily_meta.get('total_samples', 0)}")
            print(f"     - Trained: {daily_meta.get('trained_at', 'Unknown')}")
        else:
            print("   Daily Usage Model: Not trained yet")
            
    except Exception as e:
        print(f"⚠️  Could not load training summary: {e}")
        print("   This is normal if no data has been accumulated yet.")
        print("   Use the data accumulation tool to add samples first.")

def main():
    """Main training function"""
    print_header("SOVEREIGN IDENTITY GUARDIAN - BATCH TRAINING")
    print("Training all AI models with available data...")
    
    start_time = datetime.now()
    
    # Show current stats (with error handling)
    try:
        show_training_summary()
    except Exception as e:
        print(f"⚠️  Could not show pre-training summary: {e}")
        print("   Continuing with training...")
    
    # Train models
    success_count = 0
    
    if train_transaction_model():
        success_count += 1
    
    if train_email_model():
        success_count += 1
        
    if train_daily_usage_model():
        success_count += 1
    
    # Show final summary
    end_time = datetime.now()
    training_time = (end_time - start_time).total_seconds()
    
    print_header("TRAINING COMPLETE")
    print(f"✅ Successfully trained {success_count}/3 models")
    print(f"⏱️  Total training time: {training_time:.2f} seconds")
    print(f"🕒 Completed at: {end_time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    if success_count == 3:
        print("\n🎉 All models trained successfully!")
        print("   Your AI security system is ready to protect! 🛡️")
    else:
        print("\n⚠️  Some models failed to train.")
        print("   Check the errors above and try again.")

if __name__ == "__main__":
    main()