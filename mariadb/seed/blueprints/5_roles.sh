#!/bin/bash

echo "Seeding roles table..."

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

# Ensure the roles.json file exists
if [ ! -f "/mariadb/seed/roles.json" ]; then
    echo "roles.json not found. Skipping roles seeding."
    exit 0
fi

# Process each role in the JSON file
jq -c '. | to_entries[]' /mariadb/seed/roles.json | while read -r entry; do
    name=$(echo "$entry" | jq -r '.key')
    icon=$(echo "$entry" | jq -r '.value.icon')
    description=$(echo "$entry" | jq -r '.value.description')

    echo "Inserting role: $name (Icon: $icon, Description: $description)"

    # Insert or update the role in the database
    query="INSERT INTO roles (name, icon, description)
           VALUES ('$name', '$icon', '$description')
           ON DUPLICATE KEY UPDATE
               icon = VALUES(icon),
               description = VALUES(description);"
    run_mysql_query "$query"
done

# Log all roles currently in the database
echo "Roles in the database:"
run_mysql_query "SELECT id, name, icon FROM roles;"
