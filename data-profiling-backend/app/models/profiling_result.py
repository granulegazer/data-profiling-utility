"""
Profiling Result Models - Atomic Metrics
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Literal, Dict
from datetime import datetime


# ===== Dataset-Level Rules Models =====

class DatasetStatistics(BaseModel):
    """Dataset Statistics (Dataset-Level Rule 1)"""
    total_record_count: int
    total_column_count: int
    dataset_size_bytes: int
    profiling_timestamp: datetime
    profiling_duration_seconds: float


class DatasetDataQuality(BaseModel):
    """Dataset-Level Data Quality Metrics (Dataset-Level Rule 2)"""
    overall_completeness_score: float = Field(..., ge=0, le=100)
    overall_quality_score: float = Field(..., ge=0, le=100)
    quality_grade: Literal["GOLD", "SILVER", "BRONZE"]
    pii_risk_score: float = Field(..., ge=0, le=100)


class ReferentialIntegrity(BaseModel):
    """Referential Integrity (Dataset-Level Rule 3)"""
    foreign_key_validations: List[Dict]
    orphan_record_count: int
    cross_table_consistency_checks: List[Dict]


class CandidateKey(BaseModel):
    """Candidate Key Discovery (Dataset-Level Rule 4)"""
    column_names: List[str]
    is_composite: bool
    uniqueness_percentage: float
    is_non_null: bool
    confidence_score: float


# ===== Attribute-Level Rules Models =====

class ColumnStatisticsMetrics(BaseModel):
    """Column Statistics (Attribute-Level Rule 1)"""
    record_count: int
    null_count: int
    null_percentage: float
    unique_value_count: int
    distinct_value_count: int
    duplicate_count: int


class DataTypeAnalysis(BaseModel):
    """Data Type Analysis (Attribute-Level Rule 2)"""
    inferred_data_type: str
    type_consistency_percentage: float
    format_patterns: List[str]
    type_mismatches_count: int


class NumericAnalysis(BaseModel):
    """Numeric Analysis (Attribute-Level Rule 3) - Atomic"""
    minimum_value: Optional[float] = None
    maximum_value: Optional[float] = None
    mean_value: Optional[float] = None
    median_value: Optional[float] = None
    standard_deviation: Optional[float] = None
    variance: Optional[float] = None
    first_quartile_q1: Optional[float] = None
    third_quartile_q3: Optional[float] = None
    percentile_5th: Optional[float] = None
    percentile_10th: Optional[float] = None
    percentile_90th: Optional[float] = None
    percentile_95th: Optional[float] = None
    outlier_count: int = 0
    outlier_percentage: float = 0.0


class StringAnalysis(BaseModel):
    """String Analysis (Attribute-Level Rule 4) - Atomic"""
    minimum_length: Optional[int] = None
    maximum_length: Optional[int] = None
    average_length: Optional[float] = None
    most_common_patterns: List[Dict] = []
    character_set_analysis: Dict = {}
    leading_spaces_count: int = 0
    trailing_spaces_count: int = 0
    empty_string_count: int = 0
    whitespace_only_count: int = 0


class DateTimeAnalysis(BaseModel):
    """Date/Time Analysis (Attribute-Level Rule 5) - Atomic"""
    minimum_date: Optional[datetime] = None
    maximum_date: Optional[datetime] = None
    date_range_span_days: Optional[int] = None
    date_format_patterns: List[str] = []
    timezone_detected: Optional[str] = None
    invalid_date_count: int = 0
    future_date_count: int = 0
    past_date_count: int = 0
    weekend_count: int = 0
    weekday_count: int = 0


class ColumnDataQuality(BaseModel):
    """Column-Level Data Quality (Attribute-Level Rule 6)"""
    completeness_percentage: float = Field(..., ge=0, le=100)
    validity_percentage: float = Field(..., ge=0, le=100)
    consistency_score: float = Field(..., ge=0, le=100)
    conformity_rate: float = Field(..., ge=0, le=100)
    column_quality_score: float = Field(..., ge=0, le=100)
    quality_grade: Literal["GOLD", "SILVER", "BRONZE"]


class ValueDistribution(BaseModel):
    """Value Distribution (Attribute-Level Rule 7) - Atomic"""
    frequency_distribution: Dict[str, int]
    top_n_values: List[Dict]
    bottom_n_values: List[Dict]
    histogram_bins: List[Dict]
    cardinality: int
    cardinality_ratio: float
    mode_value: Optional[str] = None
    mode_frequency: int = 0
    skewness: Optional[float] = None


class PIIDetection(BaseModel):
    """PII Detection (Attribute-Level Rule 8) - Atomic"""
    email_detected: bool = False
    phone_detected: bool = False
    ssn_detected: bool = False
    credit_card_detected: bool = False
    ip_address_detected: bool = False
    physical_address_detected: bool = False
    name_detected: bool = False
    dob_detected: bool = False
    gdpr_categories: List[str] = []
    pii_confidence_score: float = Field(..., ge=0, le=100)
    pii_risk_level: Literal["LOW", "MEDIUM", "HIGH"]


# ===== Complete Column Profile =====

class ColumnStatistics(BaseModel):
    """Complete column profiling result - All 8 Attribute-Level Rules"""
    column_name: str
    column_index: int
    
    # Rule 1: Column Statistics
    statistics: ColumnStatisticsMetrics
    
    # Rule 2: Data Type Analysis
    data_type: DataTypeAnalysis
    
    # Rule 3: Numeric Analysis (if applicable)
    numeric_analysis: Optional[NumericAnalysis] = None
    
    # Rule 4: String Analysis (if applicable)
    string_analysis: Optional[StringAnalysis] = None
    
    # Rule 5: Date/Time Analysis (if applicable)
    datetime_analysis: Optional[DateTimeAnalysis] = None
    
    # Rule 6: Column Data Quality
    data_quality: ColumnDataQuality
    
    # Rule 7: Value Distribution
    value_distribution: ValueDistribution
    
    # Rule 8: PII Detection
    pii_detection: PIIDetection


# ===== Complete Dataset/Entity Profiling Result =====

class DataQualityMetrics(BaseModel):
    """Overall data quality metrics"""
    completeness: float
    validity: float
    consistency: float
    accuracy: float
    overall_score: float
    grade: Literal["GOLD", "SILVER", "BRONZE"]


class ProfilingResult(BaseModel):
    """Complete profiling result for an entity"""
    entity_name: str
    entity_type: str
    profiled_at: datetime
    
    # Dataset-Level Rules (4 rules)
    dataset_statistics: DatasetStatistics
    dataset_data_quality: DatasetDataQuality
    referential_integrity: ReferentialIntegrity
    candidate_keys: List[CandidateKey]
    
    # Attribute-Level Rules (8 rules per column)
    columns: List[ColumnStatistics]
    
    # Summary
    summary: DataQualityMetrics
