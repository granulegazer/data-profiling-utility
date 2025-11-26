"""
API Router: Profiling Job Management
"""

from fastapi import APIRouter, HTTPException, status
from app.models.job import JobCreate, JobResponse, JobProgress
from app.services.profiling_service import ProfilingService

router = APIRouter()
profiling_service = ProfilingService()


@router.post("/start", response_model=JobResponse, status_code=status.HTTP_202_ACCEPTED)
async def start_profiling_job(job_request: JobCreate):
    """Start a new profiling job"""
    try:
        job = await profiling_service.create_job(job_request)
        # Start job asynchronously
        await profiling_service.start_job(job.job_id)
        return JobResponse(
            job_id=job.job_id,
            status=job.status,
            progress_percentage=0.0,
            total_entities=job.total_entities,
            completed_entities=0
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{job_id}/progress", response_model=JobProgress)
async def get_job_progress(job_id: str):
    """Get real-time job progress"""
    progress = await profiling_service.get_job_progress(job_id)
    if not progress:
        raise HTTPException(status_code=404, detail="Job not found")
    return progress


@router.post("/{job_id}/cancel", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_job(job_id: str):
    """Cancel a running job"""
    success = await profiling_service.cancel_job(job_id)
    if not success:
        raise HTTPException(status_code=404, detail="Job not found or already completed")
