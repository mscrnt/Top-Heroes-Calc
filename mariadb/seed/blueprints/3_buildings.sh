#!/bin/bash

echo "Seeding buildings, castle_levels, building_levels, and updating Building A and B..."

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

# Ensure the necessary JSON files exist
if [ ! -f "/mariadb/seed/buildings.json" ]; then
    echo "buildings.json not found. Skipping buildings seeding."
    exit 0
fi

if [ ! -f "/mariadb/seed/castle_levels.json" ]; then
    echo "castle_levels.json not found. Skipping castle levels seeding."
    exit 0
fi

# Step 1: Seed buildings table
echo "Seeding buildings table..."
jq -c '.buildings[]' /mariadb/seed/buildings.json | while read -r building; do
    id=$(echo "$building" | jq -r '.id')
    name=$(echo "$building" | jq -r '.name')
    max_level=$(echo "$building" | jq -r '.max_level')

    echo "Inserting building: $name (ID: $id, Max Level: $max_level)"

    query="INSERT INTO buildings (id, name, max_level)
           VALUES ($id, '$name', $max_level)
           ON DUPLICATE KEY UPDATE
               name = VALUES(name),
               max_level = VALUES(max_level);"
    run_mysql_query "$query"
done

# Step 2: Seed castle_levels table
echo "Seeding castle_levels table..."
jq -c '.castle_levels[]' /mariadb/seed/castle_levels.json | while read -r level; do
    castle_level=$(echo "$level" | jq -r '.level')
    required_wood=$(echo "$level" | jq -r '.required_wood // null')
    required_stone=$(echo "$level" | jq -r '.required_stone // null')
    level_cap=$(echo "$level" | jq -r '.level_cap // null') # Extract level_cap if present, allow NULL

    wood_resource_id=$(run_mysql_query "SELECT id FROM resources WHERE name = 'Wood';")
    stone_resource_id=$(run_mysql_query "SELECT id FROM resources WHERE name = 'Stone';")

    echo "Inserting castle level: Level=$castle_level, Required Wood=$required_wood, Required Stone=$required_stone, Level Cap=$level_cap"

    query="INSERT INTO castle_levels (level, required_wood, required_stone, wood_resource_id, stone_resource_id, level_cap)
           VALUES ($castle_level, $required_wood, $required_stone, $wood_resource_id, $stone_resource_id, $level_cap)
           ON DUPLICATE KEY UPDATE
               required_wood = VALUES(required_wood),
               required_stone = VALUES(required_stone),
               level_cap = VALUES(level_cap);"
    run_mysql_query "$query"
done

# Step 3: Seed building_levels table
echo "Seeding building_levels table..."
jq -c '.buildings[]' /mariadb/seed/buildings.json | while read -r building; do
    id=$(echo "$building" | jq -r '.id')
    name=$(echo "$building" | jq -r '.name')

    # Skip processing levels for the Castle
    if [ "$name" == "Castle" ]; then
        echo "Skipping level processing for Castle."
        continue
    fi

    # Process each level for the building
    echo "$building" | jq -c '.level | to_entries[]' | while read -r level_entry; do
        building_level=$(echo "$level_entry" | jq -r '.key')
        castle_level=$(echo "$level_entry" | jq -r '.value')

        echo "Inserting building level: Building ID=$id, Level=$building_level, Castle Level=$castle_level"

        query="INSERT INTO building_levels (building_id, castle_level, level)
               VALUES ($id, $castle_level, $building_level)
               ON DUPLICATE KEY UPDATE
                   level = VALUES(level);"
        run_mysql_query "$query"
    done
done

# Step 4: Update building_a_id and building_b_id in castle_levels
echo "Updating Building A and Building B for castle_levels..."
declare -A building_track

run_mysql_query "SELECT DISTINCT castle_level FROM building_levels ORDER BY castle_level;" | while read -r castle_level; do
    building_ids=$(run_mysql_query "SELECT building_id FROM building_levels WHERE castle_level = $castle_level ORDER BY building_id;")
    
    # Initialize Building A and Building B
    building_a_id="NULL"
    building_b_id="NULL"
    
    for building_id in $building_ids; do
        # Assign the first building to A and the second to B
        if [ "$building_a_id" == "NULL" ]; then
            building_a_id=$building_id
        elif [ "$building_b_id" == "NULL" ]; then
            building_b_id=$building_id
            break
        fi
    done

    echo "Updating Castle Level=$castle_level with Building A=$building_a_id, Building B=$building_b_id"

    query="UPDATE castle_levels
           SET building_a_id = $building_a_id, building_b_id = $building_b_id
           WHERE level = $castle_level;"
    run_mysql_query "$query"
done

# Step 5: Seed castle_building_unlocks table
echo "Seeding castle_building_unlocks table..."

run_mysql_query "SELECT DISTINCT castle_level FROM building_levels ORDER BY castle_level;" | while read -r castle_level; do
    # Fetch building levels associated with the castle level
    building_levels=$(run_mysql_query "SELECT building_id, level FROM building_levels WHERE castle_level = $castle_level ORDER BY building_id;")
    
    while read -r building_id building_level; do
        echo "Inserting unlock: Castle Level=$castle_level, Building ID=$building_id, Building Level=$building_level"

        query="INSERT INTO castle_building_unlocks (castle_level, building_id, building_level)
               VALUES ($castle_level, $building_id, $building_level)
               ON DUPLICATE KEY UPDATE
                   building_level = VALUES(building_level);"
        run_mysql_query "$query"
    done <<< "$building_levels"
done

# Log the final state of the tables
echo "Buildings in the database:"
run_mysql_query "SELECT id, name, max_level FROM buildings;"

echo "Castle Levels in the database:"
run_mysql_query "SELECT level, required_wood, required_stone, level_cap, building_a_id, building_b_id FROM castle_levels;"

echo "Building Levels in the database:"
run_mysql_query "SELECT building_id, castle_level, level FROM building_levels;"

echo "Castle Building Unlocks in the database:"
run_mysql_query "SELECT castle_level, building_id, building_level FROM castle_building_unlocks;"
