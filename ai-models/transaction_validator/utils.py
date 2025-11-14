#!/usr/bin/env python3
"""
ZK Proofs Utilities
Helper functions and cryptographic utilities
"""

import hashlib
import time
import json
from typing import Any, Dict
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import os

class ZKUtils:
    """Zero-Knowledge Proofs Utilities"""
    
    @staticmethod
    def generate_proof_id(prefix: str = "proof") -> str:
        """Generate unique proof ID"""
        timestamp = int(time.time() * 1000)
        random_part = os.urandom(8).hex()
        return f"{prefix}_{timestamp}_{random_part}"
    
    @staticmethod
    def hash_data(data: Any) -> str:
        """Hash any data consistently"""
        if isinstance(data, (dict, list)):
            data_str = json.dumps(data, sort_keys=True)
        else:
            data_str = str(data)
        
        return hashlib.sha256(data_str.encode()).hexdigest()
    
    @staticmethod
    def validate_proof_structure(proof_data: Dict) -> bool:
        """Validate proof data structure"""
        required_fields = ['proof_hash', 'circuit_id', 'constraints_count']
        
        for field in required_fields:
            if field not in proof_data:
                return False
        
        if not isinstance(proof_data.get('proof_hash'), str):
            return False
        
        if len(proof_data['proof_hash']) != 64:
            return False
        
        return True
    
    @staticmethod
    def calculate_proof_complexity(constraints: int, public_inputs: int, private_inputs: int) -> str:
        """Calculate proof complexity"""
        complexity_score = constraints + (public_inputs * 10) + (private_inputs * 20)
        
        if complexity_score < 1000:
            return "low"
        elif complexity_score < 5000:
            return "medium"
        else:
            return "high"
    
    @staticmethod
    def proof_to_json(proof) -> str:
        """Convert proof to JSON string"""
        if hasattr(proof, '__dict__'):
            return json.dumps(proof.__dict__, indent=2)
        else:
            return json.dumps(proof, indent=2)
    
    @staticmethod
    def json_to_proof(json_str: str):
        """Convert JSON string to proof object"""
        return json.loads(json_str)

class CryptoUtils:
    """Cryptographic utilities for ZK proofs"""
    
    def __init__(self, master_key: str = None):
        self.master_key = master_key or os.urandom(32)
        self.fernet = self._create_fernet()
    
    def _create_fernet(self) -> Fernet:
        """Create Fernet instance for encryption"""
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=b'sovereign_identity_salt',
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(self.master_key))
        return Fernet(key)
    
    def encrypt_proof_data(self, proof_data: Dict) -> str:
        """Encrypt proof data"""
        data_str = json.dumps(proof_data)
        return self.fernet.encrypt(data_str.encode()).decode()
    
    def decrypt_proof_data(self, encrypted_data: str) -> Dict:
        """Decrypt proof data"""
        decrypted = self.fernet.decrypt(encrypted_data.encode())
        return json.loads(decrypted.decode())
    
    def generate_key_pair(self) -> Dict[str, str]:
        """Generate key pair for proof signing"""
        # In production, use proper elliptic curve cryptography
        # This is a simplified version
        private_key = os.urandom(32).hex()
        public_key = hashlib.sha256(private_key.encode()).hexdigest()
        
        return {
            'private_key': private_key,
            'public_key': public_key
        }
    
    def sign_data(self, data: str, private_key: str) -> str:
        """Sign data with private key"""
        # Simplified signing - use proper cryptography in production
        return hashlib.sha256(f"{data}{private_key}".encode()).hexdigest()
    
    def verify_signature(self, data: str, signature: str, public_key: str) -> bool:
        """Verify data signature"""
        # Simplified verification
        expected = hashlib.sha256(f"{data}{public_key}".encode()).hexdigest()
        return signature == expected