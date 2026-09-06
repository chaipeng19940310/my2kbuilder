#!/usr/bin/env python3
import base64
import json
import os
import time
import urllib.request

from websocket import create_connection

BASE = "http://127.0.0.1:3000"
CDP = "http://127.0.0.1:9222"
OUT = os.path.dirname(__file__)


def new_target():
    request = urllib.request.Request(f"{CDP}/json/new?about:blank", method="PUT")
    with urllib.request.urlopen(request) as response:
        return json.load(response)["webSocketDebuggerUrl"]


def run(width, height, label):
    ws = create_connection(new_target(), timeout=30, suppress_origin=True)
    counter = 0

    def call(method, params=None):
        nonlocal counter
        counter += 1
        ws.send(json.dumps({"id": counter, "method": method, "params": params or {}}))
        while True:
            message = json.loads(ws.recv())
            if message.get("id") == counter:
                if "error" in message:
                    raise RuntimeError(message["error"])
                return message.get("result", {})

    def evaluate(expression):
        response = call("Runtime.evaluate", {
            "expression": expression,
            "returnByValue": True,
            "awaitPromise": True,
        })
        if "exceptionDetails" in response:
            raise RuntimeError(response["exceptionDetails"].get("text", "JavaScript evaluation failed"))
        return response.get("result", {}).get("value")

    def wait_for(expression, timeout=30):
        deadline = time.time() + timeout
        while time.time() < deadline:
            if evaluate(expression):
                return
            time.sleep(0.1)
        raise TimeoutError(expression)

    def click(expression):
        result = evaluate(f"(() => {{ const el = {expression}; if (!el || el.disabled) return false; el.click(); return true; }})()")
        if not result:
            raise RuntimeError(f"Unable to click: {expression}")
        time.sleep(0.15)

    def screenshot(name):
        data = call("Page.captureScreenshot", {
            "format": "png",
            "fromSurface": True,
            "captureBeyondViewport": False,
        })["data"]
        path = os.path.join(OUT, f"{label}-{name}.png")
        with open(path, "wb") as handle:
            handle.write(base64.b64decode(data))
        return path

    def measure(step):
        return evaluate(f"""
        (() => {{
          const rect = (el) => el ? (() => {{ const r = el.getBoundingClientRect(); return {{top:+r.top.toFixed(2),bottom:+r.bottom.toFixed(2),left:+r.left.toFixed(2),right:+r.right.toFixed(2),width:+r.width.toFixed(2),height:+r.height.toFixed(2)}}; }})() : null;
          const visible = (el) => el && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden';
          const nav = document.querySelector('nav[aria-label="Planner steps"]');
          const common = {{
            viewport: [innerWidth, innerHeight],
            scrollY,
            horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
            navigation: rect(nav),
            navigationInFold: visible(nav) && nav.getBoundingClientRect().top >= 0 && nav.getBoundingClientRect().bottom <= innerHeight,
          }};
          if ({step} === 2) {{
            const rows = [...document.querySelectorAll('[data-wizard-step="2"] button')];
            return {{...common,
              title: rect(document.querySelector('#wizard-priority-title')),
              rows: rows.map((el) => ({{label:el.textContent.trim(), pressed:el.getAttribute('aria-pressed'), ...rect(el)}})),
              allRowsInFold: rows.length === 6 && rows.every((el) => el.getBoundingClientRect().top >= 0 && el.getBoundingClientRect().bottom <= innerHeight),
            }};
          }}
          if ({step} === 3) {{
            const firstRow = document.querySelector('.badge-row');
            const actions = firstRow?.querySelector('.badge-actions');
            const add = firstRow?.querySelector('button[aria-label^="Assign a slot"]');
            return {{...common,
              title: rect(document.querySelector('#wizard-loadout-title')),
              budget: rect(document.querySelector('[data-wizard-step="3"] aside > div')),
              disclaimer: rect(document.querySelector('[data-wizard-step="3"] aside > div > p:last-child')),
              availableBadgesHeader: rect(document.querySelector('.badge-list')?.previousElementSibling),
              firstBadgeRow: rect(firstRow),
              firstBadgeActions: rect(actions),
              firstAddButton: rect(add),
              firstAddOperableInFold: Boolean(add && !add.disabled && add.getBoundingClientRect().top >= 0 && add.getBoundingClientRect().bottom <= innerHeight),
            }};
          }}
          const share = [...document.querySelectorAll('button')].find((el) => el.textContent.includes('Generate Share Link'));
          const card = document.querySelector('[data-wizard-step="4"] > div > div:last-child');
          return {{...common,
            title: rect(document.querySelector('#wizard-summary-title')),
            summaryCard: rect(card),
            loadoutSummary: rect(card?.querySelector('.border-y')),
            shareButton: rect(share),
            shareOperableInFold: Boolean(share && !share.disabled && share.getBoundingClientRect().top >= 0 && share.getBoundingClientRect().bottom <= innerHeight),
          }};
        }})()
        """)

    call("Page.enable")
    call("Runtime.enable")
    call("Network.enable")
    call("Network.setCacheDisabled", {"cacheDisabled": True})
    call("Network.setExtraHTTPHeaders", {"headers": {"x-forwarded-proto": "https"}})
    call("Emulation.setDeviceMetricsOverride", {
        "width": width,
        "height": height,
        "deviceScaleFactor": 1,
        "mobile": width < 768,
        "screenWidth": width,
        "screenHeight": height,
    })
    call("Emulation.setTouchEmulationEnabled", {"enabled": width < 768})
    call("Page.navigate", {"url": BASE + "/badge-token-planner"})
    wait_for("document.readyState === 'complete' && document.querySelector('.planner-wizard')?.dataset.step === '1'")
    time.sleep(0.5)

    interactions = {}
    click("document.querySelector('[data-wizard-step=\"1\"] button')")
    interactions["positionSelected"] = evaluate("document.querySelector('[data-wizard-step=\"1\"] button')?.getAttribute('aria-pressed') === 'true'")
    click("[...document.querySelectorAll('button')].find((el) => el.textContent.trim().startsWith('Next'))")
    wait_for("document.querySelector('.planner-wizard')?.dataset.step === '2'")
    evaluate("scrollTo(0, 0)")
    time.sleep(0.2)
    step2 = measure(2)
    step2["screenshot"] = screenshot("step2-priorities")

    click("document.querySelector('[data-wizard-step=\"2\"] button')")
    interactions["prioritySelected"] = evaluate("document.querySelector('[data-wizard-step=\"2\"] button')?.getAttribute('aria-pressed') === 'true'")
    click("[...document.querySelectorAll('button')].find((el) => el.textContent.trim().startsWith('Next'))")
    wait_for("document.querySelector('.planner-wizard')?.dataset.step === '3'")
    evaluate("scrollTo(0, 0)")
    time.sleep(0.2)
    step3 = measure(3)
    step3["screenshot"] = screenshot("step3-loadout")

    first_add_label = evaluate("document.querySelector('.badge-row button[aria-label^=\"Assign a slot\"]:not([disabled])')?.getAttribute('aria-label')")
    for _ in range(20):
        click("document.querySelector('.badge-row button[aria-label^=\"Assign a slot\"]:not([disabled])')")
    wait_for("[...document.querySelectorAll('button')].some((el) => el.textContent.trim().startsWith('Next') && !el.disabled)")
    interactions["assignedBadge"] = first_add_label
    interactions["slotsUsed"] = evaluate("document.querySelector('[aria-label$=\"slots used\"]')?.getAttribute('aria-label')")
    click("[...document.querySelectorAll('button')].find((el) => el.textContent.trim().startsWith('Next'))")
    wait_for("document.querySelector('.planner-wizard')?.dataset.step === '4'")
    evaluate("scrollTo(0, 0)")
    time.sleep(0.2)
    step4 = measure(4)
    step4["screenshot"] = screenshot("step4-summary")

    ws.close()
    return {"label": label, "interactions": interactions, "step2": step2, "step3": step3, "step4": step4}


results = [run(390, 844, "mobile-390x844"), run(1440, 900, "desktop-1440x900")]
report = os.path.join(OUT, "measurements.json")
with open(report, "w", encoding="utf-8") as handle:
    json.dump(results, handle, indent=2)
print(json.dumps({"report": report, "results": results}, indent=2))
