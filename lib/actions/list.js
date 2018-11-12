const tracker = require("../utilities/tracker");
const Table = require("cli-table");
const common = require("../utilities/common");

class list {
    init = async () => {
        const installations = tracker.getInstallations();
        var table = new Table({
            chars: common.uiTableChars,
            head: ["Name", "Installed path", "Version", "Api Port", "App Port"]
        });

        installations.forEach(item => {
            const { installationPath, version, name, apiPort, appPort } = item;
            table.push([name, installationPath, version, apiPort, appPort]);
        });

        console.log(table.toString());
    };
}
module.exports = list;
