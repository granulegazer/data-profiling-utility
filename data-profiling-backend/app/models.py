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


class NumericStats(BaseModel):
    """Numeric analysis statistics"""
    min: Optional[float] = None
    max: Optional[float] = None
    mean: Optional[float] = None
    median: Optional[float] = None
    std_dev: Optional[float] = None
    variance: Optional[float] = None
    q1: Optional[float] = None
    q3: Optional[float] = None
    percentile_5: Optional[float] = None
    percentile_25: Optional[float] = None
    percentile_75: Optional[float] = None
    percentile_95: Optional[float] = None
    outlier_count: Optional[int] = None
    outlier_percentage: Optional[float] = None


class StringStats(BaseModel):
    """String analysis statistics"""
    min_length: Optional[int] = None
    max_length: Optional[int] = None
    avg_length: Optional[float] = None
    empty_string_count: Optional[int] = None
    whitespace_only_count: Optional[int] = None
    leading_spaces_count: Optional[int] = None
    trailing_spaces_count: Optional[int] = None
    common_patterns: Optional[List[Dict[str, Any]]] = []
    character_set_summary: Optional[Dict[str, int]] = None


class DateTimeStats(BaseModel):
    """Date/time analysis statistics"""
    min_date: Optional[str] = None
    max_date: Optional[str] = None
    date_range_days: Optional[int] = None
    detected_formats: Optional[List[str]] = []
    invalid_date_count: Optional[int] = None
    future_date_count: Optional[int] = None
    weekend_count: Optional[int] = None
    weekday_count: Optional[int] = None


class ColumnQualityMetrics(BaseModel):
    """Column-level data quality metrics"""
    completeness_percentage: float = 0.0
    validity_percentage: float = 0.0
    consistency_score: float = 0.0
    conformity_rate: float = 0.0
    quality_score: float = 0.0
    quality_grade: str = "Bronze"  # Gold, Silver, Bronze


class ValueDistribution(BaseModel):
    """Value distribution statistics"""
    cardinality: int = 0
    cardinality_ratio: float = 0.0
    mode: Optional[Any] = None
    mode_frequency: Optional[int] = None
    top_values: List[Dict[str, Any]] = []
    bottom_values: List[Dict[str, Any]] = []
    histogram_bins: Optional[List[Dict[str, Any]]] = []
    skewness: Optional[float] = None


class PIIDetection(BaseModel):
    """PII detection results"""
    contains_email: bool = False
    contains_phone: bool = False
    contains_ssn: bool = False
    contains_credit_card: bool = False
    contains_ip_address: bool = False
    contains_names: bool = False
    contains_dob: bool = False
    pii_categories: List[str] = []
    confidence_score: float = 0.0
    risk_level: str = "Low"  # Low, Medium, High


class ColumnStats(BaseModel):
    """Column statistics - comprehensive profiling results"""
    column_name: str
    data_type: str
    
    # Basic column statistics
    null_count: int
    null_percentage: float
    unique_count: int
    unique_percentage: float
    duplicate_count: int = 0
    
    # Legacy fields for backward compatibility
    min_value: Optional[Any] = None
    max_value: Optional[Any] = None
    mean: Optional[float] = None
    median: Optional[float] = None
    std_dev: Optional[float] = None
    top_values: List[Dict[str, Any]] = []
    
    # Rule-specific statistics
    numeric_stats: Optional[NumericStats] = None
    string_stats: Optional[StringStats] = None
    datetime_stats: Optional[DateTimeStats] = None
    quality_metrics: Optional[ColumnQualityMetrics] = None
    value_distribution: Optional[ValueDistribution] = None
    pii_detection: Optional[PIIDetection] = None


class DatasetQualityMetrics(BaseModel):
    """Dataset-level quality metrics"""
    overall_completeness: float = 0.0
    overall_quality_score: float = 0.0
    quality_grade: str = "Bronze"  # Gold, Silver, Bronze
    pii_risk_score: float = 0.0


class ReferentialIntegrity(BaseModel):
    """Referential integrity results"""
    foreign_key_checks: List[Dict[str, Any]] = []
    orphan_records: List[Dict[str, Any]] = []
    cross_table_consistency: List[Dict[str, Any]] = []


class CandidateKey(BaseModel):
    """Candidate key information"""
    columns: List[str]
    is_unique: bool
    uniqueness_percentage: float
    is_composite: bool
    has_nulls: bool
    recommendation: str  # "primary_key", "candidate_key", "near_unique"


class CandidateKeys(BaseModel):
    """Candidate key discovery results"""
    single_column_keys: List[CandidateKey] = []
    composite_keys: List[CandidateKey] = []
    primary_key_suggestions: List[CandidateKey] = []


class DatasetStatistics(BaseModel):
    """Dataset-level statistics"""
    total_records: int
    total_columns: int
    dataset_size_bytes: int
    profiling_duration_seconds: float = 0.0
    profiled_at: datetime


class DatasetProfile(BaseModel):
    """Dataset profiling results"""
    dataset_name: str
    row_count: int
    column_count: int
    file_size_bytes: int
    columns: List[ColumnStats]
    profiled_at: datetime
    
    # Dataset-level rule results
    dataset_statistics: Optional[DatasetStatistics] = None
    dataset_quality: Optional[DatasetQualityMetrics] = None
    referential_integrity: Optional[ReferentialIntegrity] = None
    candidate_keys: Optional[CandidateKeys] = None


class JobResult(BaseModel):
    """Job result summary"""
    job_id: str
    job_name: str
    status: JobStatus
    datasets: List[DatasetProfile]
    total_rows: int
    total_columns: int
    completed_at: Optional[datetime] = None
