"""API Routes - CSV Profiling"""

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
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
from app.profiler import CSVProfiler

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


def run_profiling_job(job_id: str, job_request: JobCreate):
    """Background task to run profiling"""
    try:
        # Update job status to running
        jobs_db[job_id].status = JobStatus.RUNNING
        jobs_db[job_id].started_at = datetime.now()
        jobs_db[job_id].progress = 0.0
        
        # Create profiler with rulesets
        profiler = CSVProfiler(
            csv_config=job_request.csv_config,
            rulesets=job_request.rulesets,
            sample_size=job_request.sample_size,
            selected_columns=job_request.selected_columns
        )
        
        # Find actual file paths
        file_paths = []
        for file_id in job_request.file_paths:
            matching_files = [f for f in os.listdir(UPLOAD_DIR) if f.startswith(file_id)]
            if matching_files:
                file_paths.append(UPLOAD_DIR / matching_files[0])
        
        # Profile all CSV files
        datasets = profiler.profile_multiple_csvs(file_paths)
        
        # Calculate totals
        total_rows = sum(d.row_count for d in datasets)
        total_columns = sum(d.column_count for d in datasets)
        
        # Store results
        result = JobResult(
            job_id=job_id,
            job_name=job_request.name,
            status=JobStatus.COMPLETED,
            datasets=datasets,
            total_rows=total_rows,
            total_columns=total_columns,
            completed_at=datetime.now()
        )
        results_db[job_id] = result
        
        # Update job status
        jobs_db[job_id].status = JobStatus.COMPLETED
        jobs_db[job_id].completed_at = datetime.now()
        jobs_db[job_id].progress = 100.0
        
    except Exception as e:
        # Handle errors
        jobs_db[job_id].status = JobStatus.FAILED
        jobs_db[job_id].error_message = str(e)
        jobs_db[job_id].completed_at = datetime.now()
        print(f"Job {job_id} failed: {e}")


@router.post("/jobs", response_model=Job)
async def create_job(job_request: JobCreate, background_tasks: BackgroundTasks):
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
    
    # Start profiling in background
    background_tasks.add_task(run_profiling_job, job_id, job_request)
    
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
