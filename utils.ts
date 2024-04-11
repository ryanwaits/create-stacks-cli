import * as prompt from "@clack/prompts";
import chalk from "chalk";

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

import AdmZip from "adm-zip";
import { promisify } from "util";

async function init(
  packageManager: string,
  projectDir: string,
  options: { start: string; stop: string }
): Promise<void> {
  const spinner = prompt.spinner();
  spinner.start(chalk.yellow(options.start));

  try {
    await runPackageManager(packageManager, projectDir);
    spinner.stop(chalk.green(options.stop));
  } catch (error) {
    spinner.stop(chalk.red("Failed."));
    console.error(error);
  }
}

async function downloadAndExtractRepo(repoUrl: string, destPath: string) {
  try {
    const rootDir = process.cwd();
    const response = await fetch(repoUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const zip = new AdmZip(buffer);
    zip.extractAllTo(`${rootDir}/tmp/${destPath}`, true);
  } catch (error) {
    console.error(
      `Failed to download or extract repo from clarity-examples: ${error}`
    );
  }
}

function copy(src: string, dest: string): void {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    fs.copyFileSync(src, dest);
  }
}

function isValidPackageName(projectName: string): boolean {
  return /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(
    projectName
  );
}

function toValidPackageName(projectName: string): string {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/^[._]/, "")
    .replace(/[^a-z0-9-~]+/g, "-");
}

function copyDir(srcDir: string, destDir: string): void {
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file);
    const destFile = path.resolve(destDir, file);
    copy(srcFile, destFile);
  }
}

function isEmpty(path: string): boolean {
  const files = fs.readdirSync(path);
  return files.length === 0 || (files.length === 1 && files[0] === ".git");
}

function emptyDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const file of fs.readdirSync(dir)) {
    const abs = path.resolve(dir, file);

    if (fs.lstatSync(abs).isDirectory()) {
      emptyDir(abs);
      fs.rmdirSync(abs);
    } else {
      fs.unlinkSync(abs);
    }
  }
}

function removePackageLock(dir: string): void {
  const packageLockPath = path.join(dir, "package-lock.json");
  if (fs.existsSync(packageLockPath)) {
    fs.unlinkSync(packageLockPath);
  }
}

async function runPackageManager(
  packageManager: string,
  projectDir: string
): Promise<void> {
  // Check if the package manager is yarn, and append the --ignore-engines flag if so
  let command =
    packageManager === "yarn"
      ? `${packageManager} install --silent --ignore-engines`
      : `${packageManager} install --silent`;

  try {
    execSync(command, { cwd: projectDir, stdio: "ignore" });
  } catch (error) {
    console.error(`Failed to install dependencies with ${command}.`, error);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export {
  init,
  toValidPackageName,
  isValidPackageName,
  copyDir,
  downloadAndExtractRepo,
  isEmpty,
  emptyDir,
  removePackageLock,
  runPackageManager,
  sleep,
};
