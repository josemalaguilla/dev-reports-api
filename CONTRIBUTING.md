# Contributing to project

If any other developer at any time wants to contribute to this project here will find some contraints and guidelines to do it.

## Table of Contents

- [Branching Strategy](#branching-strategy)
- [Commit Messages](#commit-messages)
- [Project Maintenance](#project-maintenance)

## Branching Strategy

We use Trunk based development:

- `master`: Stable production-ready code.
- `feature/your-feature-name`: New feature short-lived branches. You must integrate into master as soon as you have something stable.

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user authentication
fix: resolve API endpoint timeout issue
chore: update dependencies
```

This projects includes Commitizen that helps writting the commit messages. You can start the helper tool by executing

```sh
npm run commit
```

## Project Maintenance

### Check for Outdated Dependencies

```sh
npm run libs:check
```

### Update Outdated Dependencies

```sh
npm run libs:update
```

### Check for Vulnerabilities

First you should perform to execute any security command. This is only required once.

```sh
npm run security:auth
```

Then execute

```sh
npm run security:check
```

### Lint and Format Code

For checking without modifying the actual code you can run:

```sh
npm run lint:check
npm run format:check
```

If you want to run auto-fix you can execute:

```sh
npm run lint:fix
npm run format
```

Nonetheless it will be executed for staged code on commit due to husky hooks.

---

Thank you for contributing!
