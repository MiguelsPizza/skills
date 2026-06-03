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

async function containsMarkdownFiles(dir) {
  if (!(await exists(dir))) {
    return false;
  }

  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const childPath = path.join(dir, entry.name);
    if (entry.isDirectory() && (await containsMarkdownFiles(childPath))) {
      return true;
    }

    if (entry.isFile() && entry.name.endsWith('.md')) {
      return true;
    }
  }

  return false;
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

    const stackPath = path.join(skillRoot, STACK_DIR);
    const doctrinePath = path.join(skillRoot, DOCTRINE_DIR);
    const hasOpinionStructure =
      (await exists(stackPath)) || (await exists(doctrinePath));

    if (hasOpinionStructure) {
      for (const child of LEGACY_OPINION_DIRS) {
        const childPath = path.join(skillRoot, child);
        if (await exists(childPath)) {
          throw new Error(
            `Legacy opinion directory ${path.relative(ROOT, childPath)} is not allowed. Use doctrine/ or stack/.`,
          );
        }
      }
    }

    if (await containsMarkdownFiles(stackPath)) {
      opinionDirs.push(path.relative(ROOT, stackPath));
    }

    if (await containsMarkdownFiles(doctrinePath)) {
      opinionDirs.push(path.relative(ROOT, doctrinePath));
    }
  }

  return opinionDirs.sort();
}

export async function listMarkdownFiles(dir) {
  const directory = path.join(ROOT, dir);
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const childPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listMarkdownFiles(path.relative(ROOT, childPath))));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(childPath);
    }
  }

  return files.sort();
}

export function formatRelative(filePath) {
  return path.relative(ROOT, filePath);
}
