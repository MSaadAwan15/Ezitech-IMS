
import json
import random
from datetime import datetime, timedelta, timezone

asset_templates = [
    ("Dell Latitude 5440", "Laptop"),
    ("HP ProBook 450", "Laptop"),
    ("Lenovo ThinkPad E14", "Laptop"),
    ("Dell XPS 15", "Laptop"),
    ("HP EliteBook 840", "Laptop"),

    ("Samsung Galaxy S24", "Mobile"),
    ("Apple iPhone 15", "Mobile"),
    ("Samsung Galaxy A54", "Mobile"),
    ("Apple iPhone 14", "Mobile"),
    ("Google Pixel 8", "Mobile"),

    ("HP LaserJet Pro M404", "Printer"),
    ("Epson EcoTank L3250", "Printer"),
    ("Canon PIXMA G3010", "Printer"),
    ("Canon PIXMA G34010", "Printer"),
    ("HP Pro 9025", "Printer"),

    ("Dell OptiPlex 7010", "Desktop"),
    ("HP EliteDesk 800", "Desktop"),
    ("Lenovo ThinkCentre M70", "Desktop"),
    ("Dell Precision 3660", "Desktop"),
    ("HP ProDesk 400", "Desktop")
]

statuses = [
    "Available",
    "Assigned",
    "Under Maintenance",
    "Retired"
]

assets = []


for i, (name, category) in enumerate(asset_templates, start=1):

    last_updated = datetime.now(timezone.utc) - timedelta(
        days=random.randint(0, 180)
    )

    asset = {
        "id": f"AST-{i:04d}",
        "name": name,
        "category": category,
        "status": random.choice(statuses),
        "last_updated": last_updated.replace(
            microsecond=0
        ).isoformat().replace("+00:00", "Z")
    }

    assets.append(asset)

# Save data in JSON file
with open("sample_assets.json", "w", encoding="utf-8") as file:
    json.dump(assets, file, indent=4)

print("Successfully generated 20 sample assets!")
