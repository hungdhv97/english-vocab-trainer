# Deployment

Thư mục này chứa tất cả các cấu hình và tài nguyên liên quan đến việc triển khai ứng dụng.

## Cấu trúc

```
deployment/
├── config/           # Environment configuration files
│   ├── dev/         # Development environment
│   └── prod/        # Production environment
├── nginx/           # Nginx reverse proxy configurations
│   ├── nginx.conf   # Main nginx configuration
│   ├── conf.d/      # Server block configurations
│   └── ssl/         # SSL certificates (not in git)
├── docker-compose.dev.yml   # Development Docker Compose
└── docker-compose.prod.yml  # Production Docker Compose
```

## Docker Compose

### Development

Chạy môi trường development:

```bash
# Từ thư mục gốc dự án
docker compose -f deployment/docker-compose.dev.yml up -d
```

### Production

Chạy môi trường production:

```bash
# Từ thư mục gốc dự án
docker compose -f deployment/docker-compose.prod.yml up -d
```

## Configuration

### Environment Variables

Các file `.env` được lưu trong:
- `deployment/config/dev/.env` - Development
- `deployment/config/prod/.env` - Production

**Lưu ý**: Các file `.env` không được commit vào git. Tạo file `.env.example` làm template.

### Nginx

Cấu hình Nginx reverse proxy:
- `nginx/nginx.conf` - Cấu hình chính
- `nginx/conf.d/app.conf` - Cấu hình server blocks

### SSL Certificates

Đặt SSL certificates vào `nginx/ssl/`:
- `cert.pem` - Certificate file
- `key.pem` - Private key file

## Services

### Development
- Frontend (port 5173)
- Backend (port 8180)
- PostgreSQL (port 5434)
- Redis (port 6379)

### Production
- Nginx (ports 80, 443)
- Frontend (internal)
- Backend (internal, 2 replicas)
- PostgreSQL (port 5434, localhost only)
- Redis (port 6379, localhost only)
- Prometheus (port 9090, localhost only)
- Grafana (port 3000, localhost only)

## Health Checks

Tất cả services đều có health checks được cấu hình trong docker-compose files.

