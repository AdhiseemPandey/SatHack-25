#!/usr/bin/env python3
"""
Data Accumulation Tool for Sovereign Identity Guardian
Interactive tool to collect and manage training data
"""

import json
import sys
import os
from datetime import datetime

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from data_storage import data_storage
from transaction_scanner.model import AdvancedTransactionRiskModel
from email_scanner.model import AdvancedEmailSpamModel

def show_banner():
    """Display application banner"""
    print("\n" + "="*60)
    print("🛡️  SOVEREIGN IDENTITY GUARDIAN - DATA ACCUMULATION TOOL")
    print("="*60)

def add_transaction_sample():
    """Manually add a transaction training sample"""
    print("\n📝 ADD TRANSACTION TRAINING SAMPLE")
    print("-" * 40)
    
    try:
        # Get transaction details
        print("\nEnter transaction details:")
        to_address = input("To Address (0x...): ").strip()
        if not to_address:
            print("❌ To address is required!")
            return False
            
        value = input("Value in hex (default: 0x0): ").strip() or "0x0"
        data = input("Data in hex (default: 0x): ").strip() or "0x"
        gas_price = input("Gas Price in hex (default: 0x4a817c800): ").strip() or "0x4a817c800"
        gas_limit = input("Gas Limit in hex (default: 0x5208): ").strip() or "0x5208"
        
        # Get label
        print("\n📊 Label the transaction:")
        print("0 - Safe/Legitimate transaction")
        print("1 - Risky/Malicious transaction")
        
        while True:
            try:
                label = int(input("Label (0/1): ").strip())
                if label in [0, 1]:
                    break
                else:
                    print("❌ Please enter 0 or 1")
            except ValueError:
                print("❌ Please enter a valid number (0 or 1)")
        
        # Get description
        description = input("Description (optional): ").strip()
        
        transaction = {
            'to': to_address,
            'value': value,
            'data': data,
            'gasPrice': gas_price,
            'gas': gas_limit
        }
        
        # Add to storage
        success = data_storage.add_transaction_sample(
            transaction, label, 
            source="manual", 
            description=description
        )
        
        if success:
            print("✅ Transaction sample added successfully!")
            return True
        else:
            print("❌ Failed to add transaction sample")
            return False
            
    except KeyboardInterrupt:
        print("\n\n⚠️  Operation cancelled by user")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def add_email_sample():
    """Manually add an email training sample"""
    print("\n📧 ADD EMAIL TRAINING SAMPLE")
    print("-" * 40)
    
    try:
        # Get email content
        print("\nEnter email content (press Ctrl+D or Ctrl+Z then Enter when finished):")
        email_lines = []
        try:
            while True:
                line = input()
                email_lines.append(line)
        except (EOFError, KeyboardInterrupt):
            pass
        
        if not email_lines:
            print("❌ Email content cannot be empty!")
            return False
            
        email_content = "\n".join(email_lines)
        
        # Get label
        print("\n📊 Label the email:")
        print("0 - Legitimate email")
        print("1 - Spam/Phishing email")
        
        while True:
            try:
                label = int(input("Label (0/1): ").strip())
                if label in [0, 1]:
                    break
                else:
                    print("❌ Please enter 0 or 1")
            except ValueError:
                print("❌ Please enter a valid number (0 or 1)")
        
        # Get description
        description = input("Description (optional): ").strip()
        
        # Add to storage
        success = data_storage.add_email_sample(
            email_content, label, 
            source="manual", 
            description=description
        )
        
        if success:
            print("✅ Email sample added successfully!")
            return True
        else:
            print("❌ Failed to add email sample")
            return False
            
    except KeyboardInterrupt:
        print("\n\n⚠️  Operation cancelled by user")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def show_statistics():
    """Show current data statistics"""
    stats = data_storage.get_stats()
    
    print("\n📊 DATA STATISTICS")
    print("-" * 40)
    
    print("TRANSACTIONS:")
    print(f"  📈 Total samples: {stats['transactions']['total_samples']}")
    print(f"  ✅ Safe: {stats['transactions']['safe_count']}")
    print(f"  ⚠️  Risky: {stats['transactions']['risky_count']}")
    
    if stats['transactions']['sources']:
        print("  📋 Sources:")
        for source, count in stats['transactions']['sources'].items():
            print(f"     - {source}: {count}")
    
    print("\nEMAILS:")
    print(f"  📈 Total samples: {stats['emails']['total_samples']}")
    print(f"  ✅ Legitimate: {stats['emails']['legitimate_count']}")
    print(f"  🚫 Spam: {stats['emails']['spam_count']}")
    
    if stats['emails']['sources']:
        print("  📋 Sources:")
        for source, count in stats['emails']['sources'].items():
            print(f"     - {source}: {count}")
    
    print(f"\n🕒 Last updated: {stats['last_updated']}")

