"""
API Router: Connections Management
"""

from fastapi import APIRouter, HTTPException, status
from typing import List
from app.models.connection import (
    ConnectionCreate,
    ConnectionResponse,
    ConnectionTest
)
from app.services.connection_service import ConnectionService

router = APIRouter()
connection_service = ConnectionService()


@router.get("/", response_model=List[ConnectionResponse])
async def list_connections():
    """List all saved connections"""
    return await connection_service.list_connections()


@router.post("/", response_model=ConnectionResponse, status_code=status.HTTP_201_CREATED)
async def create_connection(connection: ConnectionCreate):
    """Create a new connection"""
    return await connection_service.create_connection(connection)


@router.get("/{connection_id}", response_model=ConnectionResponse)
async def get_connection(connection_id: str):
    """Get connection by ID"""
    conn = await connection_service.get_connection(connection_id)
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")
    return conn


@router.put("/{connection_id}", response_model=ConnectionResponse)
async def update_connection(connection_id: str, connection: ConnectionCreate):
    """Update an existing connection"""
    updated = await connection_service.update_connection(connection_id, connection)
    if not updated:
        raise HTTPException(status_code=404, detail="Connection not found")
    return updated


@router.delete("/{connection_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_connection(connection_id: str):
    """Delete a connection"""
    deleted = await connection_service.delete_connection(connection_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Connection not found")


@router.post("/{connection_id}/test", response_model=ConnectionTest)
async def test_connection(connection_id: str):
    """Test a connection"""
    result = await connection_service.test_connection(connection_id)
    if not result:
        raise HTTPException(status_code=404, detail="Connection not found")
    return result
