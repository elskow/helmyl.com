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

helmy@station01:~$ sudo cd ..
^C^C^C^C^Z^Z^Z^Z

sudo: unable to resolve host station01.infra.labrpl.net: Temporary failure in name resolution
sudo: cd: command not found
sudo: "cd" is a shell built-in command, it cannot be run directly.
sudo: the -s option may be used to run a privileged shell.
sudo: the -D option may be used to run a command in a specific directory.