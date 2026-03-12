# XKeen Config Generator — Context Guide

## Project Overview

**XKeen Config Generator** is a Vue.js 3 web application for generating proxy configurations from URLs. It supports multiple proxy protocols and provides a clean UI for creating, saving, and loading JSON configurations.

**Key Features:**
- Parse proxy URLs: VLESS, VMess, Trojan, Shadowsocks
- Multiple URL import (one per line)
- Extract `tag` from URL parameters (`sid`, `remarks`) or hash fragment
- Dark/Light theme toggle
- Save configuration to JSON file
- Load configuration from JSON file
- Copy to clipboard
- Deployable to GitHub Pages and GitLab Pages

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Vue.js 3.5.29 |
| **Build Tool** | Vite 5.x |
| **Language** | JavaScript (ES6+), ESM modules |
| **Styling** | CSS3 with CSS variables |
| **Package Manager** | npm 9+ |

---

## Project Structure

```
XKeen-Config-Generator/
├── index.html              # Main HTML entry point
├── package.json            # Dependencies & scripts
├── vite.config.js          # Vite configuration
├── .gitlab-ci.yml          # GitLab CI/CD pipeline
├── .github/workflows/
│   └── deploy.yml          # GitHub Actions workflow
├── src/
│   ├── main.js             # Vue app bootstrap
│   ├── index.js            # Barrel exports for all modules
│   ├── styles.css          # Global styles with theme variables
│   ├── core/               # Parsing logic (Strategy + Factory patterns)
│   │   ├── BaseParser.js       # Abstract base class
│   │   ├── VmessParser.js      # VMess protocol parser
│   │   ├── VlessTrojanParser.js # VLESS/Trojan protocol parser
│   │   ├── ShadowsocksParser.js # Shadowsocks protocol parser
│   │   └── ParserFactory.js    # Factory for creating parsers
│   ├── services/           # Application services
│   │   ├── ConfigService.js      # Facade for config generation/loading
│   │   ├── NotificationService.js # Observer pattern for notifications
│   │   ├── ThemeService.js       # Singleton for theme management
│   │   ├── FileService.js        # File download operations
│   │   └── ClipboardService.js   # Clipboard copy operations
│   └── components/
│       └── App.vue         # Main Vue component (UI + logic)
└── dist/                   # Production build output
```

---

## Building and Running

### Prerequisites

- Node.js 18+
- npm 9+

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Starts Vite dev server on `http://localhost:3000` with hot reload.

### Build for Production

```bash
npm run build
```

Outputs minified files to `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Lint Code

```bash
npm run lint        # Check code
npm run lint:fix    # Auto-fix issues
```

---

## Development Conventions

### Code Style

- **Strict mode**: `'use strict'` in all modules
- **Variables**: Prefer `const`/`let` over `var`
- **Async**: Use `async/await` for asynchronous operations
- **Error handling**: Wrap operations in `try/catch` blocks
- **Documentation**: JSDoc comments for public APIs
- **No console.log**: Avoid in production code

### JSDoc Format

```javascript
/**
 * Brief one-line summary
 *
 * Detailed description.
 *
 * @param {Type} param - Description
 * @returns {Type} Return value description
 * @throws {ErrorType} When this occurs
 * @example
 * const result = parseConfig('ss://...');
 */
function functionName(param) {
  // ...
}
```

### Design Patterns

| Pattern | Implementation |
|---------|---------------|
| **Strategy** | `BaseParser` + concrete parser classes |
| **Factory** | `ParserFactory` creates appropriate parser |
| **Singleton** | `ThemeService.getInstance()` |
| **Observer** | `NotificationService.subscribe()` |
| **Facade** | `ConfigService` unifies all services |

### SOLID Principles

- **Single Responsibility**: Each class has one purpose
- **Dependency Injection**: Services injected via constructor
- **Encapsulation**: Private fields with `_` prefix

---

## Architecture Details

### Parser Flow

```
URL Input → ParserFactory → [VmessParser | VlessTrojanParser | ShadowsocksParser]
                              ↓
                        BaseParser (abstract)
                              ↓
                    ParseResult { config, warnings, success, error }
