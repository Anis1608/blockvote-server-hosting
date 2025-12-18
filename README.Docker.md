# Docker Deployment Guide - BlockVote (Cloud MongoDB & Redis)

This guide is for deploying BlockVote using Docker when you're using **cloud-hosted MongoDB and Redis**.

## Prerequisites

- Docker Engine 20.10 or higher
- Docker Compose 2.0 or higher
- Cloud MongoDB (MongoDB Atlas) account
- Cloud Redis account

## Quick Start

### 1. Create Environment File

Create a `.env` file in the root directory with your cloud credentials:

```bash
# Copy from your Backend/.env or create new
cp Backend/.env .env
```

Your `.env` should contain:

```env
# MongoDB Cloud (MongoDB Atlas)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/blockvote

# Redis Cloud
REDIS_URL=redis://default:password@your-redis-host:port

# JWT Secret
SECRET_KEY=your-secret-key

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Stellar Blockchain
STELLAR_SERVER=https://horizon-testnet.stellar.org

# Frontend API URL
VITE_API_URL=http://localhost:5000
```

### 2. Build and Start Services

```bash
# Build and start Backend + Frontend only
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 3. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000/api

## What's Included

This Docker setup includes **only**:

✅ **Backend** (Node.js API) - Port 5000  
✅ **Frontend** (React + Nginx) - Port 80

**NOT Included** (using your cloud services):

❌ MongoDB (using MongoDB Atlas)  
❌ Redis (using Redis Cloud)

## Architecture

```
┌─────────────────────────────────────────┐
│         Docker Containers               │
│  ┌──────────┐      ┌──────────┐        │
│  │ Frontend │      │ Backend  │        │
│  │  (Nginx) │─────▶│(Node.js) │        │
│  │  Port 80 │      │ Port 5000│        │
│  └──────────┘      └────┬─────┘        │
└─────────────────────────┼───────────────┘
                          │
                          │ Internet
                          │
         ┌────────────────┴────────────────┐
         │                                 │
    ┌────▼─────┐                  ┌───────▼────┐
    │ MongoDB  │                  │   Redis    │
    │  Atlas   │                  │   Cloud    │
    │ (Cloud)  │                  │  (Cloud)   │
    └──────────┘                  └────────────┘
```

## Useful Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart backend only
docker-compose restart backend
```

### Stop Services

```bash
# Stop all containers
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Rebuild After Code Changes

```bash
# Rebuild all
docker-compose up -d --build

# Rebuild backend only
docker-compose up -d --build backend

# Rebuild frontend only
docker-compose up -d --build frontend
```

### Execute Commands in Containers

```bash
# Access backend shell
docker-compose exec backend sh

# Check backend environment variables
docker-compose exec backend env | grep MONGO
```

## Troubleshooting

### Backend Can't Connect to MongoDB

1. Check your MongoDB Atlas connection string:
   ```bash
   docker-compose exec backend env | grep MONGO_URI
   ```

2. Verify MongoDB Atlas allows connections from anywhere (0.0.0.0/0) or add Docker host IP

3. Check backend logs:
   ```bash
   docker-compose logs backend | grep -i mongo
   ```

### Backend Can't Connect to Redis

1. Check Redis URL:
   ```bash
   docker-compose exec backend env | grep REDIS_URL
   ```

2. Verify Redis Cloud allows external connections

3. Check backend logs:
   ```bash
   docker-compose logs backend | grep -i redis
   ```

### Port Already in Use

If port 80 or 5000 is already in use, modify `docker-compose.yml`:

```yaml
ports:
  - "8080:80"  # Frontend on port 8080
  - "5001:5000"  # Backend on port 5001
```

### Environment Variables Not Loading

Make sure `.env` file is in the **root directory** (same level as `docker-compose.yml`):

```
Blockchain_Voting/
├── .env                    ← Here!
├── docker-compose.yml
├── Backend/
└── Frontend/
```

## Production Deployment

### Security Checklist

- [ ] Change all default passwords
- [ ] Use strong `SECRET_KEY`
- [ ] Enable MongoDB Atlas IP whitelist
- [ ] Enable Redis authentication
- [ ] Set up SSL/TLS (use nginx-proxy or Caddy)
- [ ] Configure firewall rules
- [ ] Set up automated backups
- [ ] Use environment-specific `.env` files

### Recommended: Use Docker Secrets

For production, use Docker secrets instead of `.env`:

```yaml
secrets:
  mongo_uri:
    external: true
  redis_url:
    external: true
```

## Monitoring

### Check Container Health

```bash
docker-compose ps
```

Healthy output:
```
NAME                    STATUS
blockvote-backend       Up (healthy)
blockvote-frontend      Up (healthy)
```

### Resource Usage

```bash
docker stats
```

## Backup Strategy

Since you're using cloud services:

- **MongoDB**: Use MongoDB Atlas automated backups
- **Redis**: Use Redis Cloud persistence settings
- **Uploads**: Backup the Docker volume:
  ```bash
  docker run --rm -v blockvote_backend_uploads:/data -v $(pwd):/backup alpine tar czf /backup/uploads-backup.tar.gz -C /data .
  ```

## Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Verify cloud service connectivity
3. Check `.env` file configuration
4. Review main [README.md](README.md)

---

**Note**: This setup is optimized for deployments using cloud-hosted databases. If you want to run MongoDB and Redis locally with Docker, see the full `docker-compose.yml` with database services.
