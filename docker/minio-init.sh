#!/bin/sh
set -e
sleep 3
mc alias set local http://minio:9000 minioadmin minioadmin
mc mb -p local/media || true
mc anonymous set none local/media || true
