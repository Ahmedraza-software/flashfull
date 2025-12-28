# Vehicle Import Instructions

## Method 1: Using Python Script

1. Save your JSON data to a file (e.g., `vehicles.json`)
2. Run the import script:
   ```bash
   cd "c:\Users\ahmed\Desktop\kiro - Copy\erp"
   python import_vehicles.py "c:\Users\ahmed\Downloads\convertcsv (2).json"
   ```

## Method 2: Using curl Command

```bash
curl -X POST http://localhost:8000/api/vehicles/import \
  -H "Content-Type: application/json" \
  -d @'c:\Users\ahmed\Downloads\convertcsv (2).json'
```

## Method 3: Using PowerShell

```powershell
$jsonData = Get-Content 'c:\Users\ahmed\Downloads\convertcsv (2).json' | ConvertFrom-Json
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/vehicles/import" -Method POST -Body ($jsonData | ConvertTo-Json -Depth 10) -ContentType "application/json"
$response
```

## Expected Output

The import will:
- Import vehicles with vehicle_id from column "B"
- Skip duplicate vehicles (already in database)
- Skip empty rows and header row
- Set vehicle type based on user description
- Set status to "Inactive" for "Not in use" entries

## Data Mapping

| JSON Field | Database Field | Notes |
|------------|----------------|-------|
| A (Sr. No) | - | Used for skipping header |
| B (Vehicle) | vehicle_id | License plate number |
| C (User) | vehicle_type, category, status | Determines type and status |

## Example Response

```json
{
  "imported": 10,
  "skipped": 3,
  "errors": []
}
```
