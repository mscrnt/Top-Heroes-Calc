#!/bin/bash

echo "Seeding resources table..."

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

# Ensure the resources.json file exists
if [ ! -f "/mariadb/seed/resources.json" ]; then
    echo "resources.json not found. Skipping resources seeding."
    exit 0
fi

# Process each resource in the JSON file
jq -c '.resources[]' /mariadb/seed/resources.json | while read -r resource; do
    name=$(echo "$resource" | jq -r '.name')
    icons=$(echo "$resource" | jq -c '.icons')

    echo "Inserting resource: $name"

    # Insert or update the resource
    query="INSERT INTO resources (name)
           VALUES ('$name')
           ON DUPLICATE KEY UPDATE
               name = VALUES(name);"
    run_mysql_query "$query"

    # Retrieve the resource ID
    resource_id=$(run_mysql_query "SELECT id FROM resources WHERE name = '$name';")
    if [ -z "$resource_id" ]; then
        echo "ERROR: Failed to retrieve resource ID for '$name'. Skipping icons."
        continue
    fi

    # Process each icon for the resource
    echo "$icons" | jq -c '.[]' | while read -r icon; do
        type=$(echo "$icon" | jq -r '.type')
        path=$(echo "$icon" | jq -r '.path')

        # Sanitize data
        path=$(echo "$path" | sed 's/\\/\\\\/g; s/"/\\"/g; s/'\''/\\'\''/g')
        type=$(echo "$type" | sed 's/\\/\\\\/g; s/"/\\"/g; s/'\''/\\'\''/g')

        echo "Inserting icon: $path (Type: $type) for resource '$name'"

        # Insert or update the resource icon
        query="INSERT INTO resource_icons (resource_id, type, icon_path)
               VALUES ($resource_id, '$type', '$path')
               ON DUPLICATE KEY UPDATE
                   type = VALUES(type),
                   icon_path = VALUES(icon_path);"
        run_mysql_query "$query"
    done
done

# Log all resources currently in the database
echo "Resources in the database:"
run_mysql_query "SELECT id, name FROM resources;"
