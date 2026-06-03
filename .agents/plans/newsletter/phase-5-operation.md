# Phase 5: Operational & Deployment Specification

This document details the configurations, automation triggers, environment controls, and telemetry systems required to run the backend components of **ai chronicle hub** in production.

---

## 1. Containerization & Orchestration

We use a multi-stage Docker build to build the Go systematic crawler and run it concurrently with the Python Antigravity SDK curation agent.

### Multi-Stage Dockerfile (`Dockerfile`)
```dockerfile
# --- Stage 1: Build Go Crawler ---
FROM golang:1.20-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY scraper.go ./
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o scraper scraper.go

# --- Stage 2: Curation Engine Runtime Environment ---
FROM python:3.10-alpine
WORKDIR /app

# Install Chromium/Webdriver for curation agent browsing tasks
RUN apk add --no-cache curl chromium chromium-chromedriver bash

# Ingest built Go scraper binary
COPY --from=builder /app/scraper ./scraper

# Ingest Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Ingest application files & resources
COPY index.html styles.css app.js curator.py run_pipeline.sh sources.json ./
COPY data/ ./data/
COPY assets/ ./assets/

# Configure Permissions
ENV PORT=8080
ENV CHROMIUM_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/lib/chromium/
RUN chmod +x scraper run_pipeline.sh

# Expose port (served via standard python webserver)
EXPOSE 8080
CMD ["python3", "-m", "http.server", "8080"]
```

### Local Docker Compose (`docker-compose.yml`)
```yaml
version: '3.8'

services:
  ai-chronicle-hub:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    volumes:
      - ./data:/app/data
      - ./assets/sculptures:/app/assets/sculptures
    restart: unless-stopped
```

---

## 2. Orchestration & Kubernetes Specifications

### Kubernetes Deployment Config (`k8s-deployment.yaml`)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-chronicle-hub
  namespace: default
  labels:
    app: ai-chronicle-hub
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ai-chronicle-hub
  template:
    metadata:
      labels:
        app: ai-chronicle-hub
    spec:
      containers:
      - name: main-app
        image: gcr.io/ai-chronicle-hub/app:latest
        ports:
        - containerPort: 8080
        resources:
          limits:
            cpu: "1000m"
            memory: "1024Mi"
          requests:
            cpu: "500m"
            memory: "512Mi"
        env:
        - name: GEMINI_API_KEY
          valueFrom:
            secretKeyRef:
              name: gemini-secrets
              key: api-key
        volumeMounts:
        - name: database-volume
          mountPath: /app/data
        - name: assets-volume
          mountPath: /app/assets/sculptures
      volumes:
      - name: database-volume
        persistentVolumeClaim:
          claimName: data-pvc
      - name: assets-volume
        persistentVolumeClaim:
          claimName: assets-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: ai-chronicle-hub-service
spec:
  type: ClusterIP
  ports:
  - port: 8080
    targetPort: 8080
  selector:
    app: ai-chronicle-hub
```

---

## 3. Scheduled Triggers & Background Automations

The pipeline runs as an autonomous scheduled cron job inside the runtime environment.

### Trigger Schedule
- The pipeline execution script `run_pipeline.sh` is triggered automatically by the host system or Antigravity scheduled task manager:
  ```text
  0 0 * * 1 /bin/bash /app/run_pipeline.sh >> /app/data/telemetry.log 2>&1
  ```
  *(Triggers once a week, every Monday at 00:00 local time).*

### Pipeline Ingestion Script (`run_pipeline.sh`)
```bash
#!/bin/bash
set -e

# Define lock file directory
LOCK_FILE="/tmp/curator.lock"

# Assert that no current execution is running
if [ -f "$LOCK_FILE" ]; then
    echo "Warning: curator lock file exists. Execution aborted."
    exit 1
fi

# Set lock
touch "$LOCK_FILE"

# Clean exit handler to remove locks on completion or crash
trap 'rm -f "$LOCK_FILE"' EXIT

echo "Starting Ingestion Pipeline..."

# 1. Run systematic preset & spider crawl (Go Crawler)
./scraper

# 2. Run Python agent curation & sculpture generation
python3 curator.py

echo "Ingestion Pipeline Completed Successfully."
```

---

## 4. Run locks, Telemetry & Self-Healing

### Concurrency Lock Control
- To prevent overlapping crawls or write conflicts, a `/tmp/curator.lock` file is touched at the start of `run_pipeline.sh` and cleaned on exit. If the file is found at startup, the system aborts execution.

### Telemetry logging
- `curator.py` outputs runtime errors and success status reports to a localized file: `data/telemetry.log`.
- In the event of API limitations (HTTP 429) or remote domain access blockages, the agent logs an entry, registers a clean fail-safe exit state, and leaves the JSON database files uncorrupted.

### Self-Healing Recalculation
- If `data/index.js` gets corrupted or deleted, the curation engine runs a rebuild sequence. It traverses the `data/` subdirectory, scans for `data-*.json` files, rebuilds the list of editions, and re-writes the index configuration file automatically to restore frontend selection functionality.


