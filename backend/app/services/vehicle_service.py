from decimal import Decimal
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleCreate, VehicleUpdate


def get_vehicle_by_id(db: Session, vehicle_id: int) -> Vehicle:
    """Retrieve a vehicle by ID or raise HTTP 404."""
    vehicle = db.get(Vehicle, vehicle_id)
    if vehicle is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found",
        )
    return vehicle


def create_vehicle(db: Session, data: VehicleCreate) -> Vehicle:
    """Create a new vehicle in the inventory."""
    vehicle = Vehicle(
        make=data.make,
        model=data.model,
        category=data.category,
        price=data.price,
        quantity=data.quantity,
    )
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


def update_vehicle(db: Session, vehicle_id: int, data: VehicleUpdate) -> Vehicle:
    """Partially update an existing vehicle."""
    vehicle = get_vehicle_by_id(db, vehicle_id)
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(vehicle, field, value)
    db.commit()
    db.refresh(vehicle)
    return vehicle


def delete_vehicle(db: Session, vehicle_id: int) -> None:
    """Delete a vehicle from the inventory."""
    vehicle = get_vehicle_by_id(db, vehicle_id)
    db.delete(vehicle)
    db.commit()


def list_vehicles(
    db: Session,
    make: str | None = None,
    model: str | None = None,
    category: str | None = None,
    min_price: Decimal | None = None,
    max_price: Decimal | None = None,
    in_stock: bool | None = None,
    page: int = 1,
    page_size: int = 10,
) -> dict[str, Any]:
    """List vehicles with optional filtering and pagination (newest ID first)."""
    query = select(Vehicle)

    if make is not None and make.strip():
        query = query.where(func.lower(Vehicle.make) == make.strip().lower())
    if model is not None and model.strip():
        query = query.where(func.lower(Vehicle.model) == model.strip().lower())
    if category is not None and category.strip():
        query = query.where(func.lower(Vehicle.category) == category.strip().lower())
    if min_price is not None:
        query = query.where(Vehicle.price >= min_price)
    if max_price is not None:
        query = query.where(Vehicle.price <= max_price)
    if in_stock is True:
        query = query.where(Vehicle.quantity > 0)
    elif in_stock is False:
        query = query.where(Vehicle.quantity == 0)

    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0

    query = query.order_by(Vehicle.id.desc())
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    items = list(db.scalars(query).all())

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


def search_vehicles(
    db: Session,
    q: str,
    page: int = 1,
    page_size: int = 10,
) -> dict[str, Any]:
    """Search vehicles across make, model, and category case-insensitively."""
    cleaned_q = q.strip().lower()
    search_filter = or_(
        func.lower(Vehicle.make).contains(cleaned_q),
        func.lower(Vehicle.model).contains(cleaned_q),
        func.lower(Vehicle.category).contains(cleaned_q),
    )
    query = select(Vehicle).where(search_filter)

    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0

    query = query.order_by(Vehicle.id.desc())
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    items = list(db.scalars(query).all())

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


def purchase_vehicle(db: Session, vehicle_id: int) -> Vehicle:
    """Reduce stock by 1 for an in-stock vehicle."""
    vehicle = get_vehicle_by_id(db, vehicle_id)
    if vehicle.quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vehicle is out of stock",
        )
    vehicle.quantity -= 1
    db.commit()
    db.refresh(vehicle)
    return vehicle


def restock_vehicle(db: Session, vehicle_id: int, quantity: int) -> Vehicle:
    """Increase stock by the given positive quantity."""
    vehicle = get_vehicle_by_id(db, vehicle_id)
    vehicle.quantity += quantity
    db.commit()
    db.refresh(vehicle)
    return vehicle

