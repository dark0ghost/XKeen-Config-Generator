# XKeen Config Generator

Web application for generating proxy configurations from URLs (VLESS, VMess, Trojan, Shadowsocks).

## Features

- Generate configs from proxy URLs
- Support for multiple protocols:
  - VLESS (Reality, TLS, WS)
  - VMess
  - Trojan
  - Shadowsocks
- Dark/Light theme toggle
- Save configuration to JSON file
- Copy to clipboard
- Built for GitLab Pages & GitHub Pages deployment

## Development

### Prerequisites

- Node.js 18+
- npm 9+

### Install dependencies

```bash
npm install
```

### Development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Lint code

```bash
npm run lint
```

## Deployment

### GitHub Pages

The project includes GitHub Actions workflow for automatic deployment:

1. Go to repository **Settings → Pages**
2. Set **Source** to "GitHub Actions"
3. Push to `main` branch

Your site will be available at: `https://<username>.github.io/<repository>/`

### GitLab Pages

The project includes `.gitlab-ci.yml` for automatic deployment:

1. Push to GitLab repository
2. CI/CD pipeline will build and deploy automatically

Your site will be available at: `https://<username>.gitlab.io/<project>/`

### Manual deployment

```bash
npm run build
# Upload contents of dist/ folder to your hosting
```

## Project Structure

```
├── index.html              # Main HTML file (entry point)
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions workflow
├── .gitlab-ci.yml          # GitLab CI/CD configuration
├── src/
│   ├── main.js             # Vue app entry point
│   ├── styles.css          # Global styles
│   ├── index.js            # Barrel exports
│   ├── core/               # Core parsing logic
│   │   ├── BaseParser.js       # Abstract base class
│   │   ├── VmessParser.js      # VMess parser
│   │   ├── VlessTrojanParser.js # VLESS/Trojan parser
│   │   ├── ShadowsocksParser.js # Shadowsocks parser
│   │   └── ParserFactory.js    # Factory pattern
│   ├── services/           # Application services
│   │   ├── ConfigService.js      # Facade for config generation
│   │   ├── NotificationService.js # Observer pattern
│   │   ├── ThemeService.js       # Singleton pattern
│   │   ├── FileService.js        # File operations
│   │   └── ClipboardService.js   # Clipboard operations
│   └── components/
│       └── App.vue         # Main Vue component
├── dist/                   # Build output
├── package.json
└── vite.config.js
```

## Architecture

### Design Patterns

| Pattern | Implementation |
|---------|---------------|
| **Strategy** | `BaseParser` + concrete parsers |
| **Factory** | `ParserFactory` creates parsers |
| **Singleton** | `ThemeService.getInstance()` |
| **Observer** | `NotificationService.subscribe()` |
| **Facade** | `ConfigService` unifies services |

### SOLID Principles

- **Single Responsibility**: Each class has one purpose
- **Dependency Injection**: Services injected into components
- **Encapsulation**: Private fields with `#` syntax

## License

MIT
