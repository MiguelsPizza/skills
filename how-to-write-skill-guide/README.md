# The Complete Guide to Building Skills for Claude

> Source: Anthropic's official skills guide. Converted to Markdown for easier reference.

## Contents

1. [Fundamentals](01-fundamentals.md)
2. [Planning and design](02-planning-and-design.md)
3. [Testing and iteration](03-testing-and-iteration.md)
4. [Distribution and sharing](04-distribution-and-sharing.md)
5. [Patterns and troubleshooting](05-patterns-and-troubleshooting.md)
6. [Resources and references](06-resources-and-references.md)

## Introduction

A [skill](https://docs.anthropic.com/en/docs/agents-and-tools/skills) is a set of instructions - packaged as a simple folder - that teaches Claude how to handle specific tasks or workflows. Skills are one of the most powerful ways to customize Claude for your specific needs. Instead of re-explaining your preferences, processes, and domain expertise in every conversation, skills let you teach Claude once and benefit every time.

Skills are powerful when you have repeatable workflows: generating frontend designs from specs, conducting research with consistent methodology, creating documents that follow your team's style guide, or orchestrating multi-step processes. They work well with Claude's built-in capabilities like code execution and document creation. For those building MCP integrations, skills add another powerful layer helping turn raw tool access into reliable, optimized workflows.

This guide covers everything you need to know to build effective skills - from planning and structure to testing and distribution. Whether you're building a skill for yourself, your team, or for the community, you'll find practical patterns and real-world examples throughout.

### What you'll learn

- Technical requirements and best practices for skill structure
- Patterns for standalone skills and MCP-enhanced workflows
- Patterns we've seen work well across different use cases
- How to test, iterate, and distribute your skills

### Who this is for

- Developers who want Claude to follow specific workflows consistently
- Power users who want Claude to follow specific workflows
- Teams looking to standardize how Claude works across their organization

### Two Paths Through This Guide

Building standalone skills? Focus on Fundamentals, Planning and Design, and category 1-2. Enhancing an MCP integration? The "Skills + MCP" section and category 3 are for you. Both paths share the same technical requirements, but you choose what's relevant to your use case.

**What you'll get out of this guide:** By the end, you'll be able to build a functional skill in a single sitting. Expect about 15-30 minutes to build and test your first working skill using the skill-creator.

Let's get started.
