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
- Built for GitLab Pages deployment

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

### GitLab Pages

The project is configured for automatic deployment to GitLab Pages. Push to the default branch and GitLab CI will:

1. Install dependencies
2. Build the project
3. Deploy to GitLab Pages

Your site will be available at: `https://<username>.gitlab.io/<project-name>/`

### Manual deployment

```bash
npm run build
# Upload contents of dist/ folder to your hosting
```

## Project Structure

```
├── index.html          # Main HTML file
├── src/
│   ├── app.js          # Application logic
│   ├── main.js         # Core functions (config generation)
│   └── styles.css      # Styles
├── public/             # Static assets (if needed)
├── dist/               # Build output
├── package.json
├── vite.config.js
└── .gitlab-ci.yml
```

## License

MIT
