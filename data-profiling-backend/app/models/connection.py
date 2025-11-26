"""
Database Connection Models
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class ConnectionBase(BaseModel):
    """Base connection model"""
    name: str = Field(..., description="Connection name/alias")
    type: Literal["postgresql", "oracle", "data_lake", "csv", "json", "xml", "excel"] = Field(..., description="Connection type")
    host: Optional[str] = Field(None, description="Database host")
    port: Optional[int] = Field(None, description="Database port")
    database: Optional[str] = Field(None, description="Database name")
    username: Optional[str] = Field(None, description="Username")


class ConnectionCreate(ConnectionBase):
    """Create connection request"""
    password: str = Field(..., description="Password (will be encrypted)")


class Connection(ConnectionBase):
    """Connection model with encrypted password"""
    id: str = Field(..., description="Connection ID")
    password_encrypted: str = Field(..., description="Encrypted password")
    last_used: Optional[datetime] = Field(None, description="Last used timestamp")
    created_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        from_attributes = True


class ConnectionResponse(ConnectionBase):
    """Connection response (without sensitive data)"""
    id: str
    last_used: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class ConnectionTest(BaseModel):
    """Connection test result"""
    success: bool
    message: str
    details: Optional[dict] = None
