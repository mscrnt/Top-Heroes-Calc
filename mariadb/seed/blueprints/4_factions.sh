#!/bin/bash

echo "Seeding factions table..."
if [ -f "/mariadb/seed/factions.json" ]; then
    jq -c '.factions[]' /mariadb/seed/factions.json | while read -r faction; do
        name=$(echo "$faction" | jq -r '.name')
        strong=$(echo "$faction" | jq -r '.strong')
        weak=$(echo "$faction" | jq -r '.weak')
        color=$(echo "$faction" | jq -r '.color')
        icon=$(echo "$faction" | jq -r '.icon')

        echo "Inserting faction: $name"
        mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -D "$MYSQL_DATABASE" -e "
        INSERT INTO factions (name, strong, weak, color, icon)
        VALUES ('$name', '$strong', '$weak', '$color', '$icon')
        ON DUPLICATE KEY UPDATE
            strong = VALUES(strong),
            weak = VALUES(weak),
            color = VALUES(color),
            icon = VALUES(icon);
        "
    done
else
    echo "factions.json not found. Skipping factions seeding."
fi
