const install = require("../../lib/actions/install");
const config = require("../../lib/config");
const tracker = require("../../lib/utilities/tracker");
const envEditor = require("../../lib/utilities/envEditor");
const { cachePath, setInstallDefaults } = require("../utils/helper");

const fs = require("fs-extra");
const rimraf = require("rimraf");
const path = require("path");

describe("Can install from exisitng sources", () => {
  let installer;
  let installationPath = path.join(
    __dirname,
    "/../playground/installations/lp"
  );
  beforeAll(() => {
    rimraf.sync(installationPath);
    rimraf.sync(path.join(cachePath, "/instance.json"));

    installer = new install();
    installer = setInstallDefaults(installer);
    installer.inputs.installationPath = installationPath;

    // assume these releases are available
    installer.releases = [
      { version: "v1.0", zipball_url: "http://github.com/version/v1.0" },
    ];
    // user selects 1.0 (detects v1.0)
    installer.inputs.version = "1.0";
  });

  afterAll(() => {
    rimraf.sync(installationPath);
    rimraf.sync(path.join(cachePath, "/instance.json"));
  });

  it("Able to prepare the installation", () => {
    installer.prepare();
    const output = {
      installationPath: installationPath,
    };
    expect(installer.inputs.installationPath).toBe(output.installationPath);
  });

  it("creates necessary files folder", () => {
    installer.preInstall();
    expect(fs.existsSync(installationPath)).toBe(true);
  });

  it("able to install", async () => {
    expect(installer.sourceExist).toBe(true);
  });

  it("found sources", () => {
    installer.postInstall();
    expect(fs.existsSync(installationPath + "/sample.env")).toBe(true);
  });

  it("moved sources to destination", () => {
    installer.finish();
    const contents = envEditor.readEnv(installationPath + "/.env");
    expect(contents.rootUrl).toBe("rootUrl");
  });

  it("created symlink", () => {
    const link = fs.readlinkSync(installationPath + "/index.txt");
    const version = installer.inputs.version;
    expect(link).toBe(cachePath + "/" + version + "/index.txt");
  });

  it("sets tracker", () => {
    config.instanceInfoPath = cachePath + "/instance.json";
    tracker.set(installer.inputs);
    const t = tracker.read();
    expect(t[installationPath].installationPath).toBe(installationPath);
  });
});
