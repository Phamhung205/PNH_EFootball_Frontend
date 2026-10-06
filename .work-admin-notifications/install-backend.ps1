$ErrorActionPreference = 'Stop'
$taskBackend = 'E:\WEB PNH EFOOTBALL\PHH EFOOTBALL BACKEND\PHH EFOOTBALL BACKEND'
$taskHashes = Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'baseline-hashes.json') | ConvertFrom-Json
foreach ($taskRelative in @('Program.cs', 'Controllers/AuthController.cs', 'Data/AppDbContext.cs')) {
    $taskActual = (Get-FileHash -LiteralPath (Join-Path $taskBackend $taskRelative)).Hash
    if ($taskActual -ne $taskHashes.$taskRelative) { throw "Backend changed during preparation: $taskRelative" }
}
foreach ($taskRelative in @('Models/AdminActivityEvent.cs', 'Controllers/AdminNotificationsController.cs', 'Services/AdminNotificationService.cs')) {
    if (Test-Path -LiteralPath (Join-Path $taskBackend $taskRelative)) { throw "Refusing to replace an existing new file: $taskRelative" }
}
foreach ($taskRelative in @('Program.cs', 'Controllers/AuthController.cs', 'Data/AppDbContext.cs', 'Models/AdminActivityEvent.cs', 'Controllers/AdminNotificationsController.cs', 'Services/AdminNotificationService.cs')) {
    Copy-Item -LiteralPath (Join-Path $PSScriptRoot "backend/$taskRelative") -Destination (Join-Path $taskBackend $taskRelative)
}
Write-Output 'Installed notification backend source (6 files). No database changes executed.'
