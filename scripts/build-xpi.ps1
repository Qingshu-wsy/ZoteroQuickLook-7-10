$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$distDirectory = Join-Path $projectRoot "dist"
$manifest = Get-Content (Join-Path $projectRoot "manifest.json") -Raw | ConvertFrom-Json
$archivePath = Join-Path $distDirectory "ZoteroQuicklook-$($manifest.version).xpi"

New-Item -ItemType Directory -Path $distDirectory -Force | Out-Null

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
if (Test-Path -LiteralPath $archivePath -PathType Leaf) {
    Remove-Item -LiteralPath $archivePath -Force
}

$archive = [System.IO.Compression.ZipFile]::Open(
    $archivePath,
    [System.IO.Compression.ZipArchiveMode]::Create
)

try {
    foreach ($name in @(
        "manifest.json",
        "bootstrap.js",
        "preferences.xhtml",
        "preferences.js",
        "icons/icon-48.png",
        "icons/icon-96.png"
    )) {
        $filePath = Join-Path $projectRoot $name
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
            $archive,
            $filePath,
            $name
        ) | Out-Null
    }
}
finally {
    $archive.Dispose()
}

Write-Output "Created $archivePath"
