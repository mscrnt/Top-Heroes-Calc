# Use a base image that includes PHP-FPM and Alpine
FROM php:7.4-fpm-alpine

# Install required tools, PHP extensions, and Bash
RUN apk add --no-cache nginx mysql-client jq bash \
    && docker-php-ext-install pdo_mysql

# Set environment variables for MySQL
ENV MYSQL_ROOT_PASSWORD=SuperSecretPasswordOneTwoThree! \
    MYSQL_DATABASE=top_heroes \
    MYSQL_USER=top_heroes \
    MYSQL_PASSWORD=top_heroes \
    MYSQL_HOST=mysql \
    MYSQL_PORT=3306

# Set the working directory for the PHP application
WORKDIR /var/www/html

# Copy application files into the container
COPY ./php /var/www/html
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copy database initialization folders into the container
COPY ./mariadb/dbstruct /mariadb/dbstruct
COPY ./mariadb/seed /mariadb/seed

# Ensure correct ownership and permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Create directories for NGINX logs and ensure correct permissions
RUN mkdir -p /var/log/nginx \
    && touch /var/log/nginx/error.log \
    && touch /var/log/nginx/access.log \
    && chown -R www-data:www-data /var/log/nginx \
    && chmod -R 755 /var/log/nginx

# Copy NGINX configuration
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for NGINX
EXPOSE 80

# Set the entrypoint script to use bash and start MariaDB and NGINX
ENTRYPOINT ["/bin/bash", "/entrypoint.sh"]
