#!/usr/bin/env node

const program = require("commander");
const install = require("./actions/install");
const build = require("./actions/build");
const upgrade = require("./actions/upgrade");
const list = require("./actions/list");
const edit = require("./actions/edit");

const installer = new install();
const builder = new build();
const upgrader = new upgrade();
const lister = new list();
const editor = new edit();

program
    .version("0.1.0")
    .description("A CLI utility to manage letterpad instances");

// install letterpad
program
    .command("install")
    .alias("i")
    .description("Install letterpad")
    .action(() => installer.init());

// build letterpad
program
    .command("build")
    .alias("b")
    .description("Build letterpad")
    .action(() => builder.init());

// upgrade letterpad
program
    .command("upgrade")
    .alias("u")
    .description("Upgrade a letterpad instance to latest version")
    .action(() => upgrader.init());

// list installations
program
    .command("list")
    .alias("l")
    .description("List all instances")
    .action(() => lister.init());

// edit
program
    .command("edit")
    .alias("e")
    .description("Edit an instance")
    .action(() => editor.init());

program.parse(process.argv);
