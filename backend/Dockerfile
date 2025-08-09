# Stage 1: Build the Go application
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Copy go.mod and go.sum to download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o /main ./cmd/server

# Stage 2: Create the final image
FROM alpine:latest

WORKDIR /root/

# Copy the built executable from the builder stage
COPY --from=builder /main .

# Expose port 8180
EXPOSE 8180

# Run the application
CMD ["./main"]
