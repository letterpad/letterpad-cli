#!/usr/bin/env node

const program = require("commander");
const install = require("./actions/install");

const installer = new install();
program
    .version("0.1.0")
    .description("A CLI utility to manage letterpad instances");

// install letterpad
program
    .command("install")
    // .option("-p, --path <path>", "installation path")
    // .option("-v, --version <version>", "installation path")
    .alias("i")
    .description("Install letterpad")
    .action(() => installer.init());

program.parse(process.argv);

// if (program.install) {
// }
// if (program.upgrade) console.log("  - Upgrading");
// if (program.delete) console.log("  - Deleting");
