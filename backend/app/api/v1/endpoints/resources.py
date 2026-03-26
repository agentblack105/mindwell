from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Any
import uuid

from app.db.session import get_db
from app.api.admin_deps import get_current_admin
from app.schemas.resource import ResourceCreate, ResourceUpdate, ResourceResponse
from app.models.resource import Resource

router = APIRouter()


@router.get("", response_model=list[ResourceResponse])
async def list_resources(
    state: str | None = None,
    type: str | None = None,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Public endpoint to list verified resources. Filter by ?state= and/or ?type="""
    query = select(Resource).where(Resource.verified == True)
    if state:
        query = query.where(Resource.state == state)
    if type:
        query = query.where(Resource.type == type)
    result = await db.execute(query.order_by(Resource.name))
    return result.scalars().all()


@router.post("", response_model=ResourceResponse, status_code=status.HTTP_201_CREATED)
async def create_resource(
    resource_in: ResourceCreate,
    db: AsyncSession = Depends(get_db),
    admin: str = Depends(get_current_admin),
) -> Any:
    """Admin-only: Create a new resource."""
    resource = Resource(**resource_in.model_dump())
    db.add(resource)
    await db.commit()
    await db.refresh(resource)
    return resource


@router.put("/{resource_id}", response_model=ResourceResponse)
async def update_resource(
    resource_id: uuid.UUID,
    resource_in: ResourceUpdate,
    db: AsyncSession = Depends(get_db),
    admin: str = Depends(get_current_admin),
) -> Any:
    """Admin-only: Update an existing resource (partial updates supported)."""
    result = await db.execute(select(Resource).where(Resource.id == resource_id))
    resource = result.scalar_one_or_none()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    update_data = resource_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(resource, field, value)

    await db.commit()
    await db.refresh(resource)
    return resource


@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resource(
    resource_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    """Admin-only: Delete a resource."""
    result = await db.execute(select(Resource).where(Resource.id == resource_id))
    resource = result.scalar_one_or_none()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    await db.delete(resource)
    await db.commit()
    return None
