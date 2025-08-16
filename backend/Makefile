APP_NAME := api
BIN_DIR := bin
MAIN := ./cmd/api
MIGRATIONS_DIR := migrations/schema
DATABASE_URL ?= postgres://user:password@localhost:5434/vocab?sslmode=disable

.PHONY: build run test fmt migrate-up migrate-down

build:
	go build -o $(BIN_DIR)/$(APP_NAME) $(MAIN)

run:
	go run $(MAIN)

fmt:
	gofmt -w $(shell find . -name '*.go' -not -path './vendor/*')

test:
	go test ./...

migrate-up:
	migrate -path $(MIGRATIONS_DIR) -database "$(DATABASE_URL)" up

migrate-down:
	migrate -path $(MIGRATIONS_DIR) -database "$(DATABASE_URL)" down
