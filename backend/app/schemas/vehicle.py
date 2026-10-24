from datetime import datetime
from decimal import Decimal
from typing import Any, Self

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


def _strip_string(v: Any) -> Any:
    if v is not None:
        if isinstance(v, str):
            v = v.strip()
            if not v:
                raise ValueError("Must contain at least one non-whitespace character")
        else:
            raise ValueError("Field must be a string")
    return v


class VehicleCreate(BaseModel):
    make: str = Field(min_length=1)
    model: str = Field(min_length=1)
    category: str = Field(min_length=1)
    price: Decimal = Field(gt=0)
    quantity: int = Field(default=0, ge=0)

    @field_validator("make", "model", "category", mode="before")
    @classmethod
    def strip_text_fields(cls, v: Any) -> Any:
        return _strip_string(v)


class VehicleUpdate(BaseModel):
    make: str | None = None
    model: str | None = None
    category: str | None = None
    price: Decimal | None = Field(default=None, gt=0)
    quantity: int | None = Field(default=None, ge=0)

    @field_validator("make", "model", "category", mode="before")
    @classmethod
    def strip_text_fields(cls, v: Any) -> Any:
        return _strip_string(v)

    @model_validator(mode="after")
    def validate_non_empty_update(self) -> Self:
        fields = [self.make, self.model, self.category, self.price, self.quantity]
        if all(val is None for val in fields):
            raise ValueError("At least one field must be provided for update")
        return self


class VehicleResponse(BaseModel):
    id: int
    make: str
    model: str
    category: str
    price: Decimal
    quantity: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class VehicleListResponse(BaseModel):
    items: list[VehicleResponse]
    total: int
    page: int
    page_size: int


class RestockRequest(BaseModel):
    quantity: int = Field(gt=0)

