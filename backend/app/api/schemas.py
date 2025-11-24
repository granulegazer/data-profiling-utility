"""Pydantic schemas for API request/response validation"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime


class DataSourceConfig(BaseModel):
    """Configuration for data source connection"""
    source_type: str = Field(..., description="Type: oracle, postgres, file, api")
    config: Dict[str, Any] = Field(..., description="Connection configuration")


class ProfilingJobCreate(BaseModel):
    """Schema for creating a profiling job"""
    job_name: str
    source_type: str
    source_config: Dict[str, Any]
    table_name: Optional[str] = None
    sample_size: Optional[int] = None


class ProfilingJobResponse(BaseModel):
    """Schema for profiling job response"""
    id: int
    job_name: str
    source_type: str
    status: str
    created_at: datetime
    completed_at: Optional[datetime]
    error_message: Optional[str]
    
    class Config:
        from_attributes = True


class ColumnProfileResponse(BaseModel):
    """Schema for column profile response"""
    id: int
    column_name: str
    data_type: str
    total_count: int
    null_count: int
    null_percentage: float
    unique_count: int
    unique_percentage: float
    min_value: Optional[float]
    max_value: Optional[float]
    mean_value: Optional[float]
    median_value: Optional[float]
    std_dev: Optional[float]
    min_length: Optional[int]
    max_length: Optional[int]
    avg_length: Optional[float]
    top_values: Optional[List[Dict[str, Any]]]
    pattern_analysis: Optional[List[Dict[str, Any]]]
    quality_issues: Optional[List[Dict[str, Any]]]
    
    class Config:
        from_attributes = True


class ProfilingResultResponse(BaseModel):
    """Schema for profiling result response"""
    id: int
    job_id: int
    table_name: str
    total_rows: int
    total_columns: int
    profiled_at: datetime
    column_profiles: List[ColumnProfileResponse]
    
    class Config:
        from_attributes = True


class TestConnectionRequest(BaseModel):
    """Schema for testing data source connection"""
    source_type: str
    config: Dict[str, Any]


class TestConnectionResponse(BaseModel):
    """Schema for connection test response"""
    success: bool
    message: str
