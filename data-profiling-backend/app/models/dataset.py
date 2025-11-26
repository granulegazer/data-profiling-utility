"""
Dataset and Entity Profile Models
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class DatasetProfile(BaseModel):
    """Dataset profile summary"""
    dataset_profile_id: str
    job_id: str
    dataset_name: str
    total_entities: int
    total_rows: int
    total_columns: int
    overall_quality_score: float = Field(..., ge=0, le=100)
    overall_quality_grade: Literal["GOLD", "SILVER", "BRONZE"]
    storage_size: Optional[int] = None
    profiled_at: datetime
    
    class Config:
        from_attributes = True


class EntityProfile(BaseModel):
    """Entity profile summary"""
    entity_profile_id: str
    dataset_profile_id: str
    entity_name: str
    entity_type: Literal["table", "table_partial", "query", "api"]
    source_query: Optional[str] = None
    selected_columns: Optional[str] = None
    api_endpoint: Optional[str] = None
    domain_name: Optional[str] = None
    xpath_or_attribute_path: Optional[str] = None
    row_count: int
    column_count: int
    total_null_count: int
    overall_null_percentage: float
    overall_completeness_score: float = Field(..., ge=0, le=100)
    data_quality_score: float = Field(..., ge=0, le=100)
    data_quality_grade: Literal["GOLD", "SILVER", "BRONZE"]
    pii_risk_score: float = Field(..., ge=0, le=100)
    candidate_key_count: int = 0
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    rows_processed: int
    processing_speed_rows_per_sec: float
    
    class Config:
        from_attributes = True
