# Resume Ghana EMS - one click.
# Launches Figma if needed, focuses it, runs the Ghana EMS Screen Generator plugin
# (same as Ctrl+Alt+P), then saves a proof screenshot into the repo.

$ErrorActionPreference = 'Continue'
$repo   = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$outPng = Join-Path $repo 'prototypes\figma-last-run.png'

Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class RG {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int c);
  [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr h);
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h, IntPtr a, int x, int y, int cx, int cy, uint f);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr dc, uint f);
  [DllImport("user32.dll")] public static extern IntPtr PostMessage(IntPtr h, uint m, IntPtr w, IntPtr l);
  public struct RECT { public int Left, Top, Right, Bottom; }
}
"@

function Say($m) { Write-Host $m }

# 1. find or start Figma
$figma = Get-Process Figma -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
if (-not $figma) {
  $candidates = @(
    "$env:LOCALAPPDATA\Figma\Figma.exe",
    "$env:LOCALAPPDATA\Programs\Figma\Figma.exe"
  ) + (Get-ChildItem "$env:LOCALAPPDATA\Figma" -Recurse -Filter Figma.exe -Depth 2 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName)
  $exe = $candidates | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
  if (-not $exe) { Say "Figma not found."; exit 1 }
  Say "Starting Figma..."
  Start-Process $exe
  for ($i = 0; $i -lt 40; $i++) {
    Start-Sleep -Seconds 1
    $figma = Get-Process Figma -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
    if ($figma) { break }
  }
}
if (-not $figma) { Say "Figma window never appeared."; exit 1 }

$h = $figma.MainWindowHandle
Say "Figma found (hwnd $h)."

# 2. restore + focus
if ([RG]::IsIconic($h)) { [RG]::ShowWindow($h, 9) | Out-Null; Start-Sleep 2 }
[RG]::ShowWindow($h, 3) | Out-Null
Start-Sleep 1
[RG]::SetForegroundWindow($h) | Out-Null
Start-Sleep 2

# 3. run last plugin  (Ctrl+Alt+P)
[RG]::PostMessage($h, 0x0100, [IntPtr]0x11, [IntPtr]0x011D0001) | Out-Null; Start-Sleep -Milliseconds 150
[RG]::PostMessage($h, 0x0100, [IntPtr]0x12, [IntPtr]0x01120001) | Out-Null; Start-Sleep -Milliseconds 150
[RG]::PostMessage($h, 0x0100, [IntPtr]0x50, [IntPtr]0x00500001) | Out-Null; Start-Sleep -Milliseconds 150
[RG]::PostMessage($h, 0x0101, [IntPtr]0x50, [IntPtr]0xC0500001) | Out-Null; Start-Sleep -Milliseconds 120
[RG]::PostMessage($h, 0x0101, [IntPtr]0x12, [IntPtr]0xC0120001) | Out-Null; Start-Sleep -Milliseconds 120
[RG]::PostMessage($h, 0x0101, [IntPtr]0x11, [IntPtr]0xC01D0001) | Out-Null
Say "Ctrl+Alt+P sent - plugin generating frames..."

# 4. wait, then grab a proof screenshot
Start-Sleep 40
$r = New-Object 'RG+RECT'
[RG]::GetWindowRect($h, [ref]$r) | Out-Null
$w = $r.Right - $r.Left
$hh = $r.Bottom - $r.Top
if ($w -gt 0 -and $hh -gt 0) {
  $bmp = New-Object System.Drawing.Bitmap $w, $hh
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $hdc = $g.GetHdc()
  [RG]::PrintWindow($h, $hdc, 2) | Out-Null
  $g.ReleaseHdc($hdc)
  $bmp.Save($outPng)
  $g.Dispose(); $bmp.Dispose()
  Say "Proof screenshot saved: $outPng"
}

Add-Type -AssemblyName System.Windows.Forms
$null = [System.Windows.Forms.MessageBox]::Show(
  'Plugin run triggered. Look for 7 frames on the canvas plus a white ZZ-DIAG report frame. A proof screenshot was saved to prototypes\figma-last-run.png. If ZZ-DIAG lists errors, send me its text.',
  'Ghana EMS - resume',
  'OK',
  'Information')