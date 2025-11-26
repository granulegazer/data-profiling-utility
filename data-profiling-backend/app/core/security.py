"""
Security and Encryption Utilities
"""

from cryptography.fernet import Fernet
from app.core.config import settings


class EncryptionManager:
    """Handles encryption and decryption of sensitive data"""
    
    def __init__(self):
        self.cipher = Fernet(settings.ENCRYPTION_KEY.encode())
    
    def encrypt(self, data: str) -> str:
        """Encrypt a string"""
        return self.cipher.encrypt(data.encode()).decode()
    
    def decrypt(self, encrypted_data: str) -> str:
        """Decrypt a string"""
        return self.cipher.decrypt(encrypted_data.encode()).decode()


encryption_manager = EncryptionManager()
