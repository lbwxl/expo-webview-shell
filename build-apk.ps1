param(
  [switch]$Clean
)

$ErrorActionPreference = 'Stop'

function Resolve-FirstExistingPath {
  param(
    [string[]]$Candidates,
    [string]$Label
  )

  foreach ($candidate in ($Candidates | Where-Object { $_ -and $_.Trim() -ne '' } | Select-Object -Unique)) {
    if (Test-Path $candidate) {
      return $candidate
    }
  }

  throw "No valid $Label path found. Please install and configure it first."
}

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$androidDir = Join-Path $projectRoot 'android'
$gradleWrapper = Join-Path $androidDir 'gradlew.bat'
$apkPath = Join-Path $androidDir 'app\build\outputs\apk\release\app-release.apk'

if (!(Test-Path $gradleWrapper)) {
  throw "gradlew.bat not found: $gradleWrapper"
}

$javaHome = Resolve-FirstExistingPath -Candidates @(
  $env:JAVA_HOME,
  'C:\Program Files\Microsoft\jdk-17.0.19.10-hotspot',
  'C:\Program Files\Eclipse Adoptium\jdk-17',
  'C:\Program Files\Java\jdk-17'
) -Label 'JAVA_HOME'

$androidSdkRoot = Resolve-FirstExistingPath -Candidates @(
  $env:ANDROID_SDK_ROOT,
  "$env:LOCALAPPDATA\Android\Sdk",
  'C:\Android\Sdk'
) -Label 'ANDROID_SDK_ROOT'

$env:JAVA_HOME = $javaHome
$env:ANDROID_SDK_ROOT = $androidSdkRoot

$pathCandidates = @(
  (Join-Path $env:JAVA_HOME 'bin'),
  (Join-Path $env:ANDROID_SDK_ROOT 'cmdline-tools\latest\bin'),
  (Join-Path $env:ANDROID_SDK_ROOT 'platform-tools')
)

$pathSegments = $env:Path -split ';'
foreach ($segment in $pathCandidates) {
  if ((Test-Path $segment) -and -not ($pathSegments -contains $segment)) {
    $env:Path = "$segment;$env:Path"
    $pathSegments = $env:Path -split ';'
  }
}

Write-Host "Project root: $projectRoot"
Write-Host "JAVA_HOME: $env:JAVA_HOME"
Write-Host "ANDROID_SDK_ROOT: $env:ANDROID_SDK_ROOT"
Write-Host 'Starting release APK build...'

if ($Clean) {
  & $gradleWrapper -p $androidDir clean
}

& $gradleWrapper -p $androidDir assembleRelease

if (!(Test-Path $apkPath)) {
  throw "Build finished but APK not found: $apkPath"
}

$apk = Get-Item $apkPath
Write-Host ''
Write-Host 'APK build succeeded.'
Write-Host "Path: $($apk.FullName)"
Write-Host ("Size: {0:N2} MB" -f ($apk.Length / 1MB))
Write-Host "Timestamp: $($apk.LastWriteTime)"
