#!/bin/bash

# Trainer-Portal Database Backup Script
# Usage: ./backup.sh or docker exec trainer_db /backup.sh

BACKUP_DIR="/backups"
DB_NAME="trainer_portal"
DB_USER="postgres"
DB_HOST="localhost"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/trainer_portal_$TIMESTAMP.sql"
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
echo "Creating database backup..."
pg_dump -U $DB_USER -h $DB_HOST $DB_NAME > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✓ Backup created successfully: $BACKUP_FILE"
    
    # Compress backup
    gzip $BACKUP_FILE
    echo "✓ Backup compressed: ${BACKUP_FILE}.gz"
    
    # Remove old backups (older than RETENTION_DAYS)
    echo "Removing old backups (older than $RETENTION_DAYS days)..."
    find $BACKUP_DIR -name "trainer_portal_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    echo "✓ Cleanup completed"
else
    echo "✗ Backup failed!"
    exit 1
fi
