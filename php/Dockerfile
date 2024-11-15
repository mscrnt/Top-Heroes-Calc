# path: php/Dockerfile

# Use a base image that includes both PHP-FPM and NGINX
FROM php:7.4-fpm-alpine

# Install NGINX
RUN apk add --no-cache nginx

# Set the working directory
WORKDIR /var/www/html

# Copy only the contents of the php folder into /var/www/html
COPY ./php /var/www/html

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

# Start PHP-FPM and NGINX when the container starts
CMD ["sh", "-c", "php-fpm -D && nginx -g 'daemon off;'"]
