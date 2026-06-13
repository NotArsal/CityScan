DEPARTMENT_MAP = {
    "pothole": "Roads & Infrastructure",
    "potholes": "Roads & Infrastructure",
    "road_damage": "Roads & Infrastructure",
    "road": "Roads & Infrastructure",
    "garbage": "Sanitation & Waste Management",
    "water_leak": "Water Supply Department",
    "water": "Water Supply Department",
    "waterlogging": "Drainage & Sewerage Department",
    "broken_streetlight": "Electrical Department",
    "streetlight": "Electrical Department",
    "other": "General Administration"
}

def get_department_for_category(category: str) -> str:
    cat_lower = category.lower().strip()
    return DEPARTMENT_MAP.get(cat_lower, "General Administration")
