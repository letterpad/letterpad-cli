const fs = require("fs-extra");
const rimraf = require("rimraf");
const path = require("path");

const upgrade = require("../../lib/actions/upgrade");
const config = require("../../lib/config");
const {
  installationPath,
  cachePath,
  createInstallation,
} = require("../utils/inputs");

describe("Can upgrade from exisitng sources", () => {
  let upgrader;

  beforeAll(() => {
    // remove test installation
    rimraf.sync(path.join(installationPath, "/../lp"));
    config.cachePath = cachePath;
    // upgrade can happen for an existing installation
    createInstallation(installationPath + "/lp", "v1.0");

    //create upgrade source
    createInstallation(cachePath + "/v2.0", "v2.0");

    upgrader = new upgrade();
    upgrader.latestVersion = "v2.0";

    // assume these releases are available
    upgrader.installer.releases = [
      {
        version: "v2.0",
        zipball_url: "http://github.com/version/v2.0",
      },
      {
        version: "v1.0",
        zipball_url: "http://github.com/version/v1.0",
      },
    ];
    // user selects 2.0 (detects v2.0)
    upgrader.installer.inputs.version = "2.0";
    upgrader.upgradePath = installationPath + "/lp";
  });

  afterAll(() => {
    rimraf.sync(path.join(installationPath, "/../lp"));
  });

  it("Able to prepare the installation", () => {
    upgrader.start().then(() => {
      expect(fs.readFileSync(installationPath + "/lp/index.txt", "utf8")).toBe(
        "v2.0"
      );
    });
  });
});
