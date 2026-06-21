#!/bin/sh
set -eu

PROJECT_DIR="${PROJECT_DIR:-/data/wardrobe/api}"
BACKUP_DIR="${BACKUP_DIR:-/data/wardrobe/backups}"

cd "$PROJECT_DIR"
set -a
. ./.env
set +a

mkdir -p "$BACKUP_DIR"
base="$BACKUP_DIR/nest_admin_$(date +%Y%m%d_%H%M%S)"
sql_file="$base.sql"
file="$base.sql.gz"

if docker compose exec -T mysql \
  mysqldump --single-transaction --quick --lock-tables=false --no-tablespaces \
  -u"$MYSQL_USERNAME" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" > "$sql_file"; then
  gzip "$sql_file"
else
  rm -f "$sql_file"
  exit 1
fi

find "$BACKUP_DIR" -type f -name 'nest_admin_*.sql.gz' -mtime +7 -delete
chmod 600 "$file"
echo "$file"
