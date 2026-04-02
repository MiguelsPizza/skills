#!/usr/bin/env node

import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const MARKDOWN_LINK = /(?<!!)\[([^\]]+)\]\(([^)]+)\)/g;

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

function formatRelative(filePath) {
  return path.relative(ROOT, filePath);
}

function isFenceDelimiter(line) {
  return /^(```|~~~)/.test(line.trim());
}

function getContentLines(markdown) {
  const lines = [];
  let inCodeFence = false;

  for (const [index, rawLine] of markdown.split('\n').entries()) {
    const line = rawLine.trim();

    if (isFenceDelimiter(line)) {
      inCodeFence = !inCodeFence;
      continue;
    }

    if (!inCodeFence) {
      lines.push({
        lineNumber: index + 1,
        text: rawLine,
      });
    }
  }

  return lines;
}

function extractHeadingSlugs(markdown) {
  const slugs = new Set();

  for (const { text } of getContentLines(markdown)) {
    const match = /^(#{1,6})\s+(.+)$/.exec(text.trim());
    if (!match) {
      continue;
    }

    slugs.add(slugify(match[2]));
  }

  return slugs;
}

function* iterateMarkdownLinks(markdown) {
  for (const { lineNumber, text } of getContentLines(markdown)) {
    MARKDOWN_LINK.lastIndex = 0;

    for (const match of text.matchAll(MARKDOWN_LINK)) {
      yield {
        lineNumber,
        target: match[2].trim(),
      };
    }
  }
}

function isExternalLink(target) {
  return /^(https?:|mailto:|tel:|\/\/)/.test(target);
}

function isAbsoluteFilesystemPath(target) {
  return (
    target.startsWith('/')
    || /^[A-Za-z]:[\\/]/.test(target)
    || target.startsWith('file:')
  );
}

function decodePathTarget(target) {
  try {
    return decodeURIComponent(target);
  } catch {
    return target;
  }
}

async function exists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

function formatFailure(filePath, lineNumber, message) {
  return `${formatRelative(filePath)}:${lineNumber} -> ${message}`;
}

async function main() {
  const files = await listMarkdownFiles(ROOT);
  const markdownCache = new Map();
  const failures = [];

  for (const filePath of files) {
    const markdown = await readFile(filePath, 'utf8');
    markdownCache.set(filePath, {
      markdown,
      slugs: extractHeadingSlugs(markdown),
    });
  }

  for (const filePath of files) {
    const { markdown, slugs: currentSlugs } = markdownCache.get(filePath);

    for (const { lineNumber, target } of iterateMarkdownLinks(markdown)) {
      if (!target || isExternalLink(target)) {
        continue;
      }

      if (isAbsoluteFilesystemPath(target)) {
        failures.push(
          formatFailure(
            filePath,
            lineNumber,
            `absolute path links are not allowed: ${target}`,
          ),
        );
        continue;
      }

      if (target.startsWith('#')) {
        const anchor = slugify(target.slice(1));
        if (!currentSlugs.has(anchor)) {
          failures.push(
            formatFailure(filePath, lineNumber, `missing anchor ${target}`),
          );
        }
        continue;
      }

      const [rawPath, rawAnchor] = target.split('#', 2);
      const decodedPath = decodePathTarget(rawPath);
      const resolvedPath = path.resolve(path.dirname(filePath), decodedPath);

      if (!(await exists(resolvedPath))) {
        failures.push(
          formatFailure(filePath, lineNumber, `missing file ${target}`),
        );
        continue;
      }

      if (!rawAnchor) {
        continue;
      }

      const targetMarkdown = markdownCache.get(resolvedPath);
      if (!targetMarkdown) {
        failures.push(
          formatFailure(
            filePath,
            lineNumber,
            `anchors are only supported for markdown files: ${target}`,
          ),
        );
        continue;
      }

      const anchor = slugify(rawAnchor);
      if (!targetMarkdown.slugs.has(anchor)) {
        failures.push(
          formatFailure(filePath, lineNumber, `missing anchor ${target}`),
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
