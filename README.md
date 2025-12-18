# chooks-template

A template project for developing Xahau Hooks. Write hooks in C language, compile them to WASM, and execute them on the Xahau network.

## Overview

This template provides a basic setup for developing and testing Xahau Hooks. The current hook implementation is a simple example that accepts all transactions.

## Prerequisites

- Node.js 18 or higher
- pnpm
- Docker
- xrpld-netgen 
  - pip install xrpld-netgen

## Setup

Install dependencies:

```bash
pnpm install
```

## Project Structure

```
chooks-template/
├── contracts/          # C language hook source code
│   ├── index.c        # Main hook implementation
│   └── utils/         # Utility header files
│       ├── hookapi.h  # Hook API definitions
│       ├── macro.h    # Macro definitions
│       ├── extern.h   # External function definitions
│       └── ...
├── build/             # Compiled WASM files
├── test/              # Test files
│   └── index.test.ts  # Hook integration tests
└── package.json       # Project configuration
```

## Usage

### Building Hooks

Compile C language source code to WASM:

```bash
pnpm build
```

The compiled WASM file will be output to `build/index.wasm`.

### Running Tests

Run hook tests:

```bash
pnpm test
```

Tests will automatically compile the hook and deploy it on a local Xahau network for execution.

### Starting Local Xahau Network

Start a local Xahau network using xrpld-netgen:

```bash
pnpm xrpld:start
```

### Stopping Local Xahau Network

Stop the local Xahau network:

```bash
pnpm xrpld:stop
```

### Viewing Hook Trace Logs

View hook execution logs in real-time:

```bash
pnpm trace
```

## Development

### Hooks Tools

[Transaction builder](https://tx-builder.xahau.tools/)
[Binary visualizer](https://binary-visualizer.xahau.tools/)

### Hook API Reference

For detailed Hook API documentation, refer to:
- [Xahau Hooks Reference](https://xahau.network/docs/hooks/)

## License

ISC
