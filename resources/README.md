# App assets (template)

Placeholder `icon.png` and `splash.png` are minimal 1×1 PNGs. For production:

1. Replace with real artwork (recommended: 1024×1024 icon, 2732×2732 splash).
2. Generate platform assets: `npx @capacitor/assets generate` (see [Capacitor Assets](https://capacitorjs.com/docs/guides/assets)).
3. Run `npm run build && npx cap sync` after changes.
