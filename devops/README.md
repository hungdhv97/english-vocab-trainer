# DevOps

Thư mục này chứa các tài nguyên liên quan đến DevOps, bao gồm CI/CD pipelines, scripts tự động hóa, và các công cụ hỗ trợ phát triển.

## Cấu trúc

```
devops/
├── scripts/          # Các script tự động hóa (backup, migration, etc.)
└── ci-cd/           # CI/CD pipeline configurations (GitHub Actions, GitLab CI, etc.)
```

## Scripts

Các script tiện ích để hỗ trợ phát triển và vận hành:

- **Backup scripts**: Sao lưu database và dữ liệu
- **Migration scripts**: Chạy database migrations
- **Deployment scripts**: Tự động hóa quá trình deploy
- **Health check scripts**: Kiểm tra trạng thái services

## CI/CD

Cấu hình pipelines cho các nền tảng CI/CD:

- **GitHub Actions**: `.github/workflows/`
- **GitLab CI**: `.gitlab-ci.yml`
- **Jenkins**: `Jenkinsfile`

## Sử dụng

### Chạy scripts

```bash
# Từ thư mục gốc dự án
./devops/scripts/backup-db.sh
./devops/scripts/run-migrations.sh
```

### CI/CD

Pipelines sẽ tự động chạy khi có push/merge vào các branch được cấu hình.

