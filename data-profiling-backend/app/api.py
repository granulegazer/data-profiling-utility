"""API Routes - CSV Profiling"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import uuid
import chardet
import os
from datetime import datetime
from pathlib import Path
from app.models import (
    JobCreate, Job, JobStatus, JobResult,
    DatasetProfile, ColumnStats
)
from app.config import settings

router = APIRouter()

# In-memory storage (replace with database later)
jobs_db = {}
results_db = {}

# Upload directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/upload", response_model=dict)
async def upload_file(file: UploadFile = File(...)):
    """Upload CSV file and detect encoding"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    # Generate unique file ID
    file_id = str(uuid.uuid4())
    
    # Create upload directory if it doesn't exist
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Save file to disk
    file_path = upload_dir / f"{file_id}_{file.filename}"
    
    # Read file content for encoding detection
    content = await file.read()
    
    # Detect file encoding
    detected = chardet.detect(content)
    encoding = detected['encoding'] if detected['encoding'] else 'UTF-8'
    
    # Save file
    with open(file_path, 'wb') as f:
        f.write(content)
    
    return {
        "file_id": file_id,
        "filename": file.filename,
        "encoding": encoding,
        "file_path": str(file_path),
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


@router.get("/preview/{file_id}")
async def preview_file(
    file_id: str,
    delimiter: str = ",",
    has_header: bool = True,
    limit: int = 5
):
    """Preview CSV file contents"""
    import csv
    
    # Find the file in uploads directory
    matching_files = [f for f in os.listdir(UPLOAD_DIR) if f.startswith(file_id)]
    
    if not matching_files:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_path = os.path.join(UPLOAD_DIR, matching_files[0])
    
    try:
        # Detect encoding
        with open(file_path, 'rb') as f:
            raw_data = f.read()
            result = chardet.detect(raw_data)
            encoding = result['encoding'] if result['encoding'] else 'utf-8'
        
        # Read CSV with detected encoding
        headers = []
        rows = []
        
        with open(file_path, 'r', encoding=encoding) as f:
            reader = csv.reader(f, delimiter=delimiter)
            
            if has_header:
                headers = next(reader, [])
            else:
                # Generate column names
                first_row = next(reader, [])
                if first_row:
                    headers = [f"Column_{i+1}" for i in range(len(first_row))]
                    rows.append(first_row)
            
            # Read up to limit rows
            for i, row in enumerate(reader):
                if i >= limit - (0 if has_header else 1):
                    break
                rows.append(row)
        
        return {
            "headers": headers,
            "rows": rows,
            "total_rows_shown": len(rows)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")
