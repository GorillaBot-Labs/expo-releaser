const path = require("path")
const {readFile, copyFile, rm, mkdir} = require("fs/promises")
const createReleaseCmd = require("../commands/create-release")

const TMP_DIR = path.join(__dirname, "/.tmp")
const FIXTURES_DIR = path.join(__dirname, "/fixtures")

const cleanTmpFiles = async () => {
    await rm(TMP_DIR, { recursive: true, force: true })
    await mkdir(TMP_DIR)
}

beforeEach(async () => {
    await cleanTmpFiles()
})

afterAll(async () => {
    await cleanTmpFiles()
})

const useFixture = async (name) => {
    const src = `${FIXTURES_DIR}/${name}`
    const dest = `${TMP_DIR}/${name}`
    await copyFile(src, dest)
    return dest
}

const assertAppConfig = async (fixtureName, expectations) => {
    // TODO: figure out why we can't just require() here.
    const buffer = await readFile(`${TMP_DIR}/${fixtureName}`)
    const config = eval(buffer.toString())

    expect(config.version).toBe(expectations.version)
    expect(config.ios.buildNumber).toBe(expectations.ios.buildNumber)
    expect(config.android.versionCode).toBe(expectations.android.versionCode)
}

it("updates a standard app.config.js", async () => {
    const appConfigPath = await useFixture("app.config.js")

    const args = {
        releaseVersion: "1.1.0",
        appConfigPath
    }
    createReleaseCmd(args)

    await assertAppConfig("app.config.js", {
        version: "1.1.0",
        ios: {
            buildNumber: "2",
        },
        android: {
            versionCode: 2,
        }
    })
})
