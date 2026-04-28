import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

export const ROOT = process.cwd();

async function exists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
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

    for (const child of ['references', 'opinionated-stack']) {
      const childPath = path.join(skillRoot, child);
      if (await exists(childPath)) {
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
