import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

export const ROOT = process.cwd();
const LEGACY_OPINION_DIRS = ['references', 'opinionated-stack'];
const STACK_DIR = 'stack';
const DOCTRINE_DIR = 'doctrine';

async function exists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function listChildDirs(rootDir) {
  if (!(await exists(rootDir))) {
    return [];
  }

  const entries = await readdir(rootDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(rootDir, entry.name))
    .sort();
}

async function containsMarkdownFiles(dir) {
  if (!(await exists(dir))) {
    return false;
  }

  const entries = await readdir(dir, { withFileTypes: true });
  return entries.some((entry) => entry.isFile() && entry.name.endsWith('.md'));
}

export async function getOpinionDirs() {
  const skillsRoot = path.join(ROOT, 'skills');
  const entries = await readdir(skillsRoot, { withFileTypes: true });
  const opinionDirs = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const skillRoot = path.join(skillsRoot, entry.name);
    if (!(await exists(path.join(skillRoot, 'SKILL.md')))) {
      continue;
    }

    for (const child of LEGACY_OPINION_DIRS) {
      const childPath = path.join(skillRoot, child);
      if (await exists(childPath)) {
        throw new Error(
          `Legacy opinion directory ${path.relative(ROOT, childPath)} is not allowed. Use doctrine/ or stack/.`,
        );
      }
    }

    const stackPath = path.join(skillRoot, STACK_DIR);
    if (await exists(stackPath)) {
      opinionDirs.push(path.relative(ROOT, stackPath));
    }

    const doctrinePath = path.join(skillRoot, DOCTRINE_DIR);
    if (await containsMarkdownFiles(doctrinePath)) {
      opinionDirs.push(path.relative(ROOT, doctrinePath));
    }

    for (const childPath of await listChildDirs(doctrinePath)) {
      if (await containsMarkdownFiles(childPath)) {
        opinionDirs.push(path.relative(ROOT, childPath));
      }
    }
  }

  return opinionDirs.sort();
}

export async function listMarkdownFiles(dir) {
  const directory = path.join(ROOT, dir);
  const entries = await readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => path.join(directory, entry.name))
    .sort();
}

export function formatRelative(filePath) {
  return path.relative(ROOT, filePath);
}
