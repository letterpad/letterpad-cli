const chalk = require("chalk");

export const logLevel = {
    WARN: "warn",
    ERROR: "error",
    SUCCESS: "success",
    ANNOUNCE: "announce"
};

export const log = console.log;
export const debug = msg => log(chalk.yellow("[debug] " + msg));

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
