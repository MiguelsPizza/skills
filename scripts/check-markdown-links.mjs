#!/usr/bin/env node

import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const MARKDOWN_LINK = /\[([^\]]+)\]\(([^)]+)\)/g;
const IGNORED_PREFIXES = ['how-to-write-skill-guide/'];

async function listMarkdownFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listMarkdownFiles(fullPath)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

function slugify(heading) {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

function extractHeadingSlugs(markdown) {
  const slugs = new Set();
  let inCodeFence = false;

  for (const line of markdown.split('\n')) {
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      inCodeFence = !inCodeFence;
      continue;
    }

    if (inCodeFence) {
      continue;
    }

    const match = /^(#{1,6})\s+(.+)$/.exec(trimmed);
    if (!match) {
      continue;
    }

    slugs.add(slugify(match[2]));
  }

  return slugs;
}

function isExternalLink(target) {
  return /^(https?:|mailto:|tel:)/.test(target);
}

async function exists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

function formatRelative(filePath) {
  return path.relative(ROOT, filePath);
}

function shouldIgnore(filePath) {
  const relativePath = formatRelative(filePath);
  return IGNORED_PREFIXES.some((prefix) => relativePath.startsWith(prefix));
}

async function main() {
  const files = await listMarkdownFiles(ROOT);
  const markdownCache = new Map();
  const failures = [];

  for (const filePath of files) {
    if (shouldIgnore(filePath)) {
      continue;
    }

    const markdown = await readFile(filePath, 'utf8');
    markdownCache.set(filePath, {
      markdown,
      slugs: extractHeadingSlugs(markdown),
    });
  }

  for (const filePath of files) {
    if (shouldIgnore(filePath)) {
      continue;
    }

    const { markdown, slugs: currentSlugs } = markdownCache.get(filePath);

    for (const match of markdown.matchAll(MARKDOWN_LINK)) {
      const target = match[2].trim();
      if (!target || isExternalLink(target)) {
        continue;
      }

      if (target.startsWith('#')) {
        const anchor = slugify(target.slice(1));
        if (!currentSlugs.has(anchor)) {
          failures.push(
            `${formatRelative(filePath)} -> missing anchor ${target}`,
          );
        }
        continue;
      }

      const [rawPath, rawAnchor] = target.split('#');
      const resolvedPath = path.resolve(path.dirname(filePath), rawPath);

      if (!(await exists(resolvedPath))) {
        failures.push(
          `${formatRelative(filePath)} -> missing file ${target}`,
        );
        continue;
      }

      if (!rawAnchor) {
        continue;
      }

      const targetMarkdown = markdownCache.get(resolvedPath);
      if (!targetMarkdown) {
        continue;
      }

      const anchor = slugify(rawAnchor);
      if (!targetMarkdown.slugs.has(anchor)) {
        failures.push(
          `${formatRelative(filePath)} -> missing anchor ${target}`,
        );
      }
    }
  }

  if (failures.length === 0) {
    console.log(`Markdown link check passed for ${files.length} files.`);
    return;
  }

  console.error(`Markdown link check found ${failures.length} issue(s):\n`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
}

await main();
