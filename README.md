# helmyl.com

Personal website and interactive labs monorepo built with SvelteKit and various web technologies.

## 🏗️ Project Structure

```
├── apps/                    # Main SvelteKit application
│   ├── src/                # Source code
│   ├── static/             # Static assets
│   └── contents/           # Markdown content
├── packages/               # Lab experiments
│   ├── rotating-donut/     # WebGL rotating donut
│   └── space-shooter/      # Space shooter game
└── package.json           # Root package configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
pnpm install
```

### Development

```bash
# Start development server
pnpm dev

# Build all packages
pnpm build

# Preview production build
pnpm preview
```

## 📦 Packages

### Apps

- **apps**: Main SvelteKit website with blog, projects, and lab integrations

### Labs

- **@labs/rotating-donut**: WebGL-based rotating donut visualization
- **@labs/space-shooter**: Interactive space shooter game

## 🛠️ Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build all packages for production |
| `pnpm preview` | Preview production build |
| `pnpm clean` | Clean all build artifacts |
| `pnpm format` | Format code with Prettier |
| `pnpm lint` | Lint code with ESLint |
| `pnpm check` | Type check with Svelte |

## 🏗️ Architecture

This monorepo uses:

- **pnpm workspaces** for package management
- **SvelteKit** for the main application
- **Parcel** for lab package bundling
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Content Collections** for markdown processing

## 📝 Development Workflow

1. Labs are built independently in the `packages/` directory
2. Built labs are copied to `apps/static/labs/` during build
3. The main app generates metadata for lab integration
4. Everything is deployed as a static site

## 🚀 Deployment

The project is configured for static deployment. Run `pnpm build` to generate the production build in `apps/build/`.