#!/usr/bin/env node

const program = require("commander");

const commands = require("./commands");
const store = require("./store");

const { killOnCtrlC } = require("./utilities/listener");
const fetchReleases = require("./utilities/fetch-releases");
const { getCachedReleases } = require("./utilities/tracker");
const { logger, logLevel } = require("./logger");

const run = async () => {
    program
        .version("0.1.0")
        .description("A CLI utility to manage letterpad instances");

    commands().forEach(item => {
        program
            .command(item.cmd)
            .alias(item.alias)
            .description(item.description)
            .action(() => item.action());
    });
    program.parse(process.argv);

    // HAndle no command
    const noCommand = program.args.length === 0;
    if (noCommand) {
        program.help();
    }
};

const setStore = async () => {
    let releases = getCachedReleases();
    try {
        releases = await fetchReleases();
    } catch (e) {
        store.setReleases(releases);
        store.setVersion(version);
        logger(
            "Could not contact github server. Trying offline mode.",
            logLevel.WARN
        );
    }
    if (releases.length === 0) {
        logger("No versions found. Quiting.", logLevel.ERROR);
        process.exit();
    }
    const version = releases[0].version;
    store.setReleases(releases);
    store.setVersion(version);
    store.setCmdRunPath(process.cwd());
};

setStore().then(run);
// exist if user presses Ctrl+C
killOnCtrlC();
