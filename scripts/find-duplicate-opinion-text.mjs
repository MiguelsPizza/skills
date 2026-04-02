#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const OPINION_DIRS = [
  'skills/maintainable-typescript/references',
  'skills/maintainable-typescript/opinionated-stack',
];
const MIN_WORDS = 8;

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

function normalizeBlock(block) {
  return block
    .replace(/`+/g, '')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/[*_>#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function extractTextBlocks(markdown) {
  const blocks = [];
  const lines = markdown.split('\n');
  let inCodeFence = false;
  let current = [];

  const flush = () => {
    const rawBlock = current.join('\n').trim();
    current = [];

    if (!rawBlock) {
      return;
    }

    const isHeading = rawBlock.startsWith('#');
    const isRule = rawBlock.startsWith('**Rule:**');
    const isCodeFence = rawBlock.startsWith('```');

    if (isHeading || isRule || isCodeFence) {
      return;
    }

    const normalized = normalizeBlock(rawBlock);
    const wordCount = normalized.split(' ').filter(Boolean).length;
    if (wordCount < MIN_WORDS) {
      return;
    }

    blocks.push({
      raw: rawBlock,
      normalized,
      wordCount,
    });
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.trim().startsWith('```')) {
      inCodeFence = !inCodeFence;
      flush();
      continue;
    }

    if (inCodeFence) {
      continue;
    }

    if (line.trim() === '') {
      flush();
      continue;
    }

    current.push(line);
  }

  flush();
  return blocks;
}

function formatRelative(filePath) {
  return path.relative(ROOT, filePath);
}

async function main() {
  const files = (await Promise.all(OPINION_DIRS.map((dir) => listMarkdownFiles(dir)))).flat();
  const seen = new Map();

  for (const filePath of files) {
    const text = stripFrontMatter(await readFile(filePath, 'utf8'));
    const blocks = extractTextBlocks(text);

    for (const block of blocks) {
      const record = seen.get(block.normalized) ?? [];
      record.push({
        file: formatRelative(filePath),
        raw: block.raw,
      });
      seen.set(block.normalized, record);
    }
  }

  const duplicates = [...seen.entries()]
    .map(([normalized, matches]) => ({ normalized, matches }))
    .filter(({ matches }) => {
      const filesWithMatch = new Set(matches.map((match) => match.file));
      return filesWithMatch.size > 1;
    })
    .sort((left, right) => right.matches.length - left.matches.length);

  if (duplicates.length === 0) {
    console.log('No duplicated prose blocks found across opinion files.');
    return;
  }

  console.log(`Found ${duplicates.length} duplicated prose block(s) across opinion files:\n`);

  for (const duplicate of duplicates) {
    console.log('Files:');
    for (const match of duplicate.matches) {
      console.log(`  - ${match.file}`);
    }
    console.log('Block:');
    console.log(duplicate.matches[0].raw);
    console.log('');
  }
}

await main();
