#!/usr/bin/env node
const program = require("commander");

const commands = require("./commands");
const store = require("./store");

const { setVerboseLogging, logger, logLevel } = require("./logger");
const { killOnCtrlC } = require("./utilities/listener");
const fetchReleases = require("./utilities/fetch-releases");
const { getCachedReleases } = require("./utilities/tracker");

// read the package.json file
const pkg = require("../package.json");

const run = () => {
  program.version(pkg.version).description(pkg.description);

  commands().forEach(item => {
    program
      .command(item.cmd)
      .option("-d, --debug", "Prints information of each step")
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

  // Handle commands, if no arguments found
  const noCommand = program.args.length === 0;
  if (noCommand) {
    program.help();
  }
};

/**
 * Set the store with some initial data before booting the cli app
 */
const setStore = () => {
  return getReleases().then(releases => {
    const version = releases[0].version;
    store.setCmdRunPath(process.cwd());
    store.setReleases(releases);
    store.setVersion(version);
  });
};

/**
 * Contact github to get the latest releases of letterpad
 */
const getReleases = () => {
  let releases = getCachedReleases();
  return fetchReleases()
    .then(releases => {
      if (releases.length === 0) {
        logger("No versions found. Quiting.", logLevel.ERROR);
        process.exit();
      }
      return releases;
    })
    .catch(e => {
      logger(
        "Could not connect to github. Trying offline mode.",
        logLevel.ANNOUNCE
      );
      return releases;
    });
};

setStore().then(run);
// exist if user presses Ctrl+C
killOnCtrlC();
