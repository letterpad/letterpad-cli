const Table = require("cli-table");

const tracker = require("../utilities/tracker");
const common = require("../utilities/common");
const { logger, logLevel } = require("../logger");

class list {
    init = async () => {
        const installations = tracker.getInstallations();
        if (installations.length === 0) {
            logger("No installations found.", logLevel.ERROR);
            process.exit();
        }
        var table = new Table({
            style: { head: ["green"] },
            chars: common.uiTableChars,
            head: ["Name", "Installed path", "Version", "Api Port", "App Port"],
        });

        installations.forEach(item => {
            const { installationPath, version, name, apiPort, appPort } = item;
            table.push([name, installationPath, version, apiPort, appPort]);
        });

        console.log(table.toString());
        process.exit();
    };
}
module.exports = list;
