const shell = require("shelljs");

export const getLatestVersion = () => {
    return shell
        .exec("npm show letterpad version", { silent: true })
        .stdout.trim();
};
