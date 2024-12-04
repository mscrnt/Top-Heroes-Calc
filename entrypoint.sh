#!/bin/bash

# Wait for the database to be ready
echo "Waiting for MariaDB to be ready..."
until mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT 1;" 2>/dev/null; do
    sleep 1
done

echo "MariaDB is ready. Initializing database..."

# Apply table structures
if [ -d "/mariadb/dbstruct" ]; then
    for sql_file in /mariadb/dbstruct/*.sql; do
        echo "Applying structure from $sql_file..."
        mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -D "$MYSQL_DATABASE" < "$sql_file"
    done
else
    echo "No dbstruct directory found. Skipping table structure setup."
fi

# Execute blueprints for seeding data
if [ -d "/mariadb/seed/blueprints" ]; then
    for blueprint in /mariadb/seed/blueprints/*.sh; do
        echo "Executing blueprint: $blueprint"
        source "$blueprint"
    done
else
    echo "No blueprints directory found. Skipping data seeding."
fi

# Start PHP-FPM and NGINX
php-fpm -D && nginx -g 'daemon off;'
