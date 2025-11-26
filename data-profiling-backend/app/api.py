"""API Routes - CSV Profiling"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import uuid
from datetime import datetime
from app.models import (
    JobCreate, Job, JobStatus, JobResult,
    DatasetProfile, ColumnStats
)

router = APIRouter()

# In-memory storage (replace with database later)
jobs_db = {}
results_db = {}


@router.post("/upload", response_model=dict)
async def upload_file(file: UploadFile = File(...)):
    """Upload CSV file"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    # TODO: Save file to disk
    file_id = str(uuid.uuid4())
    
    return {
        "file_id": file_id,
        "filename": file.filename,
        "message": "File uploaded successfully"
    }


@router.post("/jobs", response_model=Job)
async def create_job(job_request: JobCreate):
    """Create a new profiling job"""
    job_id = str(uuid.uuid4())
    
    job = Job(
        job_id=job_id,
        name=job_request.name,
        description=job_request.description,
        status=JobStatus.PENDING,
        file_paths=job_request.file_paths,
        created_at=datetime.now(),
        progress=0.0
    )
    
    jobs_db[job_id] = job
    
    # TODO: Start profiling in background
    
    return job


@router.get("/jobs", response_model=List[Job])
async def list_jobs():
    """List all jobs"""
    return list(jobs_db.values())


@router.get("/jobs/{job_id}", response_model=Job)
async def get_job(job_id: str):
    """Get job by ID"""
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return jobs_db[job_id]


@router.get("/jobs/{job_id}/results", response_model=JobResult)
async def get_job_results(job_id: str):
    """Get job results"""
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job_id not in results_db:
        raise HTTPException(status_code=404, detail="Results not found")
    
    return results_db[job_id]


@router.delete("/jobs/{job_id}")
async def delete_job(job_id: str):
    """Delete a job"""
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job not found")
    
    del jobs_db[job_id]
    if job_id in results_db:
        del results_db[job_id]
    
    return {"message": "Job deleted successfully"}
