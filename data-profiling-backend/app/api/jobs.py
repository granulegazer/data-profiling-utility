"""
API Router: Job History and Management
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.job import ProfilingJob, JobStatus
from app.services.job_service import JobService

router = APIRouter()
job_service = JobService()


@router.get("/", response_model=List[ProfilingJob])
async def list_jobs(
    status: Optional[JobStatus] = Query(None, description="Filter by status"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """List profiling jobs with filters"""
    return await job_service.list_jobs(status=status, limit=limit, offset=offset)


@router.get("/{job_id}", response_model=ProfilingJob)
async def get_job(job_id: str):
    """Get job details"""
    job = await job_service.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.delete("/{job_id}", status_code=204)
async def delete_job(job_id: str):
    """Delete a job and its results"""
    success = await job_service.delete_job(job_id)
    if not success:
        raise HTTPException(status_code=404, detail="Job not found")
