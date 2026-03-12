# XKeen Config Generator

Web application for generating proxy configurations from URLs (VLESS, VMess, Trojan, Shadowsocks).

## Features

- Generate configs from proxy URLs
- Support for multiple protocols:
  - VLESS (Reality, TLS, WS)
  - VMess
  - Trojan
  - Shadowsocks
- **Multi-language support** (Russian & English)
- **Built-in documentation** for beginners
- Dark/Light theme toggle
- Save configuration to JSON file
- Load configuration from JSON file
- Copy to clipboard
- Built for GitLab Pages & GitHub Pages deployment

## Quick Start

1. **Open the application** in your browser
2. **Click "📖 Documentation"** for detailed instructions
3. **Paste proxy link(s)** into the text field
4. **Click "🔧 Generate Config"**
5. **Copy or save** the resulting configuration

## 📖 Documentation

The application includes built-in documentation for beginners:

- Click the **"📖 Documentation"** button in the top bar
- Available in Russian (`docs/index.html`) and English (`docs/en.html`)
- Includes step-by-step instructions, examples, and troubleshooting

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

The `dist/` folder includes:
- `index.html` — main application
- `docs/index.html` — Russian documentation
- `docs/en.html` — English documentation
- `assets/` — CSS and JavaScript files

## License

MIT
