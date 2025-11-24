"""API routes for the data profiling utility"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import json
from pathlib import Path

from ..core.database import get_db
from ..core.config import settings
from ..models.profiling import ProfilingJob, ProfilingResult, ColumnProfile
from ..connectors import OracleConnector, PostgresConnector, FileConnector, APIConnector
from ..profiling.engine import ProfilingEngine
from .schemas import (
    ProfilingJobCreate,
    ProfilingJobResponse,
    ProfilingResultResponse,
    TestConnectionRequest,
    TestConnectionResponse,
)

router = APIRouter()


def get_connector(source_type: str, config: dict):
    """Factory function to get appropriate connector"""
    connectors = {
        "oracle": OracleConnector,
        "postgres": PostgresConnector,
        "file": FileConnector,
        "api": APIConnector,
    }
    
    connector_class = connectors.get(source_type.lower())
    if not connector_class:
        raise HTTPException(status_code=400, detail=f"Unknown source type: {source_type}")
    
    return connector_class(config)


@router.post("/test-connection", response_model=TestConnectionResponse)
async def test_connection(request: TestConnectionRequest):
    """Test connection to a data source"""
    try:
        connector = get_connector(request.source_type, request.config)
        is_valid = connector.test_connection()
        
        return TestConnectionResponse(
            success=is_valid,
            message="Connection successful" if is_valid else "Connection failed"
        )
    except Exception as e:
        return TestConnectionResponse(
            success=False,
            message=f"Error testing connection: {str(e)}"
        )


@router.post("/profiling-jobs", response_model=ProfilingJobResponse)
async def create_profiling_job(
    job_request: ProfilingJobCreate,
    db: Session = Depends(get_db)
):
    """Create a new profiling job"""
    # Create job record
    job = ProfilingJob(
        job_name=job_request.job_name,
        source_type=job_request.source_type,
        source_config=job_request.source_config,
        status="pending"
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    
    # Start profiling in background (simplified - in production use Celery or similar)
    try:
        job.status = "running"
        db.commit()
        
        # Get connector and read data
        connector = get_connector(job_request.source_type, job_request.source_config)
        connector.connect()
        
        # Get table name
        table_name = job_request.table_name
        if not table_name:
            tables = connector.get_tables()
            if not tables:
                raise Exception("No tables found in data source")
            table_name = tables[0]
        
        # Read data
        df = connector.read_data(table_name, sample_size=job_request.sample_size)
        connector.disconnect()
        
        # Profile the data
        engine = ProfilingEngine()
        profile_results = engine.profile_dataframe(df, table_name)
        
        # Save results to database
        result = ProfilingResult(
            job_id=job.id,
            table_name=profile_results["table_name"],
            total_rows=profile_results["total_rows"],
            total_columns=profile_results["total_columns"]
        )
        db.add(result)
        db.commit()
        db.refresh(result)
        
        # Save column profiles
        for col_profile in profile_results["columns"]:
            column = ColumnProfile(
                result_id=result.id,
                column_name=col_profile["column_name"],
                data_type=col_profile["data_type"],
                total_count=col_profile["total_count"],
                null_count=col_profile["null_count"],
                null_percentage=col_profile["null_percentage"],
                unique_count=col_profile["unique_count"],
                unique_percentage=col_profile["unique_percentage"],
                min_value=col_profile.get("min_value"),
                max_value=col_profile.get("max_value"),
                mean_value=col_profile.get("mean_value"),
                median_value=col_profile.get("median_value"),
                std_dev=col_profile.get("std_dev"),
                min_length=col_profile.get("min_length"),
                max_length=col_profile.get("max_length"),
                avg_length=col_profile.get("avg_length"),
                top_values=col_profile.get("top_values"),
                pattern_analysis=col_profile.get("patterns"),
                quality_issues=col_profile.get("quality_issues")
            )
            db.add(column)
        
        db.commit()
        
        # Update job status
        job.status = "completed"
        db.commit()
        
    except Exception as e:
        job.status = "failed"
        job.error_message = str(e)
        db.commit()
    
    db.refresh(job)
    return job


@router.get("/profiling-jobs", response_model=List[ProfilingJobResponse])
async def list_profiling_jobs(db: Session = Depends(get_db)):
    """List all profiling jobs"""
    jobs = db.query(ProfilingJob).order_by(ProfilingJob.created_at.desc()).all()
    return jobs


@router.get("/profiling-jobs/{job_id}", response_model=ProfilingJobResponse)
async def get_profiling_job(job_id: int, db: Session = Depends(get_db)):
    """Get a specific profiling job"""
    job = db.query(ProfilingJob).filter(ProfilingJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.get("/profiling-jobs/{job_id}/results", response_model=List[ProfilingResultResponse])
async def get_profiling_results(job_id: int, db: Session = Depends(get_db)):
    """Get profiling results for a job"""
    results = db.query(ProfilingResult).filter(ProfilingResult.job_id == job_id).all()
    return results


@router.get("/profiling-results/{result_id}", response_model=ProfilingResultResponse)
async def get_profiling_result_detail(result_id: int, db: Session = Depends(get_db)):
    """Get detailed profiling result"""
    result = db.query(ProfilingResult).filter(ProfilingResult.id == result_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    return result


@router.post("/upload-file")
async def upload_file(file: UploadFile = File(...)):
    """Upload a file for profiling"""
    # Create upload directory if it doesn't exist
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Save file
    file_path = upload_dir / file.filename
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    return {
        "filename": file.filename,
        "file_path": str(file_path),
        "size": len(content)
    }


@router.delete("/profiling-jobs/{job_id}")
async def delete_profiling_job(job_id: int, db: Session = Depends(get_db)):
    """Delete a profiling job and its results"""
    job = db.query(ProfilingJob).filter(ProfilingJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    db.delete(job)
    db.commit()
    
    return {"message": "Job deleted successfully"}
