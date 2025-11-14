#!/usr/bin/env python3
"""
ZK Proofs Usage Examples
Demonstrates how to use the ZK proofs system
"""

from zk_transaction_proofs import ZKTransactionProver, ZKTransactionVerifier, ZKProof
from zk_identity_proofs import ZKIdentityProver
from zk_balance_proofs import ZKBalanceProver

def demo_transaction_proofs():
    """Demonstrate transaction ZK proofs"""
    print("🔐 Transaction ZK Proofs Demo")
    print("=" * 50)
    
    # Initialize prover and verifier
    prover = ZKTransactionProver()
    verifier = ZKTransactionVerifier()
    
    # Sample transaction
    transaction = {
        'from': '0x742d35Cc6634C0532925a3b8D3Bf5d1C4f1E8a1f',
        'to': '0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326',
        'value': '0xde0b6b3a7640000',  # 1 ETH
        'gas': '0x5208',
        'gasPrice': '0x4a817c800'
    }
    
    # Generate balance proof
    print("\n1. Generating Balance Proof...")
    balance_proof = prover.generate_balance_proof(transaction, 5000000000000000000)  # 5 ETH balance
    print(f"✅ Balance Proof ID: {balance_proof.proof_id}")
    
    # Generate ownership proof  
    print("\n2. Generating Ownership Proof...")
    ownership_proof = prover.generate_ownership_proof(
        transaction['from'], 
        "private_key_hash_12345"
    )
    print(f"✅ Ownership Proof ID: {ownership_proof.proof_id}")
    
    # Verify proofs
    print("\n3. Verifying Proofs...")
    balance_result = verifier.verify_proof(balance_proof)
    ownership_result = verifier.verify_proof(ownership_proof)
    
    print(f"Balance Proof Valid: {balance_result['is_valid']} (Confidence: {balance_result['confidence']}%)")
    print(f"Ownership Proof Valid: {ownership_result['is_valid']} (Confidence: {ownership_result['confidence']}%)")
    
    return balance_result, ownership_result

def demo_identity_proofs():
    """Demonstrate identity ZK proofs"""
    print("\n\n🔐 Identity ZK Proofs Demo")
    print("=" * 50)
    
    identity_prover = ZKIdentityProver()
    
    # Generate age proof
    print("\n1. Generating Age Proof...")
    age_proof = identity_prover.generate_age_proof(25, 18)  # 25 years old, minimum 18
    print(f"✅ Age Proof ID: {age_proof.proof_id}")
    print(f"Public Claims: {age_proof.public_inputs}")
    
    # Generate KYC proof
    print("\n2. Generating KYC Proof...")
    kyc_proof = identity_prover.generate_kyc_proof(True, "tier2")
    print(f"✅ KYC Proof ID: {kyc_proof.proof_id}")
    print(f"Public Claims: {kyc_proof.public_inputs}")
    
    return age_proof, kyc_proof

def demo_batch_verification():
    """Demonstrate batch proof verification"""
    print("\n\n🔐 Batch Verification Demo")
    print("=" * 50)
    
    prover = ZKTransactionProver()
    verifier = ZKTransactionVerifier()
    
    proofs = []
    
    # Generate multiple proofs
    for i in range(3):
        transaction = {
            'from': f'0x742d35Cc6634C0532925a3b8D3Bf5d1C4f1E8a1{i}',
            'to': '0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326',
            'value': '0xde0b6b3a7640000',
            'gas': '0x5208',
            'gasPrice': '0x4a817c800'
        }
        
        proof = prover.generate_balance_proof(transaction, 5000000000000000000)
        proofs.append(proof)
        print(f"Generated proof {i+1}: {proof.proof_id}")
    
    # Batch verify
    print("\nBatch Verifying Proofs...")
    batch_result = verifier.batch_verify_proofs(proofs)
    
    print(f"Total Proofs: {batch_result['total_proofs']}")
    print(f"Valid Proofs: {batch_result['valid_proofs']}")
    print(f"Invalid Proofs: {batch_result['invalid_proofs']}")
    print(f"Verification Time: {batch_result['verification_time']:.3f}s")
    
    return batch_result

if __name__ == "__main__":
    print("🛡️ Sovereign Identity Guardian - ZK Proofs Demo")
    print("=" * 60)
    
    # Run demos  
    demo_transaction_proofs()
    demo_identity_proofs() 
    demo_batch_verification()
    
    print("\n🎉 ZK Proofs Demo Completed!")
    print("   Your privacy-preserving verification system is ready! 🔐")