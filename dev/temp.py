import os
import json
from glob import glob

# Paths for hero icons and cards
hero_card_paths = r"D:/Projects/Top-Heroes-Calc/php/static/images/hero_cards"
hero_icon_paths = r"D:/Projects/Top-Heroes-Calc/php/static/images/hero_icons"

# Base JSON directory
json_folder = r"D:/Projects/Top-Heroes-Calc/data/facts"

# Build mapping of hero names to paths for cards and icons
hero_cards = {
    os.path.splitext(os.path.basename(path))[0].lower(): f"/static/images/hero_cards/{os.path.basename(path)}"
    for path in glob(f"{hero_card_paths}/*.webp")
}

hero_icons = {
    os.path.splitext(os.path.basename(path))[0].lower(): f"/static/images/hero_icons/{os.path.basename(path)}"
    for path in glob(f"{hero_icon_paths}/*.webp") + glob(f"{hero_icon_paths}/*.png")
}

# Update each JSON file
for json_file in glob(f"{json_folder}/*.json"):
    hero_name = os.path.splitext(os.path.basename(json_file))[0].lower()

    # Determine paths for icon and card
    card_path = hero_cards.get(hero_name, None)
    icon_path = hero_icons.get(hero_name, None)

    # Load the JSON file
    if os.path.exists(json_file):
        with open(json_file, 'r') as file:
            hero_data = json.load(file)

        # Add 'icon' and 'card' keys
        hero_data['card'] = card_path
        hero_data['icon'] = icon_path

        # Save the updated JSON file
        with open(json_file, 'w') as file:
            json.dump(hero_data, file, indent=4)

        print(f"Updated {json_file} with icon: {icon_path}, card: {card_path}")
    else:
        print(f"JSON file not found: {json_file}")
