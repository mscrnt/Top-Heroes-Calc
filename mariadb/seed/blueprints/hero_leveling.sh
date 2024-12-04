#!/bin/bash

echo "Seeding hero_leveling table..."

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

# Ensure the hero_leveling.csv file exists
if [ ! -f "/mariadb/seed/hero_leveling.csv" ]; then
    echo "hero_leveling.csv not found. Skipping hero leveling seeding."
    exit 0
fi

# Get the resource ID for 'Meat'
meat_resource_id=$(run_mysql_query "SELECT id FROM resources WHERE name = 'Meat';")

if [ -z "$meat_resource_id" ]; then
    echo "ERROR: Resource 'Meat' not found. Ensure resources are seeded first."
    exit 1
fi

# Debugging: Print meat_resource_id to confirm
echo "Using Meat resource ID: $meat_resource_id"

# Process the CSV, skipping the header row
row_number=0
tail -n +2 /mariadb/seed/hero_leveling.csv | while IFS=, read -r level meat_required; do
    row_number=$((row_number + 1))
    echo "Processing row $row_number: Level=$level, MeatRequired=$meat_required"

    # Skip empty rows
    if [ -z "$level" ] || [ -z "$meat_required" ]; then
        echo "Skipping invalid or empty row $row_number"
        continue
    fi

    # Clean up the meat_required value: remove commas and extra spaces
    meat_required_clean=$(echo "$meat_required" | sed -E 's/,//g; s/^\s+|\s+$//g')

    # Convert 'k' and 'm' suffixes to numeric values
    if [[ "$meat_required_clean" =~ ^([0-9]+(\.[0-9]+)?)k$ ]]; then
        meat_required_clean=$(echo "$meat_required_clean" | sed -E 's/k$//')
        meat_required_clean=$(echo "$meat_required_clean * 1000" | bc)
    elif [[ "$meat_required_clean" =~ ^([0-9]+(\.[0-9]+)?)m$ ]]; then
        meat_required_clean=$(echo "$meat_required_clean" | sed -E 's/m$//')
        meat_required_clean=$(echo "$meat_required_clean * 1000000" | bc)
    fi

    # Ensure the value is numeric and round to the nearest whole number
    if [[ "$meat_required_clean" =~ ^[0-9]+(\.[0-9]+)?$ ]]; then
        meat_required_clean=$(echo "scale=0; $meat_required_clean / 1" | bc)
    else
        echo "Skipping invalid meat_required value: $meat_required_clean"
        continue
    fi

    # Insert into hero_leveling table
    query="INSERT INTO hero_leveling (level, meat_required, resource_id)
           VALUES ($level, $meat_required_clean, $meat_resource_id)
           ON DUPLICATE KEY UPDATE
               meat_required = VALUES(meat_required);"
    run_mysql_query "$query"
    echo "Successfully inserted/updated level $level with meat_required $meat_required_clean."
done
