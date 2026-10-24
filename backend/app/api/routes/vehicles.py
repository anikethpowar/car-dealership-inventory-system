from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_admin
from app.db.database import get_db
from app.models.user import User
from app.schemas.vehicle import (
    RestockRequest,
    VehicleCreate,
    VehicleListResponse,
    VehicleResponse,
    VehicleUpdate,
)
from app.services.vehicle_service import (
    create_vehicle,
    delete_vehicle,
    get_vehicle_by_id,
    list_vehicles,
    purchase_vehicle,
    restock_vehicle,
    search_vehicles,
    update_vehicle,
)

router = APIRouter(prefix="/api/vehicles", tags=["Vehicles"])


@router.post(
    "",
    response_model=VehicleResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    data: VehicleCreate,
    db: Annotated[Session, Depends(get_db)],
    admin: Annotated[User, Depends(require_admin)],
) -> VehicleResponse:
    """Create a new vehicle (Admin only)."""
    return create_vehicle(db=db, data=data)


@router.get(
    "",
    response_model=VehicleListResponse,
    status_code=status.HTTP_200_OK,
)
def list_all(
    db: Annotated[Session, Depends(get_db)],
    make: str | None = None,
    model: str | None = None,
    category: str | None = None,
    min_price: Decimal | None = None,
    max_price: Decimal | None = None,
    in_stock: bool | None = None,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 10,
) -> VehicleListResponse:
    """List vehicles with optional filtering and pagination (Public)."""
    return list_vehicles(
        db=db,
        make=make,
        model=model,
        category=category,
        min_price=min_price,
        max_price=max_price,
        in_stock=in_stock,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/search",
    response_model=VehicleListResponse,
    status_code=status.HTTP_200_OK,
)
def search(
    q: Annotated[str, Query(min_length=1)],
    db: Annotated[Session, Depends(get_db)],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 10,
) -> VehicleListResponse:
    """Search vehicles across make, model, and category case-insensitively (Public)."""
    if not q.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Query parameter 'q' must contain at least one non-whitespace character",
        )
    return search_vehicles(db=db, q=q, page=page, page_size=page_size)


@router.get(
    "/{vehicle_id}",
    response_model=VehicleResponse,
    status_code=status.HTTP_200_OK,
)
def get_one(
    vehicle_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> VehicleResponse:
    """Get a single vehicle by ID (Public)."""
    return get_vehicle_by_id(db=db, vehicle_id=vehicle_id)


@router.put(
    "/{vehicle_id}",
    response_model=VehicleResponse,
    status_code=status.HTTP_200_OK,
)
def update(
    vehicle_id: int,
    data: VehicleUpdate,
    db: Annotated[Session, Depends(get_db)],
    admin: Annotated[User, Depends(require_admin)],
) -> VehicleResponse:
    """Partially update a vehicle (Admin only)."""
    return update_vehicle(db=db, vehicle_id=vehicle_id, data=data)


@router.delete(
    "/{vehicle_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def delete(
    vehicle_id: int,
    db: Annotated[Session, Depends(get_db)],
    admin: Annotated[User, Depends(require_admin)],
) -> Response:
    """Delete a vehicle (Admin only)."""
    delete_vehicle(db=db, vehicle_id=vehicle_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/{vehicle_id}/purchase",
    response_model=VehicleResponse,
    status_code=status.HTTP_200_OK,
)
def purchase(
    vehicle_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> VehicleResponse:
    """Purchase a vehicle, reducing stock by 1 (Authenticated user)."""
    return purchase_vehicle(db=db, vehicle_id=vehicle_id)


@router.post(
    "/{vehicle_id}/restock",
    response_model=VehicleResponse,
    status_code=status.HTTP_200_OK,
)
def restock(
    vehicle_id: int,
    data: RestockRequest,
    db: Annotated[Session, Depends(get_db)],
    admin: Annotated[User, Depends(require_admin)],
) -> VehicleResponse:
    """Restock a vehicle by increasing stock (Admin only)."""
    return restock_vehicle(db=db, vehicle_id=vehicle_id, quantity=data.quantity)

