#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const OPINION_ROOT = 'skills/maintainable-typescript';
const OPINION_DIRS = [
  `${OPINION_ROOT}/references`,
  `${OPINION_ROOT}/opinionated-stack`,
];
const REQUIRED_H2 = [
  'Why agents get this wrong',
  'What to do instead',
  'Example',
];
const IGNORED_FILES = new Set([
  `${OPINION_ROOT}/references/maintainability-tooling.md`,
  `${OPINION_ROOT}/opinionated-stack/start-here.md`,
  `${OPINION_ROOT}/opinionated-stack/stack-overview.md`,
]);

async function listMarkdownFiles(dir) {
  const directory = path.join(ROOT, dir);
  const entries = await readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => path.join(directory, entry.name))
    .sort();
}

function stripFrontMatter(text) {
  if (!text.startsWith('---\n')) {
    return text;
  }

  const endIndex = text.indexOf('\n---\n', 4);
  if (endIndex === -1) {
    return text;
  }

  return text.slice(endIndex + 5);
}

function getNonEmptyLines(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function getHeadings(text) {
  const headings = [];
  const lines = text.split('\n');
  let inCodeFence = false;

  for (const [index, rawLine] of lines.entries()) {
    const line = rawLine.trim();

    if (line.startsWith('```')) {
      inCodeFence = !inCodeFence;
      continue;
    }

    if (inCodeFence) {
      continue;
    }

    const match = /^(#{1,6})\s+(.+)$/.exec(line);
    if (!match) {
      continue;
    }

    headings.push({
      depth: match[1].length,
      text: match[2].trim(),
      line: index + 1,
    });
  }

  return headings;
}

function formatRelative(filePath) {
  return path.relative(ROOT, filePath);
}

function validateOpinion(filePath, text) {
  const issues = [];
  const content = stripFrontMatter(text);
  const nonEmptyLines = getNonEmptyLines(content);
  const headings = getHeadings(content);
  const relativePath = formatRelative(filePath);
  const isPortableOpinion =
    relativePath.startsWith(`${OPINION_ROOT}/references/`)
    && !relativePath.endsWith(`${OPINION_ROOT}/references/maintainability-tooling.md`);

  if (nonEmptyLines[0]?.startsWith('# ') !== true) {
    issues.push('missing top-level title as the first non-empty line');
  }

  if (!nonEmptyLines.some((line) => line.startsWith('**Rule:**'))) {
    issues.push('missing `**Rule:**` summary');
  }

  const h1Count = headings.filter((heading) => heading.depth === 1).length;
  if (h1Count === 0) {
    issues.push('missing `# Title` heading');
  } else if (h1Count > 1) {
    issues.push(`contains ${h1Count} H1 headings`);
  }

  const h2Texts = headings
    .filter((heading) => heading.depth === 2)
    .map((heading) => heading.text);

  let previousIndex = -1;
  for (const requiredHeading of REQUIRED_H2) {
    const currentIndex = h2Texts.indexOf(requiredHeading);
    if (currentIndex === -1) {
      issues.push(`missing required section: \`## ${requiredHeading}\``);
      continue;
    }

    if (currentIndex < previousIndex) {
      issues.push(
        `section out of order: \`## ${requiredHeading}\` appears before an earlier required section`,
      );
    }

    previousIndex = currentIndex;
  }

  const lineCount = content.split('\n').length;
  if (isPortableOpinion && lineCount > 100) {
    issues.push(`portable opinion exceeds 100 lines (${lineCount})`);
  }

  return issues;
}

async function main() {
  const files = (await Promise.all(OPINION_DIRS.map((dir) => listMarkdownFiles(dir)))).flat();
  const failures = [];

  for (const filePath of files) {
    if (IGNORED_FILES.has(formatRelative(filePath))) {
      continue;
    }

    const text = await readFile(filePath, 'utf8');
    const issues = validateOpinion(filePath, text);

    if (issues.length > 0) {
      failures.push({
        file: formatRelative(filePath),
        issues,
      });
    }
  }

  if (failures.length === 0) {
    console.log(`Opinion audit passed for ${files.length} files.`);
    return;
  }

  console.error(`Opinion audit found issues in ${failures.length} of ${files.length} files:\n`);

  for (const failure of failures) {
    console.error(failure.file);
    for (const issue of failure.issues) {
      console.error(`  - ${issue}`);
    }
    console.error('');
  }

  process.exitCode = 1;
}

await main();
