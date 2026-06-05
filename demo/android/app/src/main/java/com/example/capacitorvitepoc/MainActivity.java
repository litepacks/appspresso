package com.example.capacitorvitepoc;

import android.os.Bundle;
import android.webkit.WebView;
import androidx.annotation.Nullable;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import org.json.JSONObject;

/**
 * With {@code statusBar.hidden: true}, the Capacitor StatusBar plugin alone may not be enough;
 * WebView scrolling / focus can bring the bar back. When {@code plugins.StatusBar._appspressoAndroidImmersive}
 * (capacitor.config) is enabled, we re-hide the bar via WindowInsets.
 */
public class MainActivity extends BridgeActivity {

  @Nullable private Boolean immersiveFromConfig;
  private boolean webScrollListenerAttached;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    // Maestro `androidWebViewHierarchy: devtools` needs a debuggable WebView.
    WebView.setWebContentsDebuggingEnabled(true);
    super.onCreate(savedInstanceState);
    if (!shouldImmersiveStatusBar()) {
      return;
    }
    getWindow()
        .getDecorView()
        .post(
            () -> {
              applyImmersiveStatusBar();
              attachWebViewScrollRehide();
            });
  }

  @Override
  public void onResume() {
    super.onResume();
    if (!shouldImmersiveStatusBar()) {
      return;
    }
    applyImmersiveStatusBar();
    attachWebViewScrollRehide();
  }

  @Override
  public void onWindowFocusChanged(boolean hasFocus) {
    super.onWindowFocusChanged(hasFocus);
    if (hasFocus && shouldImmersiveStatusBar()) {
      applyImmersiveStatusBar();
    }
  }

  private boolean shouldImmersiveStatusBar() {
    if (immersiveFromConfig == null) {
      immersiveFromConfig = readImmersiveFlagFromAssets();
    }
    return immersiveFromConfig;
  }

  private boolean readImmersiveFlagFromAssets() {
    try (InputStream is = getAssets().open("capacitor.config.json")) {
      ByteArrayOutputStream bos = new ByteArrayOutputStream();
      byte[] buf = new byte[4096];
      int n;
      while ((n = is.read(buf)) != -1) {
        bos.write(buf, 0, n);
      }
      String json = bos.toString(StandardCharsets.UTF_8.name());
      JSONObject root = new JSONObject(json);
      JSONObject plugins = root.optJSONObject("plugins");
      if (plugins == null) {
        return false;
      }
      JSONObject statusBar = plugins.optJSONObject("StatusBar");
      return statusBar != null && statusBar.optBoolean("_appspressoAndroidImmersive", false);
    } catch (Exception e) {
      return false;
    }
  }

  private void applyImmersiveStatusBar() {
    WindowInsetsControllerCompat c =
        WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
    if (c == null) {
      return;
    }
    c.hide(WindowInsetsCompat.Type.statusBars());
    c.setSystemBarsBehavior(
        WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
  }

  private void attachWebViewScrollRehide() {
    if (webScrollListenerAttached || getBridge() == null) {
      return;
    }
    WebView w = getBridge().getWebView();
    if (w == null) {
      return;
    }
    webScrollListenerAttached = true;
    w.setOnScrollChangeListener(
        (v, scrollX, scrollY, oldScrollX, oldScrollY) -> applyImmersiveStatusBar());
  }
}
