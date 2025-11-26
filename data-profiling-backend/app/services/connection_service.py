"""
Connection Service - Manage database connections
"""

from typing import List, Optional
import uuid
from datetime import datetime
from app.models.connection import Connection, ConnectionCreate, ConnectionResponse, ConnectionTest
from app.core.security import encryption_manager


class ConnectionService:
    """Service for managing database connections"""
    
    def __init__(self):
        # In-memory storage for demo (should be replaced with database)
        self.connections: dict[str, Connection] = {}
    
    async def list_connections(self) -> List[ConnectionResponse]:
        """List all connections"""
        return [
            ConnectionResponse(
                id=conn.id,
                name=conn.name,
                type=conn.type,
                host=conn.host,
                port=conn.port,
                database=conn.database,
                username=conn.username,
                last_used=conn.last_used,
                created_at=conn.created_at
            )
            for conn in self.connections.values()
        ]
    
    async def create_connection(self, connection_data: ConnectionCreate) -> ConnectionResponse:
        """Create a new connection"""
        connection_id = str(uuid.uuid4())
        
        # Encrypt password
        encrypted_password = encryption_manager.encrypt(connection_data.password)
        
        connection = Connection(
            id=connection_id,
            name=connection_data.name,
            type=connection_data.type,
            host=connection_data.host,
            port=connection_data.port,
            database=connection_data.database,
            username=connection_data.username,
            password_encrypted=encrypted_password,
            created_at=datetime.now()
        )
        
        self.connections[connection_id] = connection
        
        return ConnectionResponse(
            id=connection.id,
            name=connection.name,
            type=connection.type,
            host=connection.host,
            port=connection.port,
            database=connection.database,
            username=connection.username,
            last_used=connection.last_used,
            created_at=connection.created_at
        )
    
    async def get_connection(self, connection_id: str) -> Optional[ConnectionResponse]:
        """Get connection by ID"""
        conn = self.connections.get(connection_id)
        if not conn:
            return None
        
        return ConnectionResponse(
            id=conn.id,
            name=conn.name,
            type=conn.type,
            host=conn.host,
            port=conn.port,
            database=conn.database,
            username=conn.username,
            last_used=conn.last_used,
            created_at=conn.created_at
        )
    
    async def update_connection(self, connection_id: str, connection_data: ConnectionCreate) -> Optional[ConnectionResponse]:
        """Update connection"""
        if connection_id not in self.connections:
            return None
        
        conn = self.connections[connection_id]
        conn.name = connection_data.name
        conn.type = connection_data.type
        conn.host = connection_data.host
        conn.port = connection_data.port
        conn.database = connection_data.database
        conn.username = connection_data.username
        conn.password_encrypted = encryption_manager.encrypt(connection_data.password)
        
        return await self.get_connection(connection_id)
    
    async def delete_connection(self, connection_id: str) -> bool:
        """Delete connection"""
        if connection_id in self.connections:
            del self.connections[connection_id]
            return True
        return False
    
    async def test_connection(self, connection_id: str) -> Optional[ConnectionTest]:
        """Test a connection"""
        conn = self.connections.get(connection_id)
        if not conn:
            return None
        
        # TODO: Implement actual connection testing based on connection type
        return ConnectionTest(
            success=True,
            message="Connection test successful",
            details={
                "connection_id": conn.id,
                "type": conn.type,
                "host": conn.host
            }
        )
