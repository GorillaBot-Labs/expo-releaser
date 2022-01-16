// @see - https://jestjs.io/docs/configuration#globalsetup-string
const path = require("path")

module.exports = async () => {
    process.env.__FIXTURES_DIR__ = path.join(__dirname, "/__tests__/__fixtures__")
    process.env.__TMP_DIR__ = path.join(__dirname, "/__tests__/.tmp");
}
