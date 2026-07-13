# Colorless World v4 - asset downloader
# Run once before publish: ./download-assets.ps1
$ErrorActionPreference = "Stop"
$dir = Join-Path $PSScriptRoot "games/assets/red"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
$base = "https://d8j0ntlcm91z4.cloudfront.net/user_3CDdInAZ3lzdABhg4fMhB4IMF2V"
$files = @{
  # v4 cheerful set
  "title.webp"     = "hf_20260708_132040_06cf6bd3-30bc-4bb2-ac01-163099e515d6_min.webp"
  "d1.webp"        = "hf_20260708_132147_0f798a9a-5172-4ca6-9052-6364017e2872_min.webp"
  "d2.webp"        = "hf_20260708_132246_f6fb3eee-e6be-479b-9342-8c9c8bf7b06a_min.webp"
  "d3.webp"        = "hf_20260708_132343_837e0277-1b4b-4054-b61f-ed6dfaf0b5b1_min.webp"
  "d4.webp"        = "hf_20260708_132438_4fec5956-f78f-4c5d-a3f2-e44b8f300d16_min.webp"
  "d5.webp"        = "hf_20260708_132532_41ef5fc0-ec9f-46da-b0ae-33b63e0b57eb_min.webp"
  "s_vanity.webp"  = "hf_20260708_132627_4ed1b21e-8e6a-43f9-ac71-89c084873b5a_min.webp"
  "s_door.webp"    = "hf_20260708_132719_8d20bf52-27d0-41ca-8654-528aaa415777_min.webp"
  "reveal.webp"    = "hf_20260708_132813_be627def-2ea0-4019-974e-feb7602f6fee_min.webp"
  # kept from previous set (mood-neutral scenes)
  "s_station.webp" = "hf_20260708_120340_483de956-da02-402f-a9ad-d647f63694c1_min.webp"
  "ending.webp"    = "hf_20260708_120433_5cf960c0-198c-4dbf-b074-332e568eb07d_min.webp"
}
foreach ($k in $files.Keys) {
  $out = Join-Path $dir $k
  Write-Host "downloading $k ..."
  Invoke-WebRequest -Uri "$base/$($files[$k])" -OutFile $out
}
Write-Host "done. $($files.Count) files in games/assets/red"
