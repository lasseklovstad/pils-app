# Define the destination folder (inside the current directory)
$destinationFolder = Join-Path -Path "data-backups" -ChildPath (Get-Date -Format "dd_MM_yyyy")
if (!(Test-Path $destinationFolder)) {
    New-Item -ItemType Directory -Path $destinationFolder | Out-Null
}

# Get the list of files from Fly.io
$files = fly sftp find /data/media

# Loop through each file
foreach ($file in $files) {
    # Skip directories (directories don’t have an extension)
    if ($file -notmatch "\.[a-zA-Z0-9]+$") { continue }

    Write-Output "Downloading: $file"
    
    # Extract the subdirectory structure from /data/media
    $relativePath = $file -replace "^/data/media/", ""
    
    # Create the same subdirectory structure locally
    $localFilePath = "$destinationFolder\$relativePath"
    $localFolder = [System.IO.Path]::GetDirectoryName($localFilePath)

    # Check if the file already exists locally
    if (Test-Path $localFilePath) {
        Write-Output "Skipping (already exists): $relativePath"
        continue
    }

    if (!(Test-Path $localFolder)) {
        New-Item -ItemType Directory -Path $localFolder | Out-Null
    }

    # Download the file
    fly sftp get $file $localFilePath
}

Write-Output "All files have been downloaded to $destinationFolder"