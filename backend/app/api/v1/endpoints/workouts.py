import csv
from datetime import datetime, timedelta
from io import StringIO
from typing import List, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, func, extract
from app.api import deps
from app.crud import workout as crud_workout
from app.schemas.workout import Workout, WorkoutCreate, WorkoutList, WorkoutSummary
from app.core.config import settings

router = APIRouter()

def parse_date(date_str: str) -> datetime:
    """Try multiple date formats to parse the date string."""
    # First, normalize the month abbreviations
    month_mappings = {
        'Jan.': 'Jan', 'Feb.': 'Feb', 'Mar.': 'Mar', 'Apr.': 'Apr',
        'Jun.': 'Jun', 'Jul.': 'Jul', 'Aug.': 'Aug', 'Sept.': 'Sep',
        'Oct.': 'Oct', 'Nov.': 'Nov', 'Dec.': 'Dec',
        'September': 'Sep', 'October': 'Oct', 'November': 'Nov', 'December': 'Dec',
        'January': 'Jan', 'February': 'Feb', 'March': 'Mar', 'April': 'Apr',
        'June': 'Jun', 'July': 'Jul', 'August': 'Aug'
    }
    
    # Remove any extra spaces and normalize the date string
    date_str = ' '.join(date_str.split())  # Normalize spaces
    
    # Replace month names with standard abbreviations
    for month, abbr in month_mappings.items():
        if month in date_str:
            date_str = date_str.replace(month, abbr)
            break
    
    # Special case for "Sept" -> "Sep"
    date_str = date_str.replace('Sept', 'Sep')
    
    date_formats = [
        '%Y-%m-%d %H:%M:%S',  # 2024-12-04 15:30:00
        '%b %d, %Y',          # Sep 26, 2024
        '%Y-%m-%d',           # 2024-12-04
        '%m/%d/%Y',           # 12/4/2024
        '%d/%m/%Y',           # 4/12/2024
    ]
    
    for date_format in date_formats:
        try:
            return datetime.strptime(date_str, date_format)
        except ValueError:
            continue
    
    raise ValueError(f"Could not parse date: {date_str}")

def safe_int(value: str, allow_null: bool = False, treat_zero_as_null: bool = False) -> int | None:
    """Convert string to int, handling empty strings and floats.
    
    Args:
        value: The string value to convert
        allow_null: Whether to return None for empty/invalid values instead of 0
        treat_zero_as_null: Whether to treat 0 values as null (useful for measurements that can't be 0)
    """
    if not value or value.strip() == '':
        return None if allow_null else 0
    try:
        result = int(float(value))
        if treat_zero_as_null and result == 0:
            return None
        return result
    except (ValueError, TypeError):
        return None if allow_null else 0

def safe_float(value: str, allow_null: bool = False) -> float | None:
    """Convert string to float, handling empty strings."""
    if not value or value.strip() == '':
        return None if allow_null else 0.0
    try:
        return float(value)
    except (ValueError, TypeError):
        return None if allow_null else 0.0

@router.post("/upload-csv", response_model=List[Workout])
async def upload_csv(
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user_id: int = Depends(deps.get_current_user_id),
):
    """
    Upload workouts from a MapMyRun CSV export file.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    # Read the CSV file
    contents = await file.read()
    csv_text = contents.decode()
    csv_file = StringIO(csv_text)
    reader = csv.DictReader(csv_file)

    # Verify required columns are present
    required_columns = {
        'Workout Date',
        'Activity Type',
        'Calories Burned (kCal)',
        'Distance (mi)',
        'Workout Time (seconds)',
        'Avg Pace (min/mi)',
        'Max Pace (min/mi)',
        'Avg Speed (mi/h)',
        'Max Speed (mi/h)',
        'Source',
        'Link'
    }
    
    optional_columns = {
        'Avg Heart Rate',
        'Steps',
        'Notes'
    }
    
    missing_columns = required_columns - set(reader.fieldnames or [])
    if missing_columns:
        raise HTTPException(
            status_code=400,
            detail=f"CSV file is missing required columns: {', '.join(missing_columns)}"
        )

    workouts = []
    for row in reader:
        try:
            workout = WorkoutCreate(
                workout_date=parse_date(row['Workout Date']),
                activity_type=row['Activity Type'],
                calories_burned=safe_int(row['Calories Burned (kCal)']),
                distance_mi=safe_float(row['Distance (mi)']),
                workout_time_seconds=safe_int(row['Workout Time (seconds)']),
                avg_pace_min_mi=safe_float(row['Avg Pace (min/mi)']),
                max_pace_min_mi=safe_float(row['Max Pace (min/mi)']),
                avg_speed_mph=safe_float(row['Avg Speed (mi/h)']),
                max_speed_mph=safe_float(row['Max Speed (mi/h)']),
                avg_heart_rate=safe_int(row.get('Avg Heart Rate', ''), allow_null=True, treat_zero_as_null=True),
                steps=safe_int(row.get('Steps', ''), allow_null=True),
                notes=row.get('Notes', '').strip("b''"),
                source=row['Source'],
                external_link=row['Link']
            )
            workouts.append(workout)
        except (ValueError, KeyError) as e:
            raise HTTPException(
                status_code=400,
                detail=f"Error processing row: {row}. Error: {str(e)}"
            )

    # Bulk create workouts
    db_workouts = crud_workout.create_workouts_bulk(db, workouts, current_user_id)
    return db_workouts

@router.get("/", response_model=WorkoutList)
def get_workouts(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    sort_by: Optional[str] = Query(None, regex="^(workout_date|activity_type|distance_mi|avg_pace_min_mi|calories_burned|avg_heart_rate|steps)$"),
    sort_order: Optional[str] = Query("desc", regex="^(asc|desc)$"),
    activity_type: Optional[str] = None,
    db: Session = Depends(deps.get_db),
    current_user_id: int = Depends(deps.get_current_user_id),
):
    """
    Retrieve workouts for the current user with pagination, sorting, and filtering.
    """
    workouts, total = crud_workout.get_workouts_by_user(
        db,
        user_id=current_user_id,
        skip=skip,
        limit=limit,
        sort_by=sort_by,
        sort_order=sort_order,
        activity_type=activity_type
    )
    return {"items": workouts, "total": total}

@router.get("/{workout_id}", response_model=Workout)
def get_workout(
    workout_id: int,
    db: Session = Depends(deps.get_db),
    current_user_id: int = Depends(deps.get_current_user_id),
):
    """
    Get a specific workout by ID.
    """
    workout = crud_workout.get_workout(db, workout_id)
    if not workout or workout.user_id != current_user_id:
        raise HTTPException(status_code=404, detail="Workout not found")
    return workout 

@router.get("/analytics/summary", response_model=WorkoutSummary)
def get_workout_summary(
    days: int = Query(..., ge=-1),  # -1 means all time, but now required
    start_date: datetime = Query(None),
    end_date: datetime = Query(None),
    db: Session = Depends(deps.get_db),
    current_user_id: int = Depends(deps.get_current_user_id),
):
    """
    Get workout summary statistics for the dashboard.
    Can filter by either:
    - days (positive number for last N days, -1 for all time)
    - start_date and end_date for custom range
    """
    # Handle custom date range
    if start_date and end_date:
        if days != -1:
            raise HTTPException(
                status_code=400,
                detail="Cannot specify both days and date range"
            )
    # Handle days parameter
    elif days >= 0:
        # Use end of current day to include all workouts
        end_date = datetime.utcnow().replace(hour=23, minute=59, second=59, microsecond=999999)
        # Use start of day days ago
        start_date = (end_date - timedelta(days=days)).replace(hour=0, minute=0, second=0, microsecond=0)
    # Handle all time case
    else:  # days == -1
        start_date = None
        end_date = None

    # Get workouts in date range
    workouts = crud_workout.get_workouts_in_date_range(
        db,
        user_id=current_user_id,
        start_date=start_date,
        end_date=end_date
    )

    # Debug logging
    print(f"Date range: {start_date} to {end_date}")
    print(f"Found {len(workouts)} workouts")
    
    # Filter runs
    runs = [w for w in workouts if w.activity_type in ["Run", "Running"]]
    print(f"Found {len(runs)} runs")
    
    total_runs = len(runs)
    
    if not runs:
        return {
            "total_runs": 0,
            "total_distance": 0,
            "avg_distance": 0,
            "longest_run": 0,
            "best_pace": None,
            "avg_pace": None,
            "total_time": 0,
            "weekly_mileage": [],
            "recent_achievements": [],
            "pace_zones": {"easy": 0, "moderate": 0, "tempo": 0}
        }
    
    # Calculate stats
    total_distance = sum(r.distance_mi for r in runs)
    avg_distance = total_distance / total_runs if total_runs > 0 else 0
    longest_run = max(r.distance_mi for r in runs)
    best_pace = min((r.avg_pace_min_mi for r in runs if r.avg_pace_min_mi), default=None)
    avg_pace = sum(r.avg_pace_min_mi for r in runs if r.avg_pace_min_mi) / len([r for r in runs if r.avg_pace_min_mi]) if runs else None
    total_time = sum(r.workout_time_seconds for r in runs)
    
    # Calculate weekly mileage
    weekly_mileage = {}
    for run in runs:
        week_start = run.workout_date.date() - timedelta(days=run.workout_date.weekday())
        weekly_mileage[week_start] = weekly_mileage.get(week_start, 0) + run.distance_mi
    
    weekly_mileage = [
        {"week": str(week), "distance": distance}
        for week, distance in sorted(weekly_mileage.items())
    ]
    
    # Find recent achievements
    recent_achievements = []
    longest_run_workout = max(runs, key=lambda r: r.distance_mi)
    if longest_run_workout:
        recent_achievements.append({
            "type": "Longest Run",
            "value": f"{longest_run_workout.distance_mi:.2f} miles",
            "date": str(longest_run_workout.workout_date.date())
        })
    
    best_pace_workout = min((r for r in runs if r.avg_pace_min_mi), key=lambda r: r.avg_pace_min_mi, default=None)
    if best_pace_workout:
        recent_achievements.append({
            "type": "Best Pace",
            "value": f"{best_pace_workout.avg_pace_min_mi:.2f} min/mi",
            "date": str(best_pace_workout.workout_date.date())
        })
    
    # Calculate pace zones
    pace_zones = {"easy": 0, "moderate": 0, "tempo": 0}
    if avg_pace is not None:
        for run in runs:
            if run.avg_pace_min_mi is None:
                continue
            if run.avg_pace_min_mi > avg_pace * 1.1:
                pace_zones["easy"] += 1
            elif run.avg_pace_min_mi <= avg_pace * 0.9:
                pace_zones["tempo"] += 1
            else:
                pace_zones["moderate"] += 1
    
    return {
        "total_runs": total_runs,
        "total_distance": total_distance,
        "avg_distance": avg_distance,
        "longest_run": longest_run,
        "best_pace": best_pace,
        "avg_pace": avg_pace,
        "total_time": total_time,
        "weekly_mileage": weekly_mileage,
        "recent_achievements": recent_achievements,
        "pace_zones": pace_zones
    }

@router.get("/analytics/trends", response_model=Dict)
def get_workout_trends(
    metric: str = Query(..., regex="^(distance|pace|time)$"),
    group_by: str = Query(..., regex="^(day|week|month)$"),
    days: int = Query(..., ge=-1),  # -1 means all time, but now required
    start_date: datetime = Query(None),
    end_date: datetime = Query(None),
    db: Session = Depends(deps.get_db),
    current_user_id: int = Depends(deps.get_current_user_id),
):
    """
    Get trending data for specific metrics.
    Can filter by either:
    - days (positive number for last N days, -1 for all time)
    - start_date and end_date for custom range
    """
    # Handle custom date range
    if start_date and end_date:
        if days != -1:
            raise HTTPException(
                status_code=400,
                detail="Cannot specify both days and date range"
            )
    # Handle days parameter
    elif days >= 0:
        # Use end of current day to include all workouts
        end_date = datetime.utcnow().replace(hour=23, minute=59, second=59, microsecond=999999)
        # Use start of day days ago
        start_date = (end_date - timedelta(days=days)).replace(hour=0, minute=0, second=0, microsecond=0)
    # Handle all time case
    else:  # days == -1
        start_date = None
        end_date = None

    # Get workouts in date range
    workouts = crud_workout.get_workouts_in_date_range(
        db,
        user_id=current_user_id,
        start_date=start_date,
        end_date=end_date
    )

    # Debug logging
    print(f"Trends date range: {start_date} to {end_date}")
    print(f"Found {len(workouts)} workouts")
    
    # Filter runs
    runs = [w for w in workouts if w.activity_type in ["Run", "Running"]]
    
    # Group data by period
    grouped_data = {}
    for run in runs:
        if group_by == 'day':
            period = run.workout_date.date()
        elif group_by == 'week':
            period = run.workout_date.date() - timedelta(days=run.workout_date.weekday())
        else:  # month
            period = run.workout_date.date().replace(day=1)
        
        if period not in grouped_data:
            grouped_data[period] = []
        grouped_data[period].append(run)
    
    # Calculate metric values for each period
    trend_data = []
    for period in sorted(grouped_data.keys()):
        period_runs = grouped_data[period]
        if metric == 'distance':
            value = sum(r.distance_mi for r in period_runs)
        elif metric == 'pace':
            paces = [r.avg_pace_min_mi for r in period_runs if r.avg_pace_min_mi is not None]
            value = sum(paces) / len(paces) if paces else None
        else:  # time
            value = sum(r.workout_time_seconds for r in period_runs)
        
        if value is not None:
            trend_data.append({
                'period': period.strftime('%Y-%m-%d'),
                'value': float(value)
            })
    
    return {
        'metric': metric,
        'group_by': group_by,
        'data': trend_data
    } 