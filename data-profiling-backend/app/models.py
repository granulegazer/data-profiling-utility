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


class DatasetLevelRules(BaseModel):
    """Dataset-level profiling rules"""
    dataset_statistics: bool = Field(default=True, description="Dataset statistics rule")
    dataset_quality: bool = Field(default=True, description="Dataset-level data quality rule")
    referential_integrity: bool = Field(default=True, description="Referential integrity rule")
    candidate_keys: bool = Field(default=True, description="Candidate key discovery rule")


class AttributeLevelRules(BaseModel):
    """Attribute-level profiling rules"""
    column_statistics: bool = Field(default=True, description="Column statistics rule")
    data_type_analysis: bool = Field(default=True, description="Data type analysis rule")
    numeric_analysis: bool = Field(default=True, description="Numeric analysis rule")
    string_analysis: bool = Field(default=True, description="String analysis rule")
    date_time_analysis: bool = Field(default=True, description="Date/time analysis rule")
    column_quality: bool = Field(default=True, description="Column-level data quality rule")
    value_distribution: bool = Field(default=True, description="Value distribution rule")
    pii_detection: bool = Field(default=True, description="PII detection rule")


class Rulesets(BaseModel):
    """Profiling rulesets configuration"""
    dataset_level: DatasetLevelRules = Field(default_factory=DatasetLevelRules, description="Dataset-level rules")
    attribute_level: AttributeLevelRules = Field(default_factory=AttributeLevelRules, description="Attribute-level rules")


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
    selected_columns: Optional[List[str]] = Field(None, description="Specific columns to profile (None = all columns)")
    rulesets: Rulesets = Field(default_factory=Rulesets, description="Profiling rulesets to apply")


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
