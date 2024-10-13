# Git Version Updater

This project is a command-line tool designed to facilitate version management of your codebase using Semantic Versioning. It updates version numbers in specified files and commits changes to Git, streamlining the release process.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Commands](#commands)
- [Configuration](#configuration)


## Features

- Automatically updates Git status.
- Increments version numbers (major, minor, patch).
- Updates specified template files with new version and build date.
- Commits changes to Git automatically.

## Installation

To install the tool globally, use npm:

```bash
npm install -g git-version-updater
```

## Usage

Once installed, you can use the tool directly from the command line:

```bash
git-version-updater [command] [options]
```

## Commands

### `status`

Updates the Git status file with modified files.

```bash
git-version-updater status
```

### `commit`

Updates version numbers and commits changes to Git.

Options:
- `-M, --major`: Increment major version.
- `-m, --minor`: Increment minor version.
- `-p, --patch`: Increment patch version (default).
- `-t, --template <file>`: Specify a template file to update.

Example:
```bash
git-version-updater commit --minor --template path/to/template.txt
```

### `update-commit`

Updates Git status, version numbers, and commits changes in one command.

Options are the same as for the `commit` command.

Example:
```bash
git-version-updater update-commit --major
```

## Configuration

### Version File

The current version is stored in `version.json`. If this file doesn't exist, it defaults to `0.1.0`.

### Status File

The tool uses a `.zzz-git-status` file to track modified files in the Git repository.

### Template File

If specified, a template file will be updated with the new version and build date. Any occurrences of `{version}` and `{date}` in the file will be replaced.
