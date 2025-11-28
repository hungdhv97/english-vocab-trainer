# Observability

Thư mục này chứa các cấu hình cho monitoring, logging, và observability của ứng dụng.

## Cấu trúc

```
observability/
├── monitoring/           # Monitoring configurations
│   ├── prometheus/      # Prometheus configuration
│   │   └── prometheus.yml
│   └── grafana/         # Grafana configuration
│       ├── dashboards/  # Grafana dashboard provisioning
│       └── datasources/ # Grafana datasource provisioning
└── logging/             # Logging configurations
```

## Monitoring

### Prometheus

Prometheus được sử dụng để thu thập và lưu trữ metrics.

**Cấu hình**: `monitoring/prometheus/prometheus.yml`

**Truy cập**: http://localhost:9090 (chỉ localhost trong production)

**Metrics endpoints**:
- Backend: `http://backend:8180/api/v1/metrics`
- Prometheus itself: `http://localhost:9090/metrics`

### Grafana

Grafana được sử dụng để visualize metrics từ Prometheus.

**Cấu hình**:
- Datasources: `monitoring/grafana/datasources/prometheus.yml`
- Dashboards: `monitoring/grafana/dashboards/dashboard.yml`

**Truy cập**: http://localhost:3000 (chỉ localhost trong production)

**Default credentials**: Được cấu hình trong `deployment/config/prod/.env`:
- Username: `admin`
- Password: `${GRAFANA_ADMIN_PASSWORD}`

## Logging

Cấu hình logging cho các services:

- **Application logs**: Được ghi vào stdout/stderr và thu thập bởi Docker
- **Nginx logs**: `/var/log/nginx/` (mounted volume)
- **Database logs**: Được quản lý bởi PostgreSQL container

## Metrics

### Backend Metrics

Backend API cung cấp metrics endpoint tại `/api/v1/metrics` với các metrics:
- HTTP request metrics (count, duration, status codes)
- Database query metrics
- Redis operation metrics
- Custom business metrics

### System Metrics

- CPU usage
- Memory usage
- Disk I/O
- Network I/O

## Dashboards

Grafana dashboards có sẵn:
- **Application Overview**: Tổng quan về ứng dụng
- **API Performance**: Hiệu suất API endpoints
- **Database Performance**: Hiệu suất database
- **System Resources**: Tài nguyên hệ thống

## Alerting

Cấu hình alerting rules trong Prometheus (tùy chọn):
- High error rate
- High response time
- Service downtime
- Resource exhaustion

## Best Practices

1. **Retention**: Prometheus data được giữ trong 200 giờ (có thể điều chỉnh)
2. **Scraping interval**: 15 giây cho metrics quan trọng, 30 giây cho metrics ít quan trọng hơn
3. **Security**: Chỉ expose monitoring services trên localhost trong production
4. **Backup**: Định kỳ backup Grafana dashboards và Prometheus data

