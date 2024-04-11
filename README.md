# Create Stacks App CLI

The Create Stacks App CLI is a powerful command-line tool designed to streamline the process of initializing a new Stacks blockchain application. With support for various frameworks and customization options, it allows developers to quickly scaffold projects tailored to their needs.

## Features

- Support for multiple JavaScript frameworks (React, Vue, Svelte, Next.js, Vite).

- Optional TypeScript support.

- Integration with Stacks blockchain features, including smart contracts.

- Customizable project templates for both frontend and backend development.

## Installation

```bash
npm install -g create-stacks
```

Or, if you prefer using Bun:

```bash
bun install -g create-stacks
```

## Usage

To create a new Stacks application, run:

```bash
npm create stacks
```

### Options

The CLI supports several flags to customize the project:

- `--bun`, `--yarn`, `--pnpm`, `--npm`: Specify the package manager to use for installing dependencies. Defaults to `npm` if no flag is provided.

- `--no-backend` or `--no-contracts`: Skip generating backend templates and dependencies.

- `--react`, `--vue`, `--svelte`, `--next`, `--vite`: Choose the JavaScript framework for the frontend. If no framework is specified, a basic template is used.

- `--typescript` or `--ts`: Enable TypeScript for the project.

### What Gets Generated

Depending on the options selected, the CLI will generate a project structure with the following:

- **Frontend Template**: Based on the chosen framework (React, Vue, Svelte, Next.js, Vite), including necessary configuration files and a basic starting template. TypeScript configuration is included if the `--typescript` flag is used.

- **Smart Contracts**: If not skipped, smart contracts are included unless the `--no-contracts` option is used. Requires `clarinet` installation.

- **Package Manager**: Dependencies are installed using the specified package manager (`npm`, `yarn`, `pnpm`, or `bun`), and a `package.json` file is configured accordingly.

After the project is generated, the CLI will provide instructions for getting started with development.
