"""
Profiling Job Models
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime
from enum import Enum


class JobStatus(str, Enum):
    """Job status enumeration"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class JobCreate(BaseModel):
    """Create profiling job request"""
    connection_id: str = Field(..., description="Connection ID")
    dataset_name: str = Field(..., description="Dataset name (schema/database)")
    entities: Optional[List[str]] = Field(None, description="Specific entities to profile (None = all)")
    entity_filter_pattern: Optional[str] = Field(None, description="Entity filter pattern")
    mode: Literal["browse_tables", "custom_query"] = Field("browse_tables", description="Profiling mode")
    custom_query: Optional[str] = Field(None, description="Custom SQL query (if mode=custom_query)")
    query_name: Optional[str] = Field(None, description="Name for custom query result")
    profile_all_columns: bool = Field(True, description="Profile all columns or selected")
    selected_columns: Optional[List[str]] = Field(None, description="Selected columns (if not all)")


class ProfilingJob(BaseModel):
    """Profiling job model"""
    job_id: str
    connection_id: str
    dataset_name: str
    source_type: str
    status: JobStatus
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    total_entities: int = 0
    completed_entities: int = 0
    filtered_entities: int = 0
    progress_percentage: float = 0.0
    estimated_completion_time: Optional[datetime] = None
    error_message: Optional[str] = None
    
    class Config:
        from_attributes = True


class JobResponse(BaseModel):
    """Job response model"""
    job_id: str
    status: JobStatus
    progress_percentage: float
    total_entities: int
    completed_entities: int
    current_entity: Optional[str] = None
    rows_per_second: Optional[float] = None
    elapsed_seconds: Optional[int] = None
    estimated_remaining_seconds: Optional[int] = None
    error_message: Optional[str] = None


class JobProgress(BaseModel):
    """Real-time job progress"""
    job_id: str
    status: JobStatus
    percentage: float
    total_entities: int
    completed_entities: int
    current_entity: Optional[str] = None
    rows_processed: int = 0
    rows_per_second: float = 0.0
    elapsed_time: int = 0
    estimated_time_remaining: int = 0
