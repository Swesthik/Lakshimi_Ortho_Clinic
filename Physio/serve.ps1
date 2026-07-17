# serve.ps1
# A lightweight PowerShell static file server for localhost:8000
# Press Ctrl+C in the terminal to stop the server.

$port = 8000
$localPath = Get-Item .
$url = "http://127.0.0.1:$port/"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)

try {
    $listener.Start()
    Write-Host "`n==================================================" -ForegroundColor Green
    Write-Host "  ReviveCMS Local Server Running!" -ForegroundColor Green
    Write-Host "  Access the site at: $url" -ForegroundColor Cyan
    Write-Host "  Serving files from: $($localPath.FullName)" -ForegroundColor DarkGray
    Write-Host "  To stop the server, press Ctrl+C in this window." -ForegroundColor Yellow
    Write-Host "==================================================`n" -ForegroundColor Green

    # Automatically open the browser to the local server URL
    Start-Process $url

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # Clean and construct path relative to the root directory
        $reqUrl = $request.Url.LocalPath
        if ($reqUrl -eq "/") {
            $reqUrl = "/index.html"
        }

        # URL decode path (for space character handling, etc.)
        $reqUrl = [Uri]::UnescapeDataString($reqUrl)
        $filePath = Join-Path $localPath.FullName $reqUrl

        # Verify that the resolved file path starts with the local directory path to prevent directory traversal
        if ((Test-Path $filePath -PathType Leaf) -and $filePath.StartsWith($localPath.FullName)) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mimeType = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".htm"  { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".gif"  { "image/gif" }
                ".svg"  { "image/svg+xml; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".ico"  { "image/x-icon" }
                default { "application/octet-stream" }
            }

            try {
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentType = $mimeType
                $response.ContentLength64 = $bytes.Length
                if ($request.HttpMethod -ne "HEAD") {
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }
            } catch {
                $response.StatusCode = 500
                $bytes = [System.Text.Encoding]::UTF8.GetBytes("500 Internal Server Error: $_")
                $response.ContentLength64 = $bytes.Length
                if ($request.HttpMethod -ne "HEAD") {
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }
            }
        } else {
            # Try to serve 404.html if it exists in the folder
            $notFoundPath = Join-Path $localPath.FullName "404.html"
            if (Test-Path $notFoundPath -PathType Leaf) {
                $response.StatusCode = 404
                $bytes = [System.IO.File]::ReadAllBytes($notFoundPath)
                $response.ContentType = "text/html; charset=utf-8"
                $response.ContentLength64 = $bytes.Length
                if ($request.HttpMethod -ne "HEAD") {
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }
            } else {
                $response.StatusCode = 404
                $bytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $response.ContentLength64 = $bytes.Length
                if ($request.HttpMethod -ne "HEAD") {
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }
            }
        }
        $response.Close()
    }
} catch {
    Write-Error $_
} finally {
    if ($listener.IsListening) {
        $listener.Stop()
    }
    $listener.Close()
}
