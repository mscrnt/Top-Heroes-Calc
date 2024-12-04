#!/bin/bash

echo "Seeding heroes table..."

# Helper function to run MySQL queries and handle errors
run_mysql_query() {
    local query="$1"
    local result
    result=$(mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -D "$MYSQL_DATABASE" -sse "$query")
    if [ $? -ne 0 ]; then
        echo "ERROR: MySQL query failed: $query"
        exit 1
    fi
    echo "$result"
}

# Check if the heroes directory exists
if [ ! -d "/mariadb/seed/heroes" ]; then
    echo "No hero JSON files found in heroes/. Skipping heroes population."
    exit 0
fi

# Iterate through each hero JSON file
for file in /mariadb/seed/heroes/*.json; do
    echo "Processing hero file: $file"
    
    # Parse hero data from the JSON file
    name=$(jq -r '.name' "$file")
    faction=$(jq -r '.faction' "$file")
    attack_hp_values=$(jq -c '.attack_hp_values' "$file")
    rarity=$(jq -r '.rarity' "$file")
    icon=$(jq -r '.icon // null' "$file")
    card=$(jq -r '.card // null' "$file")
    roles=$(jq -r '.roles[]' "$file")

    # Ensure the faction exists and fetch its ID
    faction_id=$(run_mysql_query "SELECT id FROM factions WHERE name = '$faction';")
    if [ -z "$faction_id" ]; then
        echo "ERROR: Faction '$faction' not found for hero '$name'. Skipping hero."
        continue
    fi

    # Insert or update the hero in the database
    echo "Inserting hero: $name (Faction: $faction, Rarity: $rarity)"
    query="INSERT INTO heroes (name, faction_id, attack_hp_values, rarity, icon, card)
           VALUES ('$name', $faction_id, '$attack_hp_values', '$rarity', '$icon', '$card')
           ON DUPLICATE KEY UPDATE
               faction_id = VALUES(faction_id),
               attack_hp_values = VALUES(attack_hp_values),
               rarity = VALUES(rarity),
               icon = VALUES(icon),
               card = VALUES(card);"
    run_mysql_query "$query"

    # Fetch the newly inserted or existing hero ID
    hero_id=$(run_mysql_query "SELECT id FROM heroes WHERE name = '$name';")
    if [ -z "$hero_id" ]; then
        echo "ERROR: Failed to retrieve ID for hero '$name'. Skipping role assignment."
        continue
    fi

    # Assign roles to the hero
    echo "Assigning roles to hero '$name' (Hero ID: $hero_id)"
    echo "$roles" | while IFS= read -r role; do
        role_id=$(run_mysql_query "SELECT id FROM roles WHERE name = '$role';")
        if [ -z "$role_id" ]; then
            echo "ERROR: Role '$role' not found for hero '$name'."
            continue
        fi

        echo "Linking role '$role' (Role ID: $role_id) to hero '$name' (Hero ID: $hero_id)"
        query="INSERT INTO hero_roles (hero_id, role_id)
               VALUES ($hero_id, $role_id)
               ON DUPLICATE KEY UPDATE
                   hero_id = VALUES(hero_id),
                   role_id = VALUES(role_id);"
        run_mysql_query "$query"
    done
done

echo "Hero seeding completed."
