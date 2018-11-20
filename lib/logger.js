const chalk = require("chalk");
let verbose = false;

const logger = {
  logLevel: {
    WARN: "warn",
    ERROR: "error",
    SUCCESS: "success",
    ANNOUNCE: "announce",
  },
  setVerboseLogging: (flag = true) => {
    verbose = flag;
  },
  log: console.log,
  debug: msg => {
    if (verbose) {
      logger.log(chalk.yellow("[debug] " + msg));
    }
  },
  logger: (msg, type) => {
    switch (type) {
      case logger.logLevel.SUCCESS:
        logger.log(chalk.green.bold(msg));
        break;
      case logger.logLevel.ANNOUNCE:
        logger.log(chalk.bold(msg));
        break;
      case logger.logLevel.WARN:
        logger.log(chalk.yellow.bold(msg));
        break;
      case logger.logLevel.ERROR:
        logger.log(chalk.red.bold(msg));
        break;
      default:
        logger.log(msg);
    }
  },
};

module.exports = logger;
