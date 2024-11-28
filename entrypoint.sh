#!/bin/sh

# Wait for the database to be ready
echo "Waiting for MariaDB to be ready..."
until mysql -h "$MYSQL_HOST" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT 1;" 2>/dev/null; do
    sleep 1
done

echo "MariaDB is ready. Initializing database..."

# Apply table structures
if [ -d "/mariadb/dbstruct" ]; then
    for sql_file in /mariadb/dbstruct/db_struct.sql; do
        echo "Applying structure from $sql_file..."
        mysql -h "$MYSQL_HOST" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -D "$MYSQL_DATABASE" < "$sql_file"
    done
else
    echo "No dbstruct directory found. Skipping table structure setup."
fi

# Seed the roles table
if [ -f "/mariadb/seed/roles.json" ]; then
    echo "Populating roles table from roles.json..."
    jq -c '. | to_entries[]' /mariadb/seed/roles.json | while read -r entry; do
        name=$(echo "$entry" | jq -r '.key')
        icon=$(echo "$entry" | jq -r '.value.icon')
        description=$(echo "$entry" | jq -r '.value.description')

        mysql -h "$MYSQL_HOST" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -D "$MYSQL_DATABASE" -e "
        INSERT INTO roles (name, icon, description)
        VALUES ('$name', '$icon', '$description')
        ON DUPLICATE KEY UPDATE
            icon = VALUES(icon),
            description = VALUES(description);
        "
    done

    # Log all roles currently in the database
    echo "Roles in the database:"
    mysql -h "$MYSQL_HOST" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -D "$MYSQL_DATABASE" -e "
    SELECT id, name, icon FROM roles;
    "
else
    echo "roles.json not found. Skipping roles seeding."
fi

# Seed the heroes table
if [ -d "/mariadb/seed/heroes" ]; then
    echo "Populating heroes table from JSON files in heroes/..."
    for file in /mariadb/seed/heroes/*.json; do
        echo "Processing $file..."
        name=$(jq -r '.name' "$file")
        faction=$(jq -r '.faction' "$file")
        attack_hp_values=$(jq -c '.attack_hp_values' "$file")
        rarity=$(jq -r '.rarity' "$file")
        icon=$(jq -r '.icon // null' "$file")
        card=$(jq -r '.card // null' "$file")
        roles=$(jq -r '.roles[]' "$file")

        # Insert hero into the database
        mysql -h "$MYSQL_HOST" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -D "$MYSQL_DATABASE" -e "
        INSERT INTO heroes (name, faction, attack_hp_values, rarity, icon, card)
        VALUES ('$name', '$faction', '$attack_hp_values', '$rarity', '$icon', '$card')
        ON DUPLICATE KEY UPDATE
            faction = VALUES(faction),
            attack_hp_values = VALUES(attack_hp_values),
            rarity = VALUES(rarity),
            icon = VALUES(icon),
            card = VALUES(card);
        "

        # Log roles being processed for this hero
        echo "Roles for hero '$name' in JSON: $roles"

        # Link roles to heroes in hero_roles
        hero_id=$(mysql -h "$MYSQL_HOST" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -D "$MYSQL_DATABASE" -sse "
            SELECT id FROM heroes WHERE name = '$name';
        ")
        echo "$roles" | while IFS= read -r role; do
            # Properly handle roles with spaces or hyphens
            role_id=$(mysql -h "$MYSQL_HOST" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -D "$MYSQL_DATABASE" -sse "
                SELECT id FROM roles WHERE name = '$role';
            ")
            if [ -n "$role_id" ]; then
                echo "Role '$role' found in database for hero '$name'."
                mysql -h "$MYSQL_HOST" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -D "$MYSQL_DATABASE" -e "
                INSERT INTO hero_roles (hero_id, role_id)
                VALUES ($hero_id, $role_id)
                ON DUPLICATE KEY UPDATE hero_id = VALUES(hero_id), role_id = VALUES(role_id);
                "
            else
                echo "ERROR: Role '$role' not found in database for hero '$name'."
            fi
        done
    done
else
    echo "No hero JSON files found in heroes/. Skipping heroes population."
fi

# Start PHP-FPM and NGINX
php-fpm -D && nginx -g 'daemon off;'
