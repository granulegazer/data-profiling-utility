"""Database models for profiling data"""
from sqlalchemy import Column, Integer, String, DateTime, Float, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base


class ProfilingJob(Base):
    """Model for profiling job metadata"""
    __tablename__ = "profiling_jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    job_name = Column(String, index=True)
    source_type = Column(String)  # oracle, postgres, file, api
    source_config = Column(JSON)  # Connection details
    status = Column(String, default="pending")  # pending, running, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Relationships
    results = relationship("ProfilingResult", back_populates="job", cascade="all, delete-orphan")


class ProfilingResult(Base):
    """Model for overall profiling results"""
    __tablename__ = "profiling_results"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("profiling_jobs.id"))
    table_name = Column(String)
    total_rows = Column(Integer)
    total_columns = Column(Integer)
    profiled_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    job = relationship("ProfilingJob", back_populates="results")
    column_profiles = relationship("ColumnProfile", back_populates="result", cascade="all, delete-orphan")


class ColumnProfile(Base):
    """Model for individual column profiling results"""
    __tablename__ = "column_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    result_id = Column(Integer, ForeignKey("profiling_results.id"))
    column_name = Column(String)
    data_type = Column(String)
    
    # Basic statistics
    total_count = Column(Integer)
    null_count = Column(Integer)
    null_percentage = Column(Float)
    unique_count = Column(Integer)
    unique_percentage = Column(Float)
    
    # Numeric statistics
    min_value = Column(Float, nullable=True)
    max_value = Column(Float, nullable=True)
    mean_value = Column(Float, nullable=True)
    median_value = Column(Float, nullable=True)
    std_dev = Column(Float, nullable=True)
    
    # String statistics
    min_length = Column(Integer, nullable=True)
    max_length = Column(Integer, nullable=True)
    avg_length = Column(Float, nullable=True)
    
    # Pattern analysis
    top_values = Column(JSON, nullable=True)  # Top 10 frequent values
    pattern_analysis = Column(JSON, nullable=True)  # Regex patterns found
    
    # Data quality checks
    quality_issues = Column(JSON, nullable=True)  # List of quality issues found
    
    # Relationships
    result = relationship("ProfilingResult", back_populates="column_profiles")
