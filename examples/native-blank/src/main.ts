import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import "./style.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Native blank: #root not found");
}

root.innerHTML = `
  <main class="screen">
    <p class="badge">Native blank</p>
    <h1>WebView OK</h1>
    <p class="meta">Platform: <strong id="platform"></strong></p>
    <p class="meta">Native: <strong id="native"></strong></p>
    <p class="clock" id="clock" aria-live="polite"></p>
  </main>
`;

const platformEl = document.getElementById("platform");
const nativeEl = document.getElementById("native");
const clockEl = document.getElementById("clock");

if (platformEl) platformEl.textContent = Capacitor.getPlatform();
if (nativeEl) nativeEl.textContent = String(Capacitor.isNativePlatform());

function tick() {
  if (clockEl) clockEl.textContent = new Date().toLocaleTimeString();
}
tick();
window.setInterval(tick, 1000);

// Hide splash as soon as the shell paints (same handoff point we debug in demo).
void SplashScreen.hide().catch(() => {
  /* plugin optional on web */
});

// __PLUGIN_PROBE__
import '@capacitor-community/sqlite';
import '@capacitor/action-sheet';
import '@capacitor/app';
import '@capacitor/core';
import '@capacitor/device';
import '@capacitor/dialog';
import '@capacitor/filesystem';
import '@capacitor/inappbrowser';
import '@capacitor/keyboard';
import '@capacitor/network';
import '@capacitor/share';
import '@capacitor/splash-screen';
import '@capacitor/status-bar';
