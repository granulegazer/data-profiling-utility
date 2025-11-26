"""Data Models - CSV Files Only"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class JobStatus(str, Enum):
    """Job status enumeration"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class FileUploadRequest(BaseModel):
    """File upload request"""
    filename: str
    file_size: int


class CSVConfig(BaseModel):
    """CSV parsing configuration"""
    delimiter: str = Field(default=",", description="CSV delimiter")
    encoding: str = Field(default="utf-8", description="File encoding")
    has_header: bool = Field(default=True, description="Whether first row is header")


class JobCreate(BaseModel):
    """Create profiling job request"""
    name: str = Field(..., description="Job name")
    description: Optional[str] = Field(None, description="Job description")
    file_paths: List[str] = Field(..., description="List of CSV file paths")
    csv_config: CSVConfig = Field(default_factory=CSVConfig)
    treat_files_as_dataset: bool = Field(
        default=True,
        description="If True, each file is a separate dataset"
    )
    sample_size: Optional[int] = Field(None, description="Number of rows to profile")


class Job(BaseModel):
    """Profiling job"""
    job_id: str
    name: str
    description: Optional[str] = None
    status: JobStatus
    file_paths: List[str]
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    progress: float = 0.0
    error_message: Optional[str] = None


class ColumnStats(BaseModel):
    """Column statistics"""
    column_name: str
    data_type: str
    null_count: int
    null_percentage: float
    unique_count: int
    unique_percentage: float
    min_value: Optional[Any] = None
    max_value: Optional[Any] = None
    mean: Optional[float] = None
    median: Optional[float] = None
    std_dev: Optional[float] = None
    top_values: List[Dict[str, Any]] = []


class DatasetProfile(BaseModel):
    """Dataset profiling results"""
    dataset_name: str
    row_count: int
    column_count: int
    file_size_bytes: int
    columns: List[ColumnStats]
    profiled_at: datetime


class JobResult(BaseModel):
    """Job result summary"""
    job_id: str
    job_name: str
    status: JobStatus
    datasets: List[DatasetProfile]
    total_rows: int
    total_columns: int
    completed_at: Optional[datetime] = None
