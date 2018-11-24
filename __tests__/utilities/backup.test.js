const path = require("path");
const fs = require("fs-extra");
const backup = require("../../lib/utilities/backup");
const config = require("../../lib/config");
const rimraf = require("rimraf");

describe("Backup", () => {
  const sourceFolder = path.join(__dirname, "/../playground");
  const destination = path.join(__dirname, "/../playground/backup");
  const fileNameToBackup = "testFile.txt";

  beforeAll(() => {
    // create a file to backup
    fs.writeFileSync(
      sourceFolder + "/" + fileNameToBackup,
      "File to backup",
      "utf8"
    );
    // create the backup folder
    fs.ensureDirSync(destination);
  });

  afterAll(() => {
    rimraf.sync(destination);
    rimraf.sync(sourceFolder + "/" + fileNameToBackup);
  });

  it("can backup files", () => {
    config.backupPath = destination;
    backup.filesToBackup = {
      testFile: "testFile.txt",
    };
    backup.perform(sourceFolder);
    // the backup folder will create a folder with a hash name
    const hashedBackupFolder = Buffer.from(sourceFolder).toString("base64");
    expect(
      fs.readFileSync(
        destination + "/" + hashedBackupFolder + "/testFile.txt",
        "utf8"
      )
    ).toBe("File to backup");
  });
});
