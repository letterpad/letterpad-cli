const chalk = require("chalk");
let verbose = false;

export const logLevel = {
    WARN: "warn",
    ERROR: "error",
    SUCCESS: "success",
    ANNOUNCE: "announce"
};

export const setVerboseLogging = (flag = true) => {
    verbose = flag;
};

export const log = console.log;

export const debug = msg => {
    if (verbose) {
        log(chalk.yellow("[debug] " + msg));
    }
};

export const logger = (msg, type) => {
    switch (type) {
        case logLevel.SUCCESS:
            log(chalk.green.bold(msg));
            break;
        case logLevel.ANNOUNCE:
            log(chalk.bold(msg));
            break;
        case logLevel.WARN:
            log(chalk.yellow.bold(msg));
            break;
        case logLevel.ERROR:
            log(chalk.red.bold(msg));
            break;
        default:
            log(msg);
    }
};
