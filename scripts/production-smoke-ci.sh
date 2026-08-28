#!/usr/bin/env bash
# CI post-deploy smoke — runs against the workers.dev production URL after deploy.
set -euo pipefail
BASE="https://my2kbuilder-production.chaipeng1994.workers.dev"
fail=0
for pair in "/ 200" "/badge-token-planner 200" "/badge-requirements 200" "/takeover-requirements 200" "/cap-breakers 200" "/signature-blueprints 200" \
  "/signature-blueprints/by-position 200" "/signature-blueprints/compare 200" "/build-card 200" "/methodology 200" \
  "/disclaimer 200" "/privacy 200" "/terms 200" "/robots.txt 200" \
  "/sitemap.xml 200" "/definitely-not-a-route 404"; do
  path="${pair% *}"; want="${pair##* }"
  code=""
  # R12I-C: Workers Assets propagation for a brand-new route can lag the
  # deploy by a few seconds (observed 2026-08-28: /badge-requirements 404'd
  # in smoke, then 200 moments later). Retry only that exact race
  # (want=200 but got=404); every other mismatch fails immediately.
  for attempt in 1 2 3 4 5 6; do
    code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 30 "$BASE$path")"
    if [ "$code" = "$want" ] || [ "$code" != "404" ] || [ "$want" != "200" ]; then break; fi
    [ "$attempt" -lt 6 ] && sleep 10
  done
  if [ "$code" = "$want" ]; then echo "PASS $code $path"; else echo "FAIL got=$code want=$want $path"; fail=1; fi
done
# sitemap must point at canonical host
curl -sS --max-time 30 "$BASE/sitemap.xml" | grep -q "<loc>https://my2kbuilder.com/</loc>" \
  && echo "PASS sitemap canonical host" || { echo "FAIL sitemap canonical host"; fail=1; }
# robots must advertise sitemap
curl -sS --max-time 30 "$BASE/robots.txt" | grep -q "Sitemap: https://my2kbuilder.com/sitemap.xml" \
  && echo "PASS robots sitemap line" || { echo "FAIL robots sitemap line"; fail=1; }
exit "$fail"
