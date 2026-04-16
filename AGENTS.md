# SiYuan Plugin Development Guide

## Project Structure

```
idx-tree-plugin/
├── index.js       # Main plugin entry (minified, edit source elsewhere)
├── index.css      # Plugin styles
├── plugin.json    # Plugin manifest
├── i18n/          # Internationalization
│   ├── en_US.json
│   └── zh_CN.json
├── icon.png       # 160x160px, max 20KB
└── preview.png    # 1024x768px, max 200KB
```

## Developer Commands

| Command | Purpose |
|---------|---------|
| `pnpm i` | Install dependencies |
| `pnpm run dev` | Real-time compilation |
| `pnpm run build` | Generate `package.zip` for release |

## Release Process

1. Run `pnpm run build` to generate `package.zip`
2. Create GitHub release with version tag
3. Upload `package.zip` as binary attachment
4. (First release only) PR to [bazaar](https://github.com/siyuan-note/bazaar) to add repo to `plugins.json`

## Critical Rules

- **File I/O**: Use SiYuan kernel API (`/api/file/*`), NOT `fs` or Node.js APIs. Direct file access causes sync issues and data corruption.
- **i18n**: Use `this.i18n.key` in code. Store translations in `i18n/*.json`. At minimum support English (`en_US.json`) and Chinese (`zh_CN.json`).
- **minAppVersion**: Must match or exceed the minimum SiYuan version in `plugin.json` (currently 3.6.4).

## API Reference

- Frontend API: https://github.com/siyuan-note/petal
- Backend API: https://github.com/siyuan-note/siyuan/blob/master/API.md

## Key Patterns

- Plugin extends `o.Plugin` class from siyuan module
- Use `this.addCommand()`, `this.addDock()`, `this.addTab()` for features
- Settings via `o.Setting` with `confirmCallback` for save
- Detect mobile: `const isMobile = getFrontend() === "mobile" || getFrontend() === "browser-mobile"`

## Code Location

The compiled `index.js` is minified. Development typically happens on a separate source file or the template repo, then synced here.