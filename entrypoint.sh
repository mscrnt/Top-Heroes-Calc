#!/bin/bash

# Helper function to run MySQL queries and handle errors
run_mysql_query() {
    local query="$1"
    local db="$2"
    local result
    result=$(mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u root -p"$MYSQL_ROOT_PASSWORD" -D "$MYSQL_DATABASE" -e "$query")
    if [ $? -ne 0 ]; then
        echo "ERROR: MySQL query failed: $query"
        exit 1
    fi
    echo "$result"
}

# Wait for the database to be ready
echo "Waiting for MariaDB to be ready..."
until mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT 1;" 2>/dev/null; do
    sleep 1
done

echo "MariaDB is ready. Initializing database..."

# Apply table structures
if [ -d "/mariadb/dbstruct" ]; then
    for sql_file in /mariadb/dbstruct/db_struct.sql; do
        echo "Applying structure from $sql_file..."
        mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -D "$MYSQL_DATABASE" < "$sql_file"
    done
else
    echo "No dbstruct directory found. Skipping table structure setup."
fi


# Seed the factions table
if [ -f "/mariadb/seed/factions.json" ]; then
    echo "Populating factions table from factions.json..."
    jq -c '.factions[]' /mariadb/seed/factions.json | while read -r faction; do
        name=$(echo "$faction" | jq -r '.name')
        strong=$(echo "$faction" | jq -r '.strong')
        weak=$(echo "$faction" | jq -r '.weak')
        color=$(echo "$faction" | jq -r '.color')
        icon=$(echo "$faction" | jq -r '.icon')

        echo "Inserting faction: $name (Strong: $strong, Weak: $weak, Color: $color, Icon: $icon)"
        query="INSERT INTO factions (name, strong, weak, color, icon)
               VALUES ('$name', '$strong', '$weak', '$color', '$icon')
               ON DUPLICATE KEY UPDATE
                   strong = VALUES(strong),
                   weak = VALUES(weak),
                   color = VALUES(color),
                   icon = VALUES(icon);"
        run_mysql_query "$query" "$MYSQL_DATABASE"
    done

    # Log all factions currently in the database
    echo "Factions in the database:"
    query="SELECT id, name, strong, weak FROM factions;"
    run_mysql_query "$query" "$MYSQL_DATABASE"
else
    echo "factions.json not found. Skipping factions seeding."
fi