def view_samples():
    """View stored training samples"""
    print("\n👀 VIEW TRAINING SAMPLES")
    print("-" * 40)
    
    print("1. View Transaction Samples")
    print("2. View Email Samples")
    print("3. Back to Main Menu")
    
    choice = input("\nSelect option (1-3): ").strip()
    
    if choice == '1':
        samples = data_storage.get_detailed_transaction_samples()
        print(f"\n📝 TRANSACTION SAMPLES ({len(samples)} total)")
        print("=" * 50)
        
        for i, sample in enumerate(samples, 1):
            print(f"\n#{i} - {'🚨 RISKY' if sample['label'] == 1 else '✅ SAFE'}")
            print(f"   To: {sample['transaction'].get('to', 'N/A')}")
            print(f"   Value: {sample['transaction'].get('value', '0x0')}")
            print(f"   Data: {sample['transaction'].get('data', '0x')[:50]}...")
            print(f"   Source: {sample.get('source', 'unknown')}")
            print(f"   Date: {sample.get('timestamp', 'unknown')}")
            if sample.get('description'):
                print(f"   Description: {sample['description']}")
    
    elif choice == '2':
        samples = data_storage.get_detailed_email_samples()
        print(f"\n📧 EMAIL SAMPLES ({len(samples)} total)")
        print("=" * 50)
        
        for i, sample in enumerate(samples, 1):
            print(f"\n#{i} - {'🚨 SPAM' if sample['label'] == 1 else '✅ LEGITIMATE'}")
            email_preview = sample['email'][:100] + "..." if len(sample['email']) > 100 else sample['email']
            print(f"   Preview: {email_preview}")
            print(f"   Source: {sample.get('source', 'unknown')}")
            print(f"   Date: {sample.get('timestamp', 'unknown')}")
            if sample.get('description'):
                print(f"   Description: {sample['description']}")

def retrain_models():
    """Retrain both models with accumulated data"""
    print("\n🔄 RETRAIN MODELS WITH ACCUMULATED DATA")
    print("-" * 40)
    
    stats = data_storage.get_stats()
    print(f"📊 Using {stats['transactions']['total_samples']} transaction samples")
    print(f"📊 Using {stats['emails']['total_samples']} email samples")
    
    confirm = input("\nProceed with training? (y/N): ").strip().lower()
    if confirm != 'y':
        print("❌ Training cancelled")
        return
    
    print("\n" + "🔄 TRAINING TRANSACTION MODEL" + "="*30)
    try:
        tx_model = AdvancedTransactionRiskModel()
        tx_metadata = tx_model.train(use_accumulated_data=True)
        tx_model.save_model('transaction_scanner/advanced_transaction_model.joblib')
        print("✅ Transaction model trained and saved!")
    except Exception as e:
        print(f"❌ Error training transaction model: {e}")
    
    print("\n" + "🔄 TRAINING EMAIL MODEL" + "="*30)
    try:
        email_model = AdvancedEmailSpamModel()
        email_metadata = email_model.train(use_accumulated_data=True)
        email_model.save_model('email_scanner/advanced_email_spam_model.joblib')
        print("✅ Email model trained and saved!")
    except Exception as e:
        print(f"❌ Error training email model: {e}")
    
    print("\n🎉 Both models retrained with accumulated data!")

def clear_data():
    """Clear training data (use with caution)"""
    print("\n🗑️  CLEAR TRAINING DATA")
    print("-" * 40)
    print("⚠️  WARNING: This will permanently delete all training data!")
    print("    This action cannot be undone!")
    
    print("\nOptions:")
    print("1. Clear Transaction Data Only")
    print("2. Clear Email Data Only") 
    print("3. Clear ALL Data")
    print("4. Cancel")
    
    choice = input("\nSelect option (1-4): ").strip()
    
    if choice == '1':
        confirm = input("Clear ALL transaction data? (type 'DELETE' to confirm): ")
        if confirm == 'DELETE':
            data_storage.clear_data('transactions')
        else:
            print("❌ Clear cancelled")
    elif choice == '2':
        confirm = input("Clear ALL email data? (type 'DELETE' to confirm): ")
        if confirm == 'DELETE':
            data_storage.clear_data('emails')
        else:
            print("❌ Clear cancelled")
    elif choice == '3':
        confirm = input("Clear ALL training data? (type 'DELETE ALL' to confirm): ")
        if confirm == 'DELETE ALL':
            data_storage.clear_data('all')
        else:
            print("❌ Clear cancelled")
    else:
        print("❌ Operation cancelled")

def main():
    """Main menu for data accumulation"""
    while True:
        show_banner()
        
        print("\n📋 MAIN MENU:")
        print("1. 📝 Add Transaction Sample")
        print("2. 📧 Add Email Sample")
        print("3. 📊 View Statistics")
        print("4. 👀 View Samples")
        print("5. 🔄 Retrain Models")
        print("6. 🗑️  Clear Data (Danger!)")
        print("7. 🚪 Exit")
        
        try:
            choice = input("\nSelect option (1-7): ").strip()
            
            if choice == '1':
                add_transaction_sample()
            elif choice == '2':
                add_email_sample()
            elif choice == '3':
                show_statistics()
            elif choice == '4':
                view_samples()
            elif choice == '5':
                retrain_models()
            elif choice == '6':
                clear_data()
            elif choice == '7':
                print("\n👋 Thank you for using Sovereign Identity Guardian!")
                print("   Your AI models are getting smarter every day! 🚀")
                break
            else:
                print("❌ Invalid option. Please select 1-7.")
            
            input("\nPress Enter to continue...")
            
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Unexpected error: {e}")
            input("Press Enter to continue...")

if __name__ == "__main__":
    main()