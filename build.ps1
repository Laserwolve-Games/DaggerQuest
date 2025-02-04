# Define paths
$downloadsFolder = [System.IO.Path]::Combine($env:USERPROFILE, "Downloads")
$zipFilePath = [System.IO.Path]::Combine($downloadsFolder, "DaggerQuest.zip")
$tempExtractPath = [System.IO.Path]::Combine($downloadsFolder, "DaggerQuest_Temp")

# Extract the ZIP file
if (Test-Path $tempExtractPath) {
    Remove-Item -Recurse -Force $tempExtractPath
}
Expand-Archive -Path $zipFilePath -DestinationPath $tempExtractPath

# Run Terser on all JS files and generate source maps in the Downloads folder
Get-ChildItem -Path $tempExtractPath -Recurse -Filter *.js | ForEach-Object {
  $inputFile = $_.FullName
  terser $inputFile -o $inputFile --compress --mangle --source-map
}

# Create the sourceMaps folder if it doesn't exist
$sourceMapsFolder = [System.IO.Path]::Combine($downloadsFolder, "sourceMaps")
if (-not (Test-Path $sourceMapsFolder)) {
    New-Item -ItemType Directory -Path $sourceMapsFolder
}

# Move all .map files to the sourceMaps folder
Get-ChildItem -Path $tempExtractPath -Recurse -Filter *.map | ForEach-Object {
    Move-Item -Path $_.FullName -Destination $sourceMapsFolder
}

# Zip the processed files back into DaggerQuest.zip without compression
if (Test-Path $zipFilePath) {
    Remove-Item -Force $zipFilePath
}
Compress-Archive -Path $tempExtractPath\* -DestinationPath $zipFilePath -CompressionLevel NoCompression

# Clean up temporary folder
Remove-Item -Recurse -Force $tempExtractPath