$Base = "http://localhost:4000/api"
$Pass = "Password123!"
$Email = "e2e$(Get-Random)@example.com"
$script:Fail = 0
$script:Pass = 0
$script:token = $null

function Check($label, $cond) {
  if ($cond) { $script:Pass++; Write-Host "PASS: $label" -ForegroundColor Green }
  else { $script:Fail++; Write-Host "FAIL: $label" -ForegroundColor Red }
}

function Req($method, $path, $body) {
  $params = @{ Uri="$Base$path"; Method=$method; UseBasicParsing=$true; ContentType="application/json" }
  if ($script:token) { $params.Headers = @{ Authorization="Bearer $script:token" } }
  if ($body -and $body.Count -gt 0) { $params.Body = $body | ConvertTo-Json -Depth 10 }
  $status = 0; $content = $null
  try {
    $r = Invoke-WebRequest @params -ErrorAction Stop
    $status = $r.StatusCode
    $content = $r.Content
  } catch {
    $resp = $_.Exception.Response
    if ($resp) { $status = [int]$resp.StatusCode; $sr = New-Object System.IO.StreamReader($resp.GetResponseStream()); $content = $sr.ReadToEnd(); $sr.Close() }
    else { $status = 0; $content = $_.Exception.Message }
  }
  return @{ status=$status; content=$content }
}
function J($c) { if ($c.content) { $c.content | ConvertFrom-Json } else { $null } }

# Register + login + profile
$r = Req "POST" "/auth/register" @{ name="E2E User"; email=$Email; password=$Pass }
Check("register 201", $r.status -eq 201)
$script:token = (J($r)).accessToken
Check("has token", $null -ne $script:token)

$r = Req "PUT" "/profile" @{ countryOfResidence="United States"; residencyStatus="NRI"; investmentObjectives=@("Long-term wealth creation"); riskPreference="Moderate"; investmentAmountRange="₹50 lakh - ₹1 crore"; repatriationPreference="Prefer full repatriation where legally permitted"; existingBanking=@("NRE account") }
Check("profile PUT 200", $r.status -eq 200)

# Full matrix: US NRI across all 9 categories
$categories = @("Indian Mutual Funds","Listed Indian Equities","Exchange-Traded Funds (ETFs)","IPOs","Government Securities and Bonds","Fixed Deposits","Real Estate","REITs and InvITs","GIFT City Investment Products")
$expected = @{
  "Indian Mutual Funds" = "POTENTIALLY_ELIGIBLE";
  "Listed Indian Equities" = "VERIFICATION_REQUIRED";
  "Exchange-Traded Funds (ETFs)" = "VERIFICATION_REQUIRED";
  "IPOs" = "VERIFICATION_REQUIRED";
  "Government Securities and Bonds" = "POTENTIALLY_ELIGIBLE";
  "Fixed Deposits" = "POTENTIALLY_ELIGIBLE";
  "Real Estate" = "VERIFICATION_REQUIRED";
  "REITs and InvITs" = "POTENTIALLY_ELIGIBLE";
  "GIFT City Investment Products" = "VERIFICATION_REQUIRED";
}
Write-Host "=== US NRI Category Matrix ===" -ForegroundColor Cyan
foreach ($c in $categories) {
  $r = Req "POST" "/eligibility/check" @{ category=$c }
  Check("$c returns 200", $r.status -eq 200)
  $chk = J($r)
  if ($chk) {
    $ok = $chk.overallOutcome -eq $expected[$c]
    Check("$c => $($chk.overallOutcome) (expected $($expected[$c]))", $ok)
    Check("$c has illustrative results", $chk.results.Count -gt 0 -and $chk.results[0].isIllustrative -eq $true)
  }
}

# Cross-country tests
Write-Host "=== Cross-Country/Status Tests ===" -ForegroundColor Cyan
$tests = @(
  @{ country="Canada"; status="NRI"; cat="Indian Mutual Funds"; expected="VERIFICATION_REQUIRED" },
  @{ country="United Kingdom"; status="OCI"; cat="Listed Indian Equities"; expected="POTENTIALLY_ELIGIBLE" },
  @{ country="Other"; status="NRI"; cat="Indian Mutual Funds"; expected="INSUFFICIENT_INFO" },
  @{ country="United States"; status="OTHER"; cat="Listed Indian Equities"; expected="POTENTIAL_RESTRICTION" },
  @{ country="United States"; status="OCI"; cat="Fixed Deposits"; expected="POTENTIALLY_ELIGIBLE" },
  @{ country="Singapore"; status="NRI"; cat="Real Estate"; expected="VERIFICATION_REQUIRED" },
  @{ country="Australia"; status="NRI"; cat="GIFT City Investment Products"; expected="VERIFICATION_REQUIRED" },
  @{ country="United Arab Emirates"; status="NRI"; cat="REITs and InvITs"; expected="POTENTIALLY_ELIGIBLE" },
  @{ country="Canada"; status="NRI"; cat="IPOs"; expected="VERIFICATION_REQUIRED" },
  @{ country="United States"; status="NRI"; cat="Fixed Deposits"; expected="POTENTIALLY_ELIGIBLE" }
)
$tests = $tests | Where-Object { $_ }
foreach ($test in $tests) {
  $r = Req "PUT" "/profile" @{ countryOfResidence=$test.country; residencyStatus=$test.status; investmentObjectives=@("Long-term wealth creation"); riskPreference="Moderate"; investmentAmountRange="₹50 lakh - ₹1 crore"; repatriationPreference="Prefer full repatriation where legally permitted"; existingBanking=@("NRE account") }
  $r = Req "POST" "/eligibility/check" @{ category=$test.cat }
  $chk = J($r)
  if ($chk) {
    $ok = $chk.overallOutcome -eq $test.expected
    Check("$($test.country) | $($test.status) | $($test.cat) => $($chk.overallOutcome) (expected $($test.expected))", $ok)
  } else {
    Check("$($test.country) | $($test.status) | $($test.cat) => no result", $false)
  }
}

# Authz: non-admin accessing admin endpoint
Write-Host "=== Authorization ===" -ForegroundColor Cyan
$r = Req "GET" "/admin/unresolved-checks"
Check("non-admin admin endpoint 403", $r.status -eq 403)

# Admin login
$r = Req "POST" "/auth/login" @{ email="admin@nrisimplifier.local"; password="AdminChangeMe123!" }
Check("admin login 200", $r.status -eq 200)
$adminToken = (J($r)).accessToken
$script:token = $adminToken
$r = Req "GET" "/admin/unresolved-checks"
Check("admin admin endpoint 200", $r.status -eq 200)

Write-Host ""
Write-Host "PASSED: $($script:Pass)  FAILED: $($script:Fail)" -ForegroundColor Cyan
if ($script:Fail -eq 0) { Write-Host "ALL E2E TESTS PASSED" -ForegroundColor Green } else { Write-Host "$($script:Fail) TEST(S) FAILED" -ForegroundColor Red }
exit $script:Fail
