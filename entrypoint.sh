#!/bin/sh

# Wait for MySQL to be ready
echo "Waiting for MySQL to start..."
until mysql -h mysql -u"${MYSQL_USER}" -p"${MYSQL_PASSWORD}" -e "SELECT 1;" 2>/dev/null; do
    sleep 1
done

echo "MySQL started. Preparing database..."

# Debug environment variables
echo "MYSQL_DATABASE=${MYSQL_DATABASE}"
echo "MYSQL_USER=${MYSQL_USER}"

# Create database and table if they don't exist
mysql -h mysql -u"${MYSQL_USER}" -p"${MYSQL_PASSWORD}" -e "
CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\`;
USE \`${MYSQL_DATABASE}\`;
CREATE TABLE IF NOT EXISTS heroes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE, -- Add UNIQUE constraint
    roles JSON NOT NULL,
    faction VARCHAR(50) NOT NULL,
    attack_hp_values JSON NOT NULL,
    rarity VARCHAR(50) NOT NULL,
    icon VARCHAR(255),
    card VARCHAR(255)
);
"

# Check if table was created successfully
mysql -h mysql -u"${MYSQL_USER}" -p"${MYSQL_PASSWORD}" -D "${MYSQL_DATABASE}" -e "
SHOW TABLES LIKE 'heroes';
"

echo "Database and table setup complete."

# Insert data from JSON files
if [ -d "/tmp/facts" ]; then
    echo "Populating heroes table from JSON files..."
    for file in /tmp/facts/*.json; do
        echo "Processing $file..."
        name=$(jq -r '.name' "$file")
        roles=$(jq -c '.roles' "$file")
        faction=$(jq -r '.faction' "$file")
        attack_hp_values=$(jq -c '.attack_hp_values' "$file")
        rarity=$(jq -r '.rarity' "$file")
        card=$(jq -r '.card // null' "$file")
        icon=$(jq -r '.icon // null' "$file")

        # Validate the fields before inserting
        if [ -n "$name" ] && [ -n "$roles" ] && [ -n "$faction" ] && [ -n "$rarity" ]; then
            mysql -h mysql -u"${MYSQL_USER}" -p"${MYSQL_PASSWORD}" -D "${MYSQL_DATABASE}" -e "
            INSERT INTO heroes (name, roles, faction, attack_hp_values, rarity, icon, card)
            VALUES ('$name', '$roles', '$faction', '$attack_hp_values', '$rarity', '$icon', '$card')
            ON DUPLICATE KEY UPDATE
                roles = VALUES(roles),
                faction = VALUES(faction),
                attack_hp_values = VALUES(attack_hp_values),
                rarity = VALUES(rarity),
                icon = VALUES(icon),
                card = VALUES(card);
            "
        else
            echo "Skipping $file due to missing fields."
        fi
    done

    echo "Hero data population complete. Cleaning up JSON files..."
    rm -rf /tmp/facts
else
    echo "No JSON files found to process."
fi

# Start PHP-FPM and NGINX
php-fpm -D && nginx -g 'daemon off;'
