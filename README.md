<div align="center">
  <a href="https://github.com/Mezdia/En-passant">
    <img width="115" height="115" src="https://github.com/Mezdia/En-passant/blob/master/src-tauri/icons/icon.png" alt="Logo">
  </a>

<h3 align="center">En-passant</h3>

  <p align="center">
    The Ultimate Chess Toolkit
    <br />
    <a href="https://www.enpassant.ir"><strong>enpassant.ir</strong></a>
    <br />
    <br />
    <a href="https://www.enpassant.ir/download">Download</a>
    .
    <a href="https://www.enpassant.ir/docs">Explore the docs</a>
  </p>
</div>

En-passant is an open-source, cross-platform chess GUI that aims to be powerful, customizable and easy to use.

## Features

- Store and analyze your games from [lichess.org](https://lichess.org) and [chess.com](https://chess.com)
- Multi-engine analysis. Supports all UCI engines
- Prepare a repertoire and train it with spaced repetition
- Simple engine and database installation and management
- Absolute or partial position search in the database

<img src="https://github.com/Mezdia/encroisssant-site/blob/master/assets/showcase.webp" />

## Quick Start

```bash
# Clone the repository
git clone https://github.com/Mezdia/En-passant.git
cd En-passant

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Mantine v7
- **State Management**: Jotai
- **Chess Engine**: Chessground, Chessops
- **Desktop Framework**: Tauri v2 (Rust backend)
- **Testing**: Vitest + jsdom
- **Linting/Formatting**: Biome
- **Package Manager**: pnpm

## Commands

### Development
```bash
pnpm dev          # Start development server with hot reload
pnpm start-vite   # Start Vite dev server directly
```

### Building
```bash
pnpm build              # Build for production (all platforms)
pnpm build:no-bundle    # Build without bundling
pnpm build:windows      # Build for Windows
pnpm build:linux        # Build for Linux
pnpm build:mac-intel    # Build for macOS Intel
pnpm build:mac-arm      # Build for macOS Apple Silicon
```

### Code Quality
```bash
pnpm format      # Format code with Biome
pnpm lint        # Check linting rules
pnpm lint:fix    # Auto-fix linting issues
pnpm lint:ci     # CI linting check
```

### Testing
```bash
pnpm test        # Run all tests once
```

## Testing

The project uses Vitest for unit testing with jsdom environment.

```javascript
// Example test structure
import { describe, it, expect } from 'vitest';

describe('Chess utilities', () => {
  it('should validate FEN notation', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    expect(isValidFen(fen)).toBe(true);
  });
});
```

## Project Structure

```
En-passant/
├── src/                          # Frontend React application
│   ├── components/               # Reusable UI components
│   │   ├── boards/              # Chess board components
│   │   ├── engines/             # Engine management
│   │   ├── panels/              # Analysis panels
│   │   └── ...
│   ├── state/                   # State management (Jotai)
│   ├── utils/                   # Utility functions
│   ├── styles/                  # CSS and theme files
│   ├── translation/             # i18n translations
│   └── routes/                  # Application routes
├── src-tauri/                   # Tauri Rust backend
│   ├── src/                     # Rust source code
│   ├── Cargo.toml              # Rust dependencies
│   └── tauri.conf.json         # Tauri configuration
├── public/                      # Static assets
│   ├── board/                   # Board themes
│   ├── pieces/                  # Piece sets
│   ├── sound/                   # Sound effects
│   └── ...
└── package.json                 # Node.js dependencies and scripts
```

## Code Style

The project uses Biome for consistent code formatting and linting.

**Biome Configuration** (`biome.json`):
```json
{
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 80
  },
  "linter": {
    "rules": {
      "style": {
        "noNonNullAssertion": "warn"
      },
      "correctness": {
        "useExhaustiveDependencies": "warn"
      }
    }
  }
}
```

**Example Component Structure**:
```typescript
// src/components/boards/Board.tsx
import { useAtom } from 'jotai';
import { boardStateAtom } from '@/state/atoms';

export function Board() {
  const [boardState] = useAtom(boardStateAtom);

  return (
    <div className="chess-board">
      {/* Board rendering logic */}
    </div>
  );
}
```

## Git Workflow

### Branching Strategy
- `master`: Main production branch
- Feature branches: `feature/feature-name`
- Bug fixes: `fix/bug-description`

### Commit Convention
```
feat: add new chess engine support
fix: resolve board rendering issue
docs: update README with installation guide
style: format code with biome
test: add unit tests for move validation
```

### Pull Request Process
```bash
# 1. Fork and clone
git clone https://github.com/your-username/En-passant.git
cd En-passant

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Make changes and commit
git add .
git commit -m "feat: add your feature"

# 4. Push and create PR
git push origin feature/your-feature-name
```

## Building from Source

Refer to the [Tauri documentation](https://tauri.app/v1/guides/getting-started/prerequisites) for system requirements.

```bash
# Install pnpm if not already installed
npm install -g pnpm

# Clone and setup
git clone https://github.com/Mezdia/En-passant.git
cd En-passant
pnpm install
pnpm build
```

Built binaries are located in `src-tauri/target/release/`.

## Donate

Support development at [enpassant.ir/support](https://enpassant.ir/support).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## License

GPL-3.0 License