```

### Tag Extraction Priority

For proxy URLs, the `tag` is extracted in this order:

1. **Hash fragment** (URL title after `#`) — most readable
2. **`sid` parameter** — for VLESS/Trojan
3. **`remarks`/`ps` parameter** — for Shadowsocks/VMess
4. **Default** — `vless-reality`, `ss`, etc.

### ConfigService API

```javascript
// Generate from single URL
configService.generate(url)

// Generate from multiple URLs
configService.generateMultiple([url1, url2, ...])

// Load from JSON file
await configService.loadFromFile(file)

// Save to file
configService.saveToFile(filename)

// Copy to clipboard
await configService.copyToClipboard()

// Check if config exists
configService.hasConfig()
```

---

## Deployment

### GitHub Pages

1. Go to **Settings → Pages**
2. Set **Source** to "GitHub Actions"
3. Push to `main` branch

Available at: `https://<username>.github.io/<repository>/`

### GitLab Pages

1. Push to GitLab repository
2. CI/CD pipeline builds and deploys automatically

Available at: `https://<username>.gitlab.io/<project>/`

### Manual Deployment

```bash
npm run build
# Upload contents of dist/ to your hosting
```

---

## Supported Protocols

| Protocol | URL Format | Features |
|----------|------------|----------|
| **VLESS** | `vless://` | Reality, TLS, WebSocket |
| **VMess** | `vmess://` | Base64 payload |
| **Trojan** | `trojan://` | TLS |
| **Shadowsocks** | `ss://` | Base64 method:password |

---

## File Formats

### Input (Proxy URLs)

```
vless://uuid@host:port?security=reality&pbk=...&sid=...&sni=...#Tag Name
vmess://base64(json_config)
trojan://password@host:port?security=tls&sni=...#Tag Name
ss://base64(method:password)@host:port#Tag Name
```

### Output (JSON Configuration)

```json
{
  "outbounds": [
    {
      "tag": "proxy-tag",
      "protocol": "vless|vmess|trojan|shadowsocks",
      "settings": { ... },
      "streamSettings": { ... }
    },
    {
      "tag": "direct",
      "protocol": "freedom"
    },
    {
      "tag": "block",
      "protocol": "blackhole"
    }
  ]
}
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_VERSION` | Node.js version for CI | `20` |

---

## Git Ignore Patterns

```
node_modules/
dist/
public/
*.log
.DS_Store
Thumbs.db
.idea/
.vscode/
.env*
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/index.js` | Central barrel export for all modules |
| `src/core/BaseParser.js` | Abstract parser interface |
| `src/services/ConfigService.js` | Main facade for config operations |
| `src/components/App.vue` | Single-file Vue component (UI + logic) |
| `AGENTS.md` | Agent framework documentation for specialized tasks |

---

## Common Tasks

### Add New Protocol Parser

1. Create `src/core/NewProtocolParser.js` extending `BaseParser`
2. Implement `canParse(url)` and `parse(url)` methods
3. Register in `ParserFactory` constructor
4. Export in `src/index.js`

### Modify Tag Extraction

Edit `extractTag()` method in respective parser:
- `VlessTrojanParser.js`
- `VmessParser.js`
- `ShadowsocksParser.js`

### Add New Service

1. Create `src/services/NewService.js`
2. Inject into `ConfigService` constructor
3. Use in `App.vue` via dependency injection

---

## Troubleshooting

### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### ESLint Errors (v9+)

ESLint v9 requires `eslint.config.js`. If linting fails, check migration guide:
https://eslint.org/docs/latest/use/configure/migration-guide

### Theme Not Persisting

Check `ThemeService` localStorage key and browser permissions.

---

## License

MIT
