"""
API Router: Profiling Results
"""

from fastapi import APIRouter, HTTPException
from typing import List
from app.models.dataset import DatasetProfile, EntityProfile
from app.models.profiling_result import ProfilingResult
from app.services.results_service import ResultsService

router = APIRouter()
results_service = ResultsService()


@router.get("/dataset/{job_id}", response_model=DatasetProfile)
async def get_dataset_profile(job_id: str):
    """Get dataset-level profile summary"""
    profile = await results_service.get_dataset_profile(job_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Dataset profile not found")
    return profile


@router.get("/dataset/{job_id}/entities", response_model=List[EntityProfile])
async def get_entity_list(job_id: str):
    """Get list of entity profiles for a dataset"""
    entities = await results_service.get_entity_list(job_id)
    return entities


@router.get("/entity/{entity_profile_id}", response_model=ProfilingResult)
async def get_entity_profile(entity_profile_id: str):
    """Get detailed entity profiling results"""
    result = await results_service.get_entity_profile(entity_profile_id)
    if not result:
        raise HTTPException(status_code=404, detail="Entity profile not found")
    return result


@router.get("/entity/{entity_profile_id}/export")
async def export_entity_profile(entity_profile_id: str, format: str = "json"):
    """Export entity profile in various formats"""
    # TODO: Implement export logic
    pass
