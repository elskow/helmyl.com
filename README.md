# helmyl.com

Personal website and interactive labs monorepo.

## Prerequisites

- Node.js >= 20.18.0
- pnpm >= 10.0.0

## Installation

```bash
pnpm install
```

## Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Project Structure

```
├── apps/                   # SvelteKit website
├── packages/               # Lab experiments
│   ├── rotating-donut/
│   └── space-shooter/
└── nx.json                 # Build configuration
```

## Technology Stack

- **Nx** - Build orchestration and caching
- **SvelteKit** - Web framework
- **pnpm** - Package manager
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

## Adding a New Lab

1. Create `packages/lab-name/` directory
2. Add `package.json` with dependencies
3. Add `project.json` with `"tags": ["type:lab"]`

The build system automatically includes it.

## Deployment

Build generates static output in `apps/build/` for deployment.