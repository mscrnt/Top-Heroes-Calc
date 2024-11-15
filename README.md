Here's a sample `README.md` for your app:

```markdown
# Top Heroes Calculator

Top Heroes Calculator is a web-based application for calculating hero shard requirements for various hero levels and types. The app provides an interactive interface to track progress and calculate remaining shards needed.

## Features

- Interactive star chart for hero progression
- Dynamic shard calculations based on hero type and level
- Responsive design with mobile and desktop support
- SSL support via Nginx Proxy Manager
- Lightweight and containerized using Docker

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: PHP
- **Web Server**: Nginx
- **Containerization**: Docker

## Folder Structure

```
.
├── README.md              # Project documentation
├── docker-compose.yml     # Docker Compose configuration
├── php/                   # PHP application files
│   ├── index.php          # Entry point for the application
│   ├── templates/         # PHP templates
│   │   └── main.php       # Main template file
│   ├── static/            # Static assets
│       ├── css/           # CSS files
│       └── app.js         # JavaScript file
└── nginx/
    ├── default.conf       # Nginx configuration
    └── nginx.conf         # Nginx global configuration
```

## Setup and Installation

### Prerequisites

- Docker and Docker Compose installed on your system.
- A domain name configured to point to your server.
- (Optional) Nginx Proxy Manager for SSL termination.

### Steps to Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/top-heroes-calculator.git
   cd top-heroes-calculator
   ```

2. **Build and run the Docker containers:**
   ```bash
   docker compose up --build
   ```

3. **Access the application:**
   - If running locally: [http://localhost](http://localhost)
   - If deployed: Use your configured domain, e.g., `https://topheroes.net-freaks.com`.

4. **Setup Nginx Proxy Manager for SSL (Optional):**
   - Point the domain `topheroes.net-freaks.com` to your server.
   - Configure a proxy host in Nginx Proxy Manager to forward requests to `http://192.168.x.x:8258`.
   - Enable SSL using Let’s Encrypt.

## Docker Configuration

### Docker Compose File

```yaml
version: '3'

services:
  app:
    build:
      context: .
      dockerfile: php/Dockerfile
    container_name: top-heroes-app
    restart: always
    ports:
      - "80:80"
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

### Dockerfile

```dockerfile
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
```

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
