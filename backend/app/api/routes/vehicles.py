"""Vehicle API routes."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleCreate, VehicleResponse, VehicleUpdate
from app.api.dependencies import require_permission
import json

# Router with authentication for regular operations
router = APIRouter(dependencies=[Depends(require_permission("fleet:view"))])

# Router without authentication for bulk import
bulk_router = APIRouter()


@router.post("/", response_model=VehicleResponse)
async def create_vehicle(vehicle: VehicleCreate, db: Session = Depends(get_db)):
    """Create a new vehicle."""
    # Check if vehicle ID already exists
    db_vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle.vehicle_id).first()
    if db_vehicle:
        raise HTTPException(status_code=400, detail="Vehicle ID already exists")
    
    # Create new vehicle
    db_vehicle = Vehicle(**vehicle.dict())
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    
    return db_vehicle


@router.get("/", response_model=List[VehicleResponse])
async def get_vehicles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all vehicles."""
    vehicles = db.query(Vehicle).offset(skip).limit(limit).all()
    return vehicles


@router.get("/{vehicle_id}", response_model=VehicleResponse)
async def get_vehicle(vehicle_id: str, db: Session = Depends(get_db)):
    """Get a specific vehicle by ID."""
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


@router.put("/{vehicle_id}", response_model=VehicleResponse)
async def update_vehicle(vehicle_id: str, vehicle_update: VehicleUpdate, db: Session = Depends(get_db)):
    """Update a vehicle."""
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    # Update vehicle fields
    update_data = vehicle_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(vehicle, field, value)
    
    db.commit()
    db.refresh(vehicle)
    
    return vehicle


@router.delete("/{vehicle_id}")
async def delete_vehicle(vehicle_id: str, db: Session = Depends(get_db)):
    """Delete a vehicle."""
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    db.delete(vehicle)
    db.commit()


@bulk_router.post("/import-bulk")
async def import_vehicles_bulk(data: List[dict], db: Session = Depends(get_db)):
    """Import vehicles from JSON data (no auth required for testing)."""
    results = {
        "imported": 0,
        "skipped": 0,
        "errors": []
    }
    
    for item in data:
        try:
            # Skip empty rows
            if not item.get("A") or not item.get("B"):
                results["skipped"] += 1
                continue
            
            # Extract data from JSON structure
            sr_no = item.get("A", "").strip()
            vehicle_id = item.get("B", "").strip()
            user = item.get("C", "").strip()
            
            # Skip header row or empty vehicle_id
            if vehicle_id.lower() in ["vehicle", ""] or sr_no == "Sr.\nNo":
                results["skipped"] += 1
                continue
            
            # Check if vehicle already exists
            existing_vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle_id).first()
            if existing_vehicle:
                results["skipped"] += 1
                continue
            
            # Create vehicle with default values
            vehicle = Vehicle(
                vehicle_id=vehicle_id,
                vehicle_type="Motorcycle" if "motorcycle" in user.lower() else "Car",
                category="Pool" if "pool" in user.lower() else "Assigned",
                make_model="Imported Vehicle",
                license_plate=vehicle_id,
                year=2024,  # Default year
                status="Active" if "not in use" not in user.lower() else "Inactive",
                compliance="Compliant",
                government_permit="Standard"
            )
            
            db.add(vehicle)
            db.commit()
            results["imported"] += 1
            
        except Exception as e:
            results["errors"].append(f"Error importing {item.get('B', 'unknown')}: {str(e)}")
            db.rollback()
    
    return results


@router.post("/import")
async def import_vehicles(data: List[dict], db: Session = Depends(get_db)):
    """Import vehicles from JSON data."""
    results = {
        "imported": 0,
        "skipped": 0,
        "errors": []
    }
    
    for item in data:
        try:
            # Skip empty rows
            if not item.get("A") or not item.get("B"):
                results["skipped"] += 1
                continue
            
            # Extract data from JSON structure
            sr_no = item.get("A", "").strip()
            vehicle_id = item.get("B", "").strip()
            user = item.get("C", "").strip()
            
            # Skip header row or empty vehicle_id
            if vehicle_id.lower() in ["vehicle", ""] or sr_no == "Sr.\nNo":
                results["skipped"] += 1
                continue
            
            # Check if vehicle already exists
            existing_vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle_id).first()
            if existing_vehicle:
                results["skipped"] += 1
                continue
            
            # Create vehicle with default values
            vehicle = Vehicle(
                vehicle_id=vehicle_id,
                vehicle_type="Motorcycle" if "motorcycle" in user.lower() else "Car",
                category="Pool" if "pool" in user.lower() else "Assigned",
                make_model="Imported Vehicle",
                license_plate=vehicle_id,
                year=2024,  # Default year
                status="Active" if "not in use" not in user.lower() else "Inactive",
                compliance="Compliant",
                government_permit="Standard"
            )
            
            db.add(vehicle)
            db.commit()
            results["imported"] += 1
            
        except Exception as e:
            results["errors"].append(f"Error importing {item.get('B', 'unknown')}: {str(e)}")
            db.rollback()
    
    return results
