$files = Get-ChildItem -Path . -Filter *.html -Recurse
$files += Get-ChildItem -Path ./js -Filter *.js -Recurse
foreach ($f in $files) {
    $content = Get-Content $f.FullName -Raw -Encoding UTF8
    $content = $content.Replace([char]226 + [char]8218 + [char]185, '&#8377;')
    $content = $content.Replace("â‚¹", '&#8377;')
    $content = $content.Replace("â€”", '&mdash;')
    $content = $content.Replace("âˆ’", '&minus;')
    $content = $content.Replace("Ã—", '&times;')
    $content = $content.Replace("â„ž", '&#8471;')
    [System.IO.File]::WriteAllText($f.FullName, $content, [System.Text.Encoding]::UTF8)
}
