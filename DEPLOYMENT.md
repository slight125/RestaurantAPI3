# Deployment Guide

This guide provides step-by-step instructions for deploying the Restaurant Management System API to various platforms.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Git repository access
- Environment variables configured

## Local Development Deployment

### 1. Clone and Setup

```bash
git clone <your-repository-url>
cd restaurant-management-api
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
# Edit .env with your local configuration
```

### 3. Database Setup

```bash
# Install PostgreSQL locally or use Docker
docker run --name postgres-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

# Generate and run migrations
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## Production Deployment Options

### Option 1: Heroku Deployment

#### 1. Install Heroku CLI
```bash
npm install -g heroku
heroku login
```

#### 2. Create Heroku App
```bash
heroku create your-restaurant-api
```

#### 3. Add PostgreSQL Database
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

#### 4. Set Environment Variables
```bash
heroku config:set JWT_SECRET=your-production-jwt-secret
heroku config:set NODE_ENV=production
heroku config:set SMTP_HOST=smtp.gmail.com
heroku config:set SMTP_PORT=587
heroku config:set SMTP_USER=your-email@gmail.com
heroku config:set SMTP_PASS=your-app-password
heroku config:set FRONTEND_URL=https://your-frontend-app.herokuapp.com
```

#### 5. Deploy
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

#### 6. Run Database Migrations
```bash
heroku run npm run db:migrate
heroku run npm run db:seed
```

### Option 2: DigitalOcean App Platform

#### 1. Create App Spec File

Create `.do/app.yaml`:

```yaml
name: restaurant-management-api
services:
- name: api
  source_dir: /
  github:
    repo: your-username/restaurant-management-api
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  env:
  - key: NODE_ENV
    value: production
  - key: JWT_SECRET
    value: your-production-jwt-secret
    type: SECRET
  - key: SMTP_HOST
    value: smtp.gmail.com
  - key: SMTP_PORT
    value: "587"
  - key: SMTP_USER
    value: your-email@gmail.com
    type: SECRET
  - key: SMTP_PASS
    value: your-app-password
    type: SECRET
databases:
- name: restaurant-db
  engine: PG
  version: "13"
```

#### 2. Deploy via DigitalOcean Console
1. Go to DigitalOcean App Platform
2. Create new app from GitHub repository
3. Use the app spec file above
4. Deploy and configure domain

### Option 3: AWS EC2 Deployment

#### 1. Launch EC2 Instance
- Choose Ubuntu 20.04 LTS
- Configure security groups (ports 22, 80, 443, 3000)
- Create or use existing key pair

#### 2. Connect and Setup Server
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
CREATE DATABASE restaurant_db;
CREATE USER restaurant_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE restaurant_db TO restaurant_user;
\q
```

#### 3. Deploy Application
```bash
# Clone repository
git clone <your-repository-url>
cd restaurant-management-api

# Install dependencies
npm install

# Create production environment file
sudo nano .env
# Add your production environment variables

# Build application
npm run build

# Install PM2 for process management
sudo npm install -g pm2

# Start application with PM2
pm2 start dist/index.js --name restaurant-api
pm2 startup
pm2 save
```

#### 4. Setup Nginx Reverse Proxy
```bash
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/restaurant-api

# Add configuration:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/restaurant-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. Setup SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

### Option 4: Docker Deployment

#### 1. Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["npm", "start"]
```

#### 2. Create Docker Compose
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://restaurant_user:password@db:5432/restaurant_db
      - JWT_SECRET=your-jwt-secret
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=restaurant_db
      - POSTGRES_USER=restaurant_user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

#### 3. Deploy with Docker
```bash
# Build and start services
docker-compose up -d

# Run migrations
docker-compose exec api npm run db:migrate
docker-compose exec api npm run db:seed
```

## Database Migration in Production

### Running Migrations
```bash
# For Heroku
heroku run npm run db:migrate

# For Docker
docker-compose exec api npm run db:migrate

# For PM2/Direct deployment
npm run db:migrate
```

### Backup Database
```bash
# PostgreSQL backup
pg_dump -h localhost -U restaurant_user restaurant_db > backup.sql

# Restore from backup
psql -h localhost -U restaurant_user restaurant_db < backup.sql
```

## Monitoring and Logging

### PM2 Monitoring
```bash
# View logs
pm2 logs restaurant-api

# Monitor processes
pm2 monit

# Restart application
pm2 restart restaurant-api
```

### Health Checks
The API includes a health check endpoint at `/health` that returns:
```json
{
  "success": true,
  "message": "Restaurant Management API is running",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

## Security Considerations

### Environment Variables
- Never commit `.env` files to version control
- Use strong, unique JWT secrets
- Rotate secrets regularly
- Use environment-specific configurations

### Database Security
- Use strong database passwords
- Enable SSL connections in production
- Regularly backup data
- Monitor for suspicious activity

### API Security
- Enable CORS with specific origins
- Use HTTPS in production
- Implement rate limiting
- Monitor API usage

## Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check database status
sudo systemctl status postgresql

# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL
```

#### Port Already in Use
```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

#### Memory Issues
```bash
# Check memory usage
free -h

# Check Node.js memory usage
pm2 show restaurant-api
```

### Logs Location
- PM2 logs: `~/.pm2/logs/`
- Nginx logs: `/var/log/nginx/`
- System logs: `/var/log/syslog`

## Performance Optimization

### Database Optimization
- Add database indexes for frequently queried fields
- Use connection pooling
- Implement query optimization
- Regular database maintenance

### Application Optimization
- Enable gzip compression
- Implement caching strategies
- Use CDN for static assets
- Monitor and optimize slow endpoints

### Server Optimization
- Configure proper server resources
- Use load balancing for high traffic
- Implement auto-scaling
- Monitor server metrics

## Backup and Recovery

### Automated Backups
```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://your-backup-bucket/
```

### Recovery Process
1. Stop the application
2. Restore database from backup
3. Run any pending migrations
4. Restart the application
5. Verify functionality

This deployment guide covers the most common deployment scenarios. Choose the option that best fits your infrastructure requirements and technical expertise.

