[![Build Status](https://travis-ci.org/letterpad/letterpad-cli.svg?branch=master)](https://travis-ci.org/letterpad/letterpad-cli)

# Letterpad CLI

A CLI tool for managing Letterpad installations, builds and upgrades.

#### Installation

```sh
npm i -g letterpad-cli
```

#### Commands

```sh
# Help
letterpad --help

# Install a new instance of letterpad
letterpad install

# Upgrade an exisiting instance of letterpad
letterpad upgrade

# Rebuild an existing instance of letterpad
letterpad build

# List all the instances
letterpad list

# Edit a particular the instance
letterpad edit

# Remove a particular instance
letterpad remove

```

Every installation of a particular version has a cached copy of its sources inside `~/.cache/letterpad`. The `node_modules` folder of every installation is symlinked to its source to reduce space. This means if you install letterpad three times to run three different blogs, all installations will have only one shared `node_modules` folder.
