// Full-page screenshots of the local dashboard via headless Edge + CDP.
// Usage: node screenshots.mjs <outDir> <prefix> <session token printed by seed-synthetic.mjs>
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [outDir, prefix, sessionToken] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const edge = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const port = 9333, profile = mkdtempSync(join(tmpdir(), "edge-shot-"));
const proc = spawn(edge, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--hide-scrollbars", "--force-device-scale-factor=1", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 40 && !target; i++) { await sleep(500); try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === "page"); } catch {} }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send("Network.enable");
await send("Network.setCookie", { name: "sulukera_session", value: sessionToken, url: "http://localhost:3011/" });
const shots = [["desktop", 1440, 900, false], ["mobile", 390, 844, true]];
for (const [name, width, height, mobile] of shots) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await send("Page.navigate", { url: "http://localhost:3011/" });
  // Wait until the dashboard (or the old one, for "before" shots) has rendered its data.
  for (let i = 0; i < 40; i++) { await sleep(500); const r = await send("Runtime.evaluate", { expression: "!!document.querySelector('.oh-body .oh-panel, .home-lower-grid')", returnByValue: true }); if (r.result.result.value) break; }
  await sleep(1500);
  const { result } = await send("Runtime.evaluate", { expression: "Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)", returnByValue: true });
  const h = result.result.value;
  await send("Emulation.setDeviceMetricsOverride", { width, height: h, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await sleep(1200);
  const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  writeFileSync(join(outDir, `${prefix}-${name}.png`), Buffer.from(shot.result.data, "base64"));
  console.log(`${prefix}-${name}.png ${width}x${h}`);
}
ws.close();
// Edge forks renderer/GPU children; kill the whole tree or they leak.
spawnSync("taskkill", ["/PID", String(proc.pid), "/T", "/F"], { stdio: "ignore" });
const tag = profile.split(/[\\/]/).pop();
spawnSync("powershell", ["-NoProfile", "-Command", `Get-CimInstance Win32_Process -Filter "Name='msedge.exe'" | ? { $_.CommandLine -like '*${tag}*' } | % { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`], { stdio: "ignore" });
await sleep(1000);
rmSync(profile, { recursive: true, force: true });
