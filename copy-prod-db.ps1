# Automatically get the current date and format it
$dir = Join-Path -Path "db-backups" -ChildPath (Get-Date -Format "dd_MM_yyyy")

# Create the directory if it doesn't exist
if (-Not (Test-Path -Path $dir)) {
    New-Item -ItemType Directory -Path $dir
}

# Run the fly sftp get commands
fly sftp get /data/sqlite.db "$dir/sqlite.db"
fly sftp get /data/sqlite.db-wal "$dir/sqlite.db-wal"
fly sftp get /data/sqlite.db-shm "$dir/sqlite.db-shm"