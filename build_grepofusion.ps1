<# ======================================================================
  GrepoFusion – build script (1.5.0.2)
  - generuje ZIP paczkę z assets/, userscripts/, docs/, dist/
  - łagodny git (opcjonalnie)
====================================================================== #>

param(
  [string]$RepoRoot = (Get-Location).Path
)

function Log([string]$msg){
  $ts = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
  Write-Host "$ts  $msg" -ForegroundColor Cyan
}
function EnsureDir($p){ if(-not (Test-Path $p)){ New-Item -ItemType Directory -Path $p | Out-Null } }

$OutZip = Join-Path $RepoRoot ("GrepoFusion-1.5.0.2.zip")
$Tmp    = Join-Path $RepoRoot ("_pkg_{0}" -f ([Guid]::NewGuid().ToString('N')))

try{
  EnsureDir $Tmp
  @('assets','userscripts','docs','dist') | ForEach-Object {
    $src = Join-Path $RepoRoot $_
    if(Test-Path $src){ Copy-Item $src -Destination $Tmp -Recurse }
  }
  Add-Type -AssemblyName 'System.IO.Compression.FileSystem'
  if(Test-Path $OutZip){ Remove-Item $OutZip -Force -ErrorAction SilentlyContinue }
  [IO.Compression.ZipFile]::CreateFromDirectory($Tmp, $OutZip)
  Remove-Item $Tmp -Recurse -Force
  Log ("ZIP: " + $OutZip)
  Log ("SHA-256: " + (Get-FileHash -Algorithm SHA256 $OutZip).Hash)
} catch {
  Write-Host ("ZIP ERR: " + $_.Exception.Message) -ForegroundColor Red
}

# git (opcjonalnie)
try{
  & git add -A | Out-Null
  & git commit -m "GrepoFusion 1.5.0.2: package build" | Out-Null
  & git push | Out-Null
  Log "git push ✓"
} catch {
  Write-Host ("GIT WARN: " + $_.Exception.Message) -ForegroundColor Yellow
}

Log "DONE ✓"
