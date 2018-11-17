#!/usr/bin/env node

const program = require("commander");
const shell = require("shelljs");

const { killOnCtrlC } = require("./utilities/listener");
const fetchReleases = require("./utilities/fetch-releases");
const { getCachedReleases } = require("./utilities/tracker");
const { logger, logLevel } = require("./logger");

// modules
const install = require("./actions/install");
const build = require("./actions/build");
const upgrade = require("./actions/upgrade");
const list = require("./actions/list");
const edit = require("./actions/edit");

// store
const store = require("./store");

const run = async () => {
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
        .action(builder.init);

    // upgrade letterpad
    program
        .command("upgrade")
        .alias("u")
        .description("Upgrade a letterpad instance to latest version")
        .action(upgrader.init);

    // list installations
    program
        .command("list")
        .alias("l")
        .description("List all instances")
        .action(lister.init);

    // edit
    program
        .command("edit")
        .alias("e")
        .description("Edit an instance")
        .action(editor.init);

    program.parse(process.argv);
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
