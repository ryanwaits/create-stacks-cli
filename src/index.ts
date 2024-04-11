#!/usr/bin/env bun

import * as prompt from "@clack/prompts";
import chalk from "chalk";

import fs from "fs";
import path from "path";

import { templateOptions } from "../lib";
import {
  init,
  emptyDir,
  copyDir,
  downloadAndExtractRepo,
  toValidPackageName,
  removePackageLock,
} from "../utils";

prompt.intro("Create Stacks App");

// Parse command-line arguments for no-backend, and no-contracts
const args = process.argv.slice(2);
// Determine the package manager based on the provided flag
const packageManager = args.includes("--bun")
  ? "bun"
  : args.includes("--yarn")
  ? "yarn"
  : args.includes("--pnpm")
  ? "pnpm"
  : "npm"; // Default to npm if no specific flag is provided
const noBackend = args.includes("--no-backend");
const noContracts = args.includes("--no-contracts");

const useReact = args.includes("--react");
const useVite = args.includes("--vite");
const useNext = args.includes("--next");
const useSvelte = args.includes("--svelte");
const useVue = args.includes("--vue");

const useTypeScript = await prompt.confirm({
  message: `Would you like to use ${chalk.blue("TypeScript")}?`,
});

const projectName = await prompt.text({
  message: "Project name",
  placeholder: "app",
  validate(value) {
    if (value.length === 0) return `Value is required!`;
  },
});

let templateType: string | symbol = "blank";
let frameworkType: string | symbol = useReact
  ? "react"
  : useNext
  ? "next"
  : useVite
  ? "vite"
  : useSvelte
  ? "svelte"
  : useVue
  ? "vue"
  : "unknown";

// Skip template selection if --no-backend or --no-contracts is present
if (!noBackend && !noContracts) {
  templateType = await prompt.select({
    message: "Choose a template",
    options: templateOptions,
  });
}

const cwd = process.cwd();
const targetDir = projectName as string; // Assuming projectName is the directory name for the new project
const root = path.join(cwd, targetDir);

// Check if the directory exists and whether to overwrite it
const overwrite = false; // Set based on your logic or user input
if (overwrite) {
  emptyDir(root);
} else if (!fs.existsSync(root)) {
  fs.mkdirSync(root, { recursive: true });
} else {
  console.log(
    chalk.red(
      `Directory ${targetDir} already exists. Use a different project name or delete the existing directory.`
    )
  );
  process.exit(1);
}

// GitHub repo URLs for 'contracts' and 'frameworks'
const contractsRepoUrl =
  "https://github.com/hirosystems/clarity-examples/archive/refs/heads/main.zip";
const frameworksRepoUrl =
  "https://github.com/hirosystems/stacks.js-starters/archive/refs/heads/main.zip";

// Download and extract
await downloadAndExtractRepo(contractsRepoUrl, "clarity-examples");
await downloadAndExtractRepo(frameworksRepoUrl, "starter-templates");

// Mapping of framework types to their corresponding template directory names
const frameworkToTemplateMap: { [key: string]: string } = {
  react: "react-cra",
  next: "react-nextjs",
  vite: "react-vite",
  svelte: "svelte",
  vue: "vue",
};

// Determine the correct template directory name based on the selected framework and TypeScript usage
const templateDirName = `template-${
  frameworkToTemplateMap[frameworkType as string]
}${useTypeScript ? "-ts" : ""}`;

const frameworkDir = path.join(
  process.cwd(),
  "tmp",
  "starter-templates",
  "stacks.js-starters-main",
  "templates",
  templateDirName
);

// Remove package-lock.json from the framework directory
removePackageLock(frameworkDir);

// Copy the template files to the target directory
copyDir(frameworkDir, root);

const backendTemplateDir = path.join(
  process.cwd(),
  "tmp",
  "clarity-examples",
  "clarity-examples-main",
  "examples",
  templateType as string
);

const backendTargetDir = path.join(root, "backend"); // Assuming you want to place backend templates in a 'backend' subdirectory

// Check if the backend template directory exists
if (!fs.existsSync(backendTemplateDir)) {
  console.error(
    chalk.red(`Backend template ${templateType as string} does not exist.`)
  );
}

// Copy the backend template directory to the target directory
if (!noBackend && !noContracts) {
  copyDir(backendTemplateDir, backendTargetDir);
  removePackageLock(backendTargetDir);
}

// Customize the package.json or other files as needed
let pkgPath = path.join(root, "package.json");
if (fs.existsSync(pkgPath)) {
  let pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  pkg.name = toValidPackageName(projectName as string);
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
}

const tmpDirPath = path.join(process.cwd(), "tmp");
try {
  fs.rmSync(tmpDirPath, { recursive: true, force: true });
} catch (error) {
  console.error(chalk.red(`Failed to remove temporary directory: ${error}`));
}

await init(packageManager, root, {
  start: `Generating ${frameworkType} frontend`,
  stop: `Complete`,
});

await init(packageManager, backendTargetDir, {
  start: `Generating ${templateType as string} template`,
  stop: `Complete`,
});

console.log(chalk.cyan("Project is ready!"));
