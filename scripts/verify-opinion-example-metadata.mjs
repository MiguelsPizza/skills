#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const OPINION_DIRS = ['opinions/references', 'opinions/opinionated-stack'];
const ALLOWED_FORMATS = new Set(['code', 'text', 'workflow']);
const FRONT_MATTER_START = '---\n';
const MARKDOWN_LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

async function listMarkdownFiles(dir) {
  const directory = path.join(ROOT, dir);
  const entries = await readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => path.join(directory, entry.name))
    .sort();
}

function formatRelative(filePath) {
  return path.relative(ROOT, filePath);
}

function getSlug(filePath) {
  return path.basename(filePath, '.md');
}

function extractFrontMatter(text) {
  if (!text.startsWith(FRONT_MATTER_START)) {
    return {
      body: text,
      frontMatter: null,
    };
  }

  const endIndex = text.indexOf('\n---\n', FRONT_MATTER_START.length);
  if (endIndex === -1) {
    return {
      body: text,
      frontMatter: null,
    };
  }

  return {
    frontMatter: text.slice(FRONT_MATTER_START.length, endIndex),
    body: text.slice(endIndex + 5),
  };
}

function parseExampleMetadata(frontMatter) {
  if (!frontMatter) {
    return null;
  }

  const lines = frontMatter.split('\n');
  const exampleIndex = lines.findIndex((line) => line.trim() === 'example:');
  if (exampleIndex === -1) {
    return null;
  }

  const metadata = {
    primary: null,
    format: null,
    implements: [],
  };

  let currentList = null;

  for (let index = exampleIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.startsWith('  ')) {
      break;
    }

    const trimmed = line.trim();
    if (trimmed === 'implements:') {
      currentList = 'implements';
      continue;
    }

    if (currentList === 'implements' && trimmed.startsWith('- ')) {
      metadata.implements.push(trimmed.slice(2).trim());
      continue;
    }

    currentList = null;

    const separator = trimmed.indexOf(':');
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    if (key === 'primary') {
      metadata.primary = value;
    } else if (key === 'format') {
      metadata.format = value;
    }
  }

  return metadata;
}

function hasExampleSection(body) {
  return body.includes('\n## Example\n') || body.startsWith('## Example\n');
}

function parseExampleImplementsFooter(body) {
  const match = /^Example implements:\s+(.+)$/m.exec(body);
  if (!match) {
    return null;
  }

  const links = [...match[1].matchAll(MARKDOWN_LINK)].map((entry) => entry[2]);
  return links.map((target) => path.basename(target, '.md'));
}

async function main() {
  const files = (await Promise.all(OPINION_DIRS.map((dir) => listMarkdownFiles(dir)))).flat();
  const slugToFile = new Map(files.map((filePath) => [getSlug(filePath), formatRelative(filePath)]));
  const failures = [];
  let verifiedCount = 0;

  for (const filePath of files) {
    const relativePath = formatRelative(filePath);
    const slug = getSlug(filePath);
    const text = await readFile(filePath, 'utf8');
    const { frontMatter, body } = extractFrontMatter(text);

    if (!hasExampleSection(body)) {
      continue;
    }

    verifiedCount += 1;
    const metadata = parseExampleMetadata(frontMatter);
    const issues = [];

    if (!metadata) {
      issues.push('missing `example:` front matter metadata');
    } else {
      if (metadata.primary !== slug) {
        issues.push(`example.primary must equal file slug \`${slug}\``);
      }

      if (!ALLOWED_FORMATS.has(metadata.format)) {
        issues.push(`example.format must be one of ${[...ALLOWED_FORMATS].join(', ')}`);
      }

      if (metadata.implements.length < 3) {
        issues.push('example.implements must contain at least 3 entries');
      }

      if (!metadata.implements.includes(slug)) {
        issues.push('example.implements must include the file slug itself');
      }

      const duplicateImplements = new Set();
      for (const implementedSlug of metadata.implements) {
        if (duplicateImplements.has(implementedSlug)) {
          issues.push(`duplicate example.implements entry: \`${implementedSlug}\``);
          continue;
        }
        duplicateImplements.add(implementedSlug);

        if (!slugToFile.has(implementedSlug)) {
          issues.push(`example.implements references unknown opinion slug: \`${implementedSlug}\``);
        }
      }

      const footerSlugs = parseExampleImplementsFooter(body);
      if (!footerSlugs) {
        issues.push('missing `Example implements:` footer');
      } else {
        const metadataSet = new Set(metadata.implements);
        const footerSet = new Set(footerSlugs);

        if (footerSet.size !== footerSlugs.length) {
          issues.push('`Example implements:` footer contains duplicate links');
        }

        for (const footerSlug of footerSet) {
          if (!metadataSet.has(footerSlug)) {
            issues.push(`footer references \`${footerSlug}\` which is not listed in example.implements`);
          }
        }

        for (const metadataSlug of metadataSet) {
          if (!footerSet.has(metadataSlug)) {
            issues.push(`example.implements entry \`${metadataSlug}\` is missing from footer links`);
          }
        }
      }
    }

    if (issues.length > 0) {
      failures.push({
        file: relativePath,
        issues,
      });
    }
  }

  if (failures.length === 0) {
    console.log(`Opinion example metadata passed for ${verifiedCount} files.`);
    return;
  }

  console.error(`Opinion example metadata found issues in ${failures.length} file(s):\n`);
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
