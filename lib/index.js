#!/usr/bin/env node
require("babel-polyfill");
const program = require("commander");

const commands = require("./commands");
const store = require("./store");

const { killOnCtrlC } = require("./utilities/listener");
const fetchReleases = require("./utilities/fetch-releases");
const { getCachedReleases } = require("./utilities/tracker");
const { setVerboseLogging, logger, logLevel } = require("./logger");

const run = () => {
  program
    .version("0.1.0")
    .description("A CLI utility to manage letterpad instances");

  commands().forEach(item => {
    program
      .command(item.cmd)
      .option("-v, --verbose", "Prints information of each step")
      .alias(item.alias)
      .description(item.description)
      .action(options => {
        if (options.verbose) {
          setVerboseLogging();
        }
        item.action();
      });
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
  return fetchReleases()
    .then(releases => {
      if (releases.length === 0) {
        logger("No versions found. Quiting.", logLevel.ERROR);
        process.exit();
      }
      const version = releases[0].version;
      store.setReleases(releases);
      store.setVersion(version);
      store.setCmdRunPath(process.cwd());
    })
    .catch(e => {
      logger(
        "Could not contact github server. Trying offline mode.",
        logLevel.WARN
      );
      store.setReleases(releases);
      const version = releases[0].version;
      store.setVersion(version);
    });
};

setStore().then(run);
// exist if user presses Ctrl+C
killOnCtrlC();
