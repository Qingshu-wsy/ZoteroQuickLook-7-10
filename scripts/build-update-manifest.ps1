param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern("^[^/]+/[^/]+$")]
    [string]$Repository
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$manifest = Get-Content (Join-Path $projectRoot "manifest.json") -Raw | ConvertFrom-Json
$zotero = $manifest.applications.zotero
$xpiName = "ZoteroQuicklook-$($manifest.version).xpi"
$update = @{
    addons = @{
        $zotero.id = @{
            updates = @(
                @{
                    version = $manifest.version
                    update_link = "https://github.com/$Repository/releases/download/v$($manifest.version)/$xpiName"
                    applications = @{
                        zotero = @{
                            strict_min_version = $zotero.strict_min_version
                            strict_max_version = $zotero.strict_max_version
                        }
                    }
                }
            )
        }
    }
}

$outputPath = Join-Path (Join-Path $projectRoot "dist") "updates.json"
$json = ConvertTo-Json -InputObject $update -Depth 10
$utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($outputPath, $json, $utf8WithoutBom)

Write-Output "Created $outputPath"
