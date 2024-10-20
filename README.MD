## Fly

### Config

[See config at](https://fly.io/docs/reference/configuration/)

## Setup

````bash
fly login
fly status
fly apps create pils-app
## Create volume where sqlite db is persisted
fly volumes create data
## Configure fly app
fly launch --no-deploy
## Deploy fly app
fly deploy

# https://fly.io/docs/networking/custom-domain/
## Add domains
fly certs add pils.gataersamla.no

# I domeneshop A record: pils.gataersamla.no -> ipv4
# I domeneshop AAAA record: pils.gataersamla.no -> ipv6
```
````

## Get db from prod

### Fly columes and database

```bash
# Get database file from production
fly sftp get /data/sqlite.db db-backups/sqlite_20_10_2024_prod.db
fly sftp get /data/sqlite.db-wal db-backups/sqlite_20_10_2024_prod.db-wal
fly sftp get /data/sqlite.db-shm db-backups/sqlite_20_10_2024_prod.db-shm
# Connect to sftp shell and upload dump file
fly sftp shell
cd tmp
put dump.sql
# Connect via ssh to run sql
apt update
apt upgrade
apt install sqlite3
sqlite3 /data/sqlite.db < dump.sql
CTRL+D to quit ssh
```
