# Chapter 6: Resources and references

If you're building your first skill, start with the Best Practices Guide, then reference the API docs as needed.

## Official Documentation

**Anthropic Resources:**

- [Best Practices Guide](https://docs.anthropic.com/en/docs/agents-and-tools/skills/best-practices)
- [Skills Documentation](https://docs.anthropic.com/en/docs/agents-and-tools/skills)
- [API Reference](https://docs.anthropic.com/en/api)
- [MCP Documentation](https://modelcontextprotocol.io)

**Blog Posts:**

- [Introducing Agent Skills](https://www.anthropic.com/news/agent-skills)
- [Engineering Blog: Equipping Agents for the Real World](https://www.anthropic.com/engineering/skills)
- [Skills Explained](https://www.anthropic.com/news/skills-explained)
- [How to Create Skills for Claude](https://www.anthropic.com/news/how-to-create-skills)
- [Building Skills for Claude Code](https://www.anthropic.com/news/building-skills-for-claude-code)
- [Improving Frontend Design through Skills](https://www.anthropic.com/news/frontend-design-skills)

## Example skills

**Public skills repository:**

- GitHub: [anthropics/skills](https://github.com/anthropics/skills)
- Contains Anthropic-created skills you can customize

## Tools and Utilities

**skill-creator skill:**

- Built into Claude.ai and available for Claude Code
- Can generate skills from descriptions
- Reviews and provides recommendations
- Use: "Help me build a skill using skill-creator"

**Validation:**

- skill-creator can assess your skills
- Ask: "Review this skill and suggest improvements"

## Getting Support

**For Technical Questions:**

- General questions: Community forums at the [Claude Developers Discord](https://discord.gg/anthropic)

**For Bug Reports:**

- GitHub Issues: [anthropics/skills/issues](https://github.com/anthropics/skills/issues)
- Include: Skill name, error message, steps to reproduce

---

## Reference A: Quick checklist

Use this checklist to validate your skill before and after upload. If you want a faster start, use the skill-creator skill to generate your first draft, then run through this list to make sure you haven't missed anything.

### Before you start

- [ ] Identified 2-3 concrete use cases
- [ ] Tools identified (built-in or MCP)
- [ ] Reviewed this guide and example skills
- [ ] Planned folder structure

### During development

- [ ] Folder named in kebab-case
- [ ] SKILL.md file exists (exact spelling)
- [ ] YAML frontmatter has `---` delimiters
- [ ] name field: kebab-case, no spaces, no capitals
- [ ] description includes WHAT and WHEN
- [ ] No XML tags (< >) anywhere
- [ ] Instructions are clear and actionable
- [ ] Error handling included
- [ ] Examples provided
- [ ] References clearly linked

### Before upload

- [ ] Tested triggering on obvious tasks
- [ ] Tested triggering on paraphrased requests
- [ ] Verified doesn't trigger on unrelated topics
- [ ] Functional tests pass
- [ ] Tool integration works (if applicable)
- [ ] Compressed as .zip file

### After upload

- [ ] Test in real conversations
- [ ] Monitor for under/over-triggering
- [ ] Collect user feedback
- [ ] Iterate on description and instructions
- [ ] Update version in metadata

---

## Reference B: YAML frontmatter

### Required fields

```yaml
---
name: skill-name-in-kebab-case
description: What it does and when to use it. Include specific trigger phrases.
---
```

### All optional fields

```yaml
---
name: skill-name
description: [required description]
license: MIT                                    # Optional: License for open-source
allowed-tools: "Bash(python:*) Bash(npm:*) WebFetch"  # Optional: Restrict tool access
metadata:                                       # Optional: Custom fields
    author: Company Name
    version: 1.0.0
    mcp-server: server-name
    category: productivity
    tags: [project-management, automation]
    documentation: https://example.com/docs
    support: support@example.com
---
```

### Security notes

**Allowed:**

- Any standard YAML types (strings, numbers, booleans, lists, objects)
- Custom metadata fields
- Long descriptions (up to 1024 characters)

**Forbidden:**

- XML angle brackets (< >) - security restriction
- Code execution in YAML (uses safe YAML parsing)
- Skills named with "claude" or "anthropic" prefix (reserved)

---

## Reference C: Complete skill examples

For full, production-ready skills demonstrating the patterns in this guide:

- [Document Skills](https://github.com/anthropics/skills) - PDF, DOCX, PPTX, XLSX creation
- [Example Skills](https://github.com/anthropics/skills) - Various workflow patterns
- [Partner Skills Directory](https://www.anthropic.com/skills) - View skills from various partners such as Asana, Atlassian, Canva, Figma, Sentry, Zapier, and more

These repositories stay up-to-date and include additional examples beyond what's covered here. Clone them, modify them for your use case, and use them as templates.
