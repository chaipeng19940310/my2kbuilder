import base64
import json
import os
import time
import urllib.request

from websocket import create_connection

BASE = os.environ.get("R24_BASE", "https://my2kbuilder.com")
CDP = "http://127.0.0.1:9222"
OUT = os.path.join(os.path.dirname(__file__), "evidence", "r24-mobile-first-fold")
os.makedirs(OUT, exist_ok=True)


def new_target():
    req = urllib.request.Request(f"{CDP}/json/new?about:blank", method="PUT")
    with urllib.request.urlopen(req) as response:
        return json.load(response)["webSocketDebuggerUrl"]


def measure(path, width, height, name, expression):
    ws = create_connection(new_target(), timeout=20, suppress_origin=True)
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

    call("Page.enable")
    call("Runtime.enable")
    call("Network.enable")
    call("Network.setCacheDisabled", {"cacheDisabled": True})
    call("Emulation.setDeviceMetricsOverride", {
        "width": width,
        "height": height,
        "deviceScaleFactor": 1,
        "mobile": width < 768,
        "screenWidth": width,
        "screenHeight": height,
    })
    call("Page.navigate", {"url": BASE + path})
    deadline = time.time() + 30
    while time.time() < deadline:
        state = call("Runtime.evaluate", {
            "expression": "document.readyState + ':' + Boolean(document.querySelector('main'))",
            "returnByValue": True,
        })["result"]["value"]
        if state == "complete:true":
            break
        time.sleep(0.2)
    time.sleep(1)
    result = call("Runtime.evaluate", {
        "expression": expression,
        "returnByValue": True,
    })["result"]["value"]
    shot = call("Page.captureScreenshot", {"format": "png", "captureBeyondViewport": False})
    screenshot = os.path.join(OUT, f"{name}-{width}x{height}.png")
    with open(screenshot, "wb") as handle:
        handle.write(base64.b64decode(shot["data"]))
    ws.close()
    return {"path": path, "viewport": [width, height], "screenshot": screenshot, **result}


COMMON = """
(() => {
  const rect = (el) => el ? (() => { const r=el.getBoundingClientRect(); return {top:Math.round(r.top),bottom:Math.round(r.bottom),left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width),height:Math.round(r.height)}; })() : null;
  const visible = (el) => el ? getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden' : false;
  const main = document.querySelector('main');
  const h1 = main.querySelector('h1');
  const descriptions = [...main.querySelectorAll(':scope > header p, :scope > p')];
  return {
    location: location.href,
    main: rect(main),
    mainGap: getComputedStyle(main).rowGap,
    mainPaddingTop: getComputedStyle(main).paddingTop,
    h1: rect(h1),
    h1FontSize: getComputedStyle(h1).fontSize,
    visibleDescriptions: descriptions.filter(visible).map(rect),
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    __EXTRA__
  };
})()
"""

planner_extra = """
sourceBanner: rect(document.querySelector('.mobile-compact-source-banner > div')),
positionTitle: rect(document.querySelector('#wizard-position-title')),
positionButtons: [...document.querySelectorAll('[data-wizard-step="1"] button')].slice(0,5).map((el) => ({...rect(el), disabled:el.disabled})),
firstButtonClickableInViewport: (() => { const el=document.querySelector('[data-wizard-step="1"] button'); const r=el.getBoundingClientRect(); return !el.disabled && r.top >= 0 && r.bottom <= innerHeight; })()
"""

blueprints_extra = """
sourceBanner: rect(document.querySelector('.mobile-compact-source-banner > div')),
filterPanel: rect(document.querySelector('[aria-label="Blueprint filters"]')),
firstCard: rect(document.querySelector('[id^="bp-"]')),
firstCardVisiblePixels: (() => { const el=document.querySelector('[id^="bp-"]'); if (!el) return 0; const r=el.getBoundingClientRect(); return Math.max(0, Math.min(innerHeight,r.bottom)-Math.max(0,r.top)); })()
"""

results = [
    measure('/badge-token-planner', 390, 844, 'planner-mobile', COMMON.replace('__EXTRA__', planner_extra)),
    measure('/signature-blueprints', 390, 844, 'blueprints-mobile', COMMON.replace('__EXTRA__', blueprints_extra)),
    measure('/badge-token-planner', 1440, 1000, 'planner-desktop', COMMON.replace('__EXTRA__', planner_extra)),
    measure('/signature-blueprints', 1440, 1000, 'blueprints-desktop', COMMON.replace('__EXTRA__', blueprints_extra)),
]
report = os.path.join(OUT, 'measurements.json')
with open(report, 'w', encoding='utf-8') as handle:
    json.dump(results, handle, indent=2)
print(json.dumps({"report": report, "results": results}, indent=2))
