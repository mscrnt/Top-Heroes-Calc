import os
import json

# Define constants
HEROES_FILE = './heroes.txt'
FACTS_DIR = r'D:/Projects/Top-Heroes-Calc/data/facts'

# Create the attack_hp_values template
def generate_attack_hp_values():
    return {f"level_{i}": {"attack": None, "hp": None} for i in range(1, 233)}

# Define default roles and factions (you can customize this)
DEFAULT_ROLES = []
DEFAULT_FACTION = ""
CARD_LOCATION = ""
ICON_LOCATION = ""

# Function to generate a JSON object for a hero
def generate_hero_json(hero_name):
    return {
        "name": hero_name,  # Use the name as is (with spaces)
        "roles": DEFAULT_ROLES,
        "faction": DEFAULT_FACTION,
        "card_location": CARD_LOCATION,
        "icon_location": ICON_LOCATION,
        "attack_hp_values": generate_attack_hp_values()
    }

# Main function
def main():
    # Ensure the facts directory exists
    os.makedirs(FACTS_DIR, exist_ok=True)

    # Read hero names from the file
    try:
        with open(HEROES_FILE, 'r') as file:
            heroes = [line.strip() for line in file.readlines() if line.strip()]
    except FileNotFoundError:
        print(f"Error: {HEROES_FILE} not found!")
        return

    # Generate JSON files for each hero
    for hero in heroes:
        hero_data = generate_hero_json(hero)
        hero_file_name = hero.lower().replace(' ', '_')  # File name uses underscores
        hero_file_path = os.path.join(FACTS_DIR, f"{hero_file_name}.json")


        # Write the JSON data to the file
        with open(hero_file_path, 'w') as hero_file:
            json.dump(hero_data, hero_file, indent=4)

        print(f"Generated: {hero_file_path}")

    print("All heroes' JSON files generated successfully!")

# Entry point
if __name__ == "__main__":
    main()
