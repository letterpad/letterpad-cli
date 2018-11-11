const fs = require("fs");

module.exports = {
    setEnv: (path, data, dest) => {
        const contents = fs.readFileSync(path, "utf8");
        const envArr = contents.split("\n");
        const changedEnvArr = envArr.map(item => {
            let changedItem = item;
            Object.keys(data).map(key => {
                const needle = `${key}=`;
                if (item.indexOf(needle) === 0) {
                    changedItem = `${key}=${data[key]}`;
                }
            });
            return changedItem;
        });
        fs.writeFileSync(dest || path, changedEnvArr.join("\n"), "utf8");
    },
    readEnv: (path, key) => {
        const contents = fs.readFileSync(path, "utf8");
        const envArr = contents.split("\n");
        const needle = `${key}=`;
        const item = envArr.filter(item => item.indexOf(needle) === 0);
        if (item.length === 1) return item.split("=")[1];
        return null;
    }
};
