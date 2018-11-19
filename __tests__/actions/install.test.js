const install = require("../../lib/actions/install");
const config = require("../../lib/config");
const tracker = require("../../lib/utilities/tracker");
const envEditor = require("../../lib/utilities/envEditor");
const {
    installationPath,
    cachePath,
    setInstallDefaults
} = require("../utils/inputs");

const fs = require("fs-extra");
const rimraf = require("rimraf");
const path = require("path");

describe("Check install", () => {
    let installer;
    beforeAll(() => {
        rimraf.sync(path.join(installationPath, "/../lp"));
        rimraf.sync(path.join(cachePath, "/instance.json"));

        installer = new install();
        installer = setInstallDefaults(installer);
    });

    afterAll(() => {
        rimraf.sync(path.join(installationPath, "/../lp"));
        rimraf.sync(path.join(cachePath, "/instance.json"));
    });

    it("Able to prepare the installation", async () => {
        await installer.prepare();
        const output = {
            installationPath: installationPath
        };
        expect(installer.inputs.installationPath).toBe(output.installationPath);
    });

    it("creates necessary files folder", async () => {
        await installer.preInstall();
        expect(fs.existsSync(installationPath)).toBe(true);
    });

    it("able to install", async () => {
        expect(installer.sourceExist).toBe(true);
    });

    it("found sources", async () => {
        await installer.postInstall();
        expect(fs.existsSync(installationPath + "/sample.env")).toBe(true);
    });

    it("moved sources to destination", async () => {
        await installer.finish();
        const contents = envEditor.readEnv(installationPath + "/.env");
        expect(contents.apiUrl).toBe("apiUrl");
    });

    it("created symlink", async () => {
        const link = fs.readlinkSync(installationPath + "/index.txt");
        expect(link).toBe(cachePath + "/1/index.txt");
    });

    it("sets tracker", async () => {
        config.instanceInfoPath = cachePath + "/instance.json";
        tracker.set(installer.inputs);
        const t = tracker.read();
        expect(t[installationPath].installationPath).toBe(installationPath);
    });
});