# Seed the resources table
if [ -f "/mariadb/seed/resources.json" ]; then
    echo "Populating resources table from resources.json..."
    jq -c '.resources[]' /mariadb/seed/resources.json | while read -r resource; do
        name=$(echo "$resource" | jq -r '.name')
        icons=$(echo "$resource" | jq -c '.icons')

        # Insert resource
        echo "Inserting resource: $name"
        mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -D "$MYSQL_DATABASE" -e "
        INSERT INTO resources (name)
        VALUES ('$name')
        ON DUPLICATE KEY UPDATE name = VALUES(name);
        "

        resource_id=$(mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -D "$MYSQL_DATABASE" -sse "
            SELECT id FROM resources WHERE name = '$name';
        ")

        if [ -z "$resource_id" ]; then
            echo "ERROR: Resource '$name' could not be inserted."
            continue
        fi

        # Insert resource icons
        echo "$icons" | jq -c '.[]' | while read -r icon; do
            type=$(echo "$icon" | jq -r '.type')
            path=$(echo "$icon" | jq -r '.path')  # Corrected field to 'path'
            
            
            # Sanitize data to prevent SQL errors
            path=$(echo "$path" | sed 's/\\/\\\\/g' | sed "s/'/\\'/g")
            type=$(echo "$type" | sed "s/'/\\'/g")

            echo "Inserting icon: $path (Type: $type)"


            # Insert icon
            mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -D "$MYSQL_DATABASE" -e "
            INSERT INTO resource_icons (resource_id, type, icon_path)
            VALUES ($resource_id, '$type', '$path')
            ON DUPLICATE KEY UPDATE
                type = VALUES(type),
                icon_path = VALUES(icon_path);
            "
        done
    done

    # Log all resources currently in the database
    echo "Resources in the database:"
    mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -D "$MYSQL_DATABASE" -e "
    SELECT id, name FROM resources;
    "
else
    echo "resources.json not found. Skipping resources seeding."
fi

# Seed the roles table
if [ -f "/mariadb/seed/roles.json" ]; then
    echo "Populating roles table from roles.json..."
    jq -c '. | to_entries[]' /mariadb/seed/roles.json | while read -r entry; do
        name=$(echo "$entry" | jq -r '.key')
        icon=$(echo "$entry" | jq -r '.value.icon')
        description=$(echo "$entry" | jq -r '.value.description')

        echo "Inserting role: $name (Icon: $icon, Description: $description)"
        mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -D "$MYSQL_DATABASE" -e "
        INSERT INTO roles (name, icon, description)
        VALUES ('$name', '$icon', '$description')
        ON DUPLICATE KEY UPDATE
            icon = VALUES(icon),
            description = VALUES(description);
        "
    done

    echo "Roles in the database:"
    mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -D "$MYSQL_DATABASE" -e "
    SELECT id, name, icon FROM roles;
    "
else
    echo "roles.json not found. Skipping roles seeding."
fi

# Seed the heroes table
if [ -d "/mariadb/seed/heroes" ]; then
    echo "Populating heroes table from JSON files in heroes/..."
    for file in /mariadb/seed/heroes/*.json; do
        echo "Processing hero file: $file"
        name=$(jq -r '.name' "$file")
        faction=$(jq -r '.faction' "$file")
        attack_hp_values=$(jq -c '.attack_hp_values' "$file")
        rarity=$(jq -r '.rarity' "$file")
        icon=$(jq -r '.icon // null' "$file")
        card=$(jq -r '.card // null' "$file")
        roles=$(jq -r '.roles[]' "$file")

        echo "Inserting hero: $name (Faction: $faction, Rarity: $rarity, Icon: $icon, Card: $card)"
        
        # Fetch faction_id from factions table
        faction_id=$(mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -D "$MYSQL_DATABASE" -sse "
            SELECT id FROM factions WHERE name = '$faction';
        ")

        if [ -z "$faction_id" ]; then
            echo "ERROR: Faction '$faction' not found for hero '$name'. Skipping hero."
            continue
        fi

        mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -D "$MYSQL_DATABASE" -e "
        INSERT INTO heroes (name, faction_id, attack_hp_values, rarity, icon, card)
        VALUES ('$name', $faction_id, '$attack_hp_values', '$rarity', '$icon', '$card')
        ON DUPLICATE KEY UPDATE
            faction_id = VALUES(faction_id),
            attack_hp_values = VALUES(attack_hp_values),
            rarity = VALUES(rarity),
            icon = VALUES(icon),
            card = VALUES(card);
        "

        # Link roles to heroes in hero_roles
        hero_id=$(mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -D "$MYSQL_DATABASE" -sse "
            SELECT id FROM heroes WHERE name = '$name';
        ")
        echo "Assigning roles to hero '$name' (Hero ID: $hero_id)"
        echo "$roles" | while IFS= read -r role; do
            role_id=$(mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -D "$MYSQL_DATABASE" -sse "
                SELECT id FROM roles WHERE name = '$role';
            ")
            if [ -n "$role_id" ]; then
                echo "Linking role '$role' (Role ID: $role_id) to hero '$name' (Hero ID: $hero_id)"
                mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -D "$MYSQL_DATABASE" -e "
                INSERT INTO hero_roles (hero_id, role_id)
                       VALUES ($hero_id, $role_id)
                       ON DUPLICATE KEY UPDATE hero_id = VALUES(hero_id), role_id = VALUES(role_id);
                "
            else
                echo "ERROR: Role '$role' not found for hero '$name'."
            fi
        done
    done
else
    echo "No hero JSON files found in heroes/. Skipping heroes population."
fi

# Helper function to run MySQL queries and handle errors
mysql_query() {
    local query="$1"
    local db="$2"
    local result
    # Run the query
    result=$(mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u root -p"$MYSQL_ROOT_PASSWORD" -D "$MYSQL_DATABASE" -sse "$query")
    if [ $? -ne 0 ]; then
        echo "ERROR: MySQL query failed: $query"
        exit 1
    fi

    # Check if any rows were affected (for inserts/updates)
    affected_rows=$(mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u root -p"$MYSQL_ROOT_PASSWORD" -D "$MYSQL_DATABASE" -sse "SELECT ROW_COUNT();")
    
    echo "$affected_rows"  # Return the affected rows count
}


# Seed the hero_leveling table
if [ -f "/mariadb/seed/hero_leveling.csv" ]; then
    echo "Populating hero_leveling table from hero_leveling.csv..."

    # Get the resource ID for 'Meat' once
    meat_resource_id=$(run_mysql_query "SELECT id FROM resources WHERE name = 'Meat';" "$MYSQL_DATABASE")

    # Debugging: Print meat_resource_id to check if it's correctly assigned
    echo "meat_resource_id: $meat_resource_id"
    
    if [ -z "$meat_resource_id" ]; then
        echo "ERROR: Resource 'Meat' not found. Ensure resources are seeded first."
        exit 1
    fi

    # Process the CSV, skipping the header row
    row_number=0
    tail -n +2 /mariadb/seed/hero_leveling.csv | while IFS=, read -r level meat_required; do
        row_number=$((row_number + 1))
        echo "Processing row $row_number..."

        # Skip empty rows
        if [ -z "$level" ] || [ -z "$meat_required" ]; then
            echo "Skipping invalid or empty row $row_number"
            continue
        fi

        # Clean up the meat_required value: remove commas and extra spaces
        meat_required_clean=$(echo "$meat_required" | sed -E 's/,//g; s/^\s+|\s+$//g')


        # Convert the meat_required value if it contains 'k' or 'm'
        if [[ "$meat_required_clean" =~ ^([0-9]+(\.[0-9]+)?)k$ ]]; then
            # Handle 'k' (thousands), keep decimal if present
            numeric_value=$(echo "$meat_required_clean" | sed -E 's/k$//')
            numeric_value=$(echo "$numeric_value * 1000" | bc)  # Multiply by 1000
        elif [[ "$meat_required_clean" =~ ^([0-9]+(\.[0-9]+)?)m$ ]]; then
            # Handle 'm' (millions), keep decimal if present
            numeric_value=$(echo "$meat_required_clean" | sed -E 's/m$//')
            numeric_value=$(echo "$numeric_value * 1000000" | bc)  # Multiply by 1000000
        elif [[ "$meat_required_clean" =~ ^[0-9]+(\.[0-9]+)?$ ]]; then
            # It's a simple number or decimal without k/m
            numeric_value=$meat_required_clean
        else
            # If we can't convert, skip this row
            echo "Skipping invalid meat_required value: $meat_required_clean"
            continue
        fi


        # Ensure the value is numeric and convert to whole number (integer)
        if [[ "$numeric_value" =~ ^[0-9]+(\.[0-9]+)?$ ]]; then
            # Round to the nearest whole number (integer) using bc
            rounded_value=$(echo "scale=0; $numeric_value / 1" | bc)  # Remove decimals, round to integer


            # Ensure it's an integer (just in case bc doesn't handle rounding as expected)
            if [[ "$rounded_value" =~ ^[0-9]+$ ]]; then
                # Clean the meat_resource_id to ensure it's just the number
                meat_resource_id_clean=$(echo "$meat_resource_id" | sed 's/[^0-9]//g')  # Strip any non-digit characters

                # Prepare the insert query (properly formatted)
                insert_query="INSERT INTO hero_leveling (level, meat_required, resource_id) 
                              VALUES ($level, $rounded_value, $meat_resource_id_clean)
                              ON DUPLICATE KEY UPDATE meat_required = VALUES(meat_required);"



                # Use mysql_query to execute the insert query
                result=$(mysql_query "$insert_query" "$MYSQL_DATABASE")


                # Check if the insert was successful
                if [[ -n "$result" ]]; then
                    echo "Successfully inserted level $level with meat_required $rounded_value."
                else
                    echo "ERROR: Failed to insert level $level with meat_required $rounded_value."
                fi
            else
                echo "Skipping invalid or non-integer value for level $level: $rounded_value"
            fi
        else
            echo "Skipping invalid or empty numeric value for level $level: $numeric_value"
        fi

    done
else
    echo "hero_leveling.csv not found. Skipping hero leveling seeding."
fi


# Start PHP-FPM and NGINX
php-fpm -D && nginx -g 'daemon off;'
