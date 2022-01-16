const path = require("path")
const {readFile, copyFile, rm, mkdir} = require("fs/promises")
const createReleaseCmd = require("../commands/create-release")

const TMP_DIR = path.join(__dirname, "/.tmp")
const FIXTURES_DIR = path.join(__dirname, "/fixtures")

const cleanTmpFiles = async () => {
    await rm(TMP_DIR, {recursive: true, force: true})
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

const assertAppConfig = async (expectations) => {
    // TODO: figure out why we can't just require() here.
    const buffer = await readFile(`${TMP_DIR}/app.config.js`)
    const config = eval(buffer.toString())

    expect(config.version).toBe(expectations.version)
    expect(config.ios.buildNumber).toBe(expectations.ios.buildNumber)
    expect(config.android.versionCode).toBe(expectations.android.versionCode)
}

const assertEasJson = async (expectations) => {
    // TODO: figure out why we can't just require() here.
    const buffer = await readFile(`${TMP_DIR}/eas.json`)
    const json = JSON.parse(buffer.toString())

    expect(json.build.staging.releaseChannel).toBe(expectations.build.staging.releaseChannel)
    expect(json.build.prod.releaseChannel).toBe(expectations.build.prod.releaseChannel)
}

const assertPackageJson = async (expectations) => {
    // TODO: figure out why we can't just require() here.
    const buffer = await readFile(`${TMP_DIR}/package.json`)
    const json = JSON.parse(buffer.toString())

    expect(json.version).toBe(expectations.version)
}

it("updates an app.config.js", async () => {
    const appConfigPath = await useFixture("app.config.js")

    const args = {
        releaseVersion: "1.1.0",
        appConfigPath,
    }
    createReleaseCmd(args)

    await assertAppConfig({
        version: "1.1.0",
        ios: {buildNumber: "2"},
        android: {versionCode: 2}
    })
})

it("updates an eas.json", async () => {
    const appConfigPath = await useFixture("app.config.js")
    const easJsonPath = await useFixture("eas.json")

    const args = {
        releaseVersion: "1.1.0",
        easJsonPath,
        appConfigPath,
    }
    createReleaseCmd(args)

    await assertEasJson({
        build: {
            staging: {releaseChannel: "staging-1.1.0"},
            prod: {releaseChannel: "prod-1.1.0"}
        },
    })
})

it("updates a package.json", async () => {
    const appConfigPath = await useFixture("app.config.js")
    const packageJsonPath = await useFixture("package.json")

    const args = {
        releaseVersion: "1.1.0",
        packageJsonPath,
        appConfigPath,
    }
    createReleaseCmd(args)

    await assertPackageJson({version: "1.1.0"})
})

it("updates all files", async () => {
    const appConfigPath = await useFixture("app.config.js")
    const easJsonPath = await useFixture("eas.json")
    const packageJsonPath = await useFixture("package.json")

    const args = {
        releaseVersion: "1.1.0",
        appConfigPath,
        easJsonPath,
        packageJsonPath,
    }
    createReleaseCmd(args)

    await assertAppConfig({
        version: "1.1.0",
        ios: {buildNumber: "2"},
        android: {versionCode: 2}
    })
    await assertEasJson({
        build: {
            staging: {releaseChannel: "staging-1.1.0"},
            prod: {releaseChannel: "prod-1.1.0"}
        },
    })
    await assertPackageJson({version: "1.1.0"})
})

it("throws an error for an valid semver version", async () => {
    const appConfigPath = await useFixture("app.config.js")
    const easJsonPath = await useFixture("eas.json")
    const packageJsonPath = await useFixture("package.json")

    const args = {
        releaseVersion: "bad-version",
        appConfigPath,
        easJsonPath,
        packageJsonPath,
    }
    expect(() => createReleaseCmd(args)).toThrow()

    await assertAppConfig({
        version: "1.0.0",
        ios: {buildNumber: "1"},
        android: {versionCode: 1}
    })
    await assertEasJson({
        build: {
            staging: {releaseChannel: "staging-1.0.0"},
            prod: {releaseChannel: "prod-1.0.0"}
        },
    })
    await assertPackageJson({version: "1.0.0"})
})
