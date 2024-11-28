# path: php/Dockerfile

# Use a base image that includes both PHP-FPM and NGINX
FROM php:7.4-fpm-alpine

# Install required tools and PHP extensions
RUN apk add --no-cache nginx mysql-client jq \
    && docker-php-ext-install pdo_mysql

# Set the working directory
WORKDIR /var/www/html

# Copy application files
COPY ./php /var/www/html
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copy database initialization folders into the container
COPY ./mariadb/dbstruct /mariadb/dbstruct
COPY ./mariadb/seed /mariadb/seed

# Ensure correct ownership and permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Create directories for NGINX logs
RUN mkdir -p /var/log/nginx \
    && touch /var/log/nginx/error.log \
    && touch /var/log/nginx/access.log \
    && chown -R www-data:www-data /var/log/nginx \
    && chmod -R 755 /var/log/nginx

# Copy NGINX configuration
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Set entrypoint script
ENTRYPOINT ["/entrypoint.sh"]
