const createReleaseCmd = require("../commands/create-release")
const { cleanTmpFiles } = require("./__utils__/helpers");
const { useFixture } = require("./__utils__/fixtures");
const {
    assertAppConfig,
    assertPackageJson,
    assertEasJson,
    assertSuccess,
    assertFailed
} = require("./__utils__/assertions");
const git = require("../helpers/git")

jest.mock("../helpers/git")
console.error = jest.fn()
process.exit = jest.fn()

beforeEach(async () => {
    await cleanTmpFiles()

    git.status = jest.fn((cb) => cb(null, { modified: [] }))
})

afterAll(async () => {
    jest.resetAllMocks()
    await cleanTmpFiles()
})

describe("CLI", () => {
    describe("-r 'release channel versions'", () => {
        it("updates an app.config.js", async () => {
            const appConfigPath = await useFixture("release-channel-versions/app.config.js")

            const args = {
                release: "1.1.0",
                appConfigPath,
            }
            await createReleaseCmd(args)

            await assertAppConfig({
                version: "1.1.0",
                ios: { buildNumber: "2" },
                android: { versionCode: 2 }
            })
            await assertSuccess()
        });

        it("updates an eas.json", async () => {
            const appConfigPath = await useFixture("release-channel-versions/app.config.js")
            const easJsonPath = await useFixture("release-channel-versions/eas.json")

            const args = {
                release: "1.1.0",
                easJsonPath,
                appConfigPath,
            }
            await createReleaseCmd(args)

            await assertEasJson({
                build: {
                    staging: { releaseChannel: "staging-1.1.0" },
                    prod: { releaseChannel: "prod-1.1.0" }
                },
            })
            await assertSuccess()
        })

        it("updates a package.json", async () => {
            const appConfigPath = await useFixture("release-channel-versions/app.config.js")
            const packageJsonPath = await useFixture("release-channel-versions/package.json")

            const args = {
                release: "1.1.0",
                packageJsonPath,
                appConfigPath,
            }
            await createReleaseCmd(args)

            await assertPackageJson({ version: "1.1.0" })
            await assertSuccess()
        })

        it("updates all files", async () => {
            const appConfigPath = await useFixture("release-channel-versions/app.config.js")
            const easJsonPath = await useFixture("release-channel-versions/eas.json")
            const packageJsonPath = await useFixture("release-channel-versions/package.json")

            const args = {
                release: "1.1.0",
                appConfigPath,
                easJsonPath,
                packageJsonPath,
            }
            await createReleaseCmd(args)

            await assertAppConfig({
                version: "1.1.0",
                ios: { buildNumber: "2" },
                android: { versionCode: 2 }
            })
            await assertEasJson({
                build: {
                    staging: { releaseChannel: "staging-1.1.0" },
                    prod: { releaseChannel: "prod-1.1.0" }
                },
            })
            await assertPackageJson({ version: "1.1.0" })
            await assertSuccess()
        })

        it("throws an error for an invalid semver version", async () => {
            const appConfigPath = await useFixture("release-channel-versions/app.config.js")
            const easJsonPath = await useFixture("release-channel-versions/eas.json")
            const packageJsonPath = await useFixture("release-channel-versions/package.json")

            const args = {
                release: "bad-version",
                appConfigPath,
                easJsonPath,
                packageJsonPath,
            }
            await createReleaseCmd(args)

            await assertAppConfig({
                version: "1.0.0",
                ios: { buildNumber: "1" },
                android: { versionCode: 1 }
            })
            await assertEasJson({
                build: {
                    staging: { releaseChannel: "staging-1.0.0" },
                    prod: { releaseChannel: "prod-1.0.0" }
                },
            })
            await assertPackageJson({ version: "1.0.0" })
            await assertFailed([
                "Invalid app version: 'bad-version'. Please follow https://semver.org/"
            ])
        })

        it("throws an error git workspace is not clean", async () => {
            const appConfigPath = await useFixture("release-channel-versions/app.config.js")
            const easJsonPath = await useFixture("release-channel-versions/eas.json")
            const packageJsonPath = await useFixture("release-channel-versions/package.json")
            const modifiedFiles = ["file.txt", "service.js", "README.md"]
            git.status = jest.fn((cb) => cb(null, { modified: modifiedFiles }))

            const args = {
                release: "1.1.0",
                appConfigPath,
                easJsonPath,
                packageJsonPath,
            }
            await createReleaseCmd(args)

            await assertAppConfig({
                version: "1.0.0",
                ios: { buildNumber: "1" },
                android: { versionCode: 1 }
            })
            await assertEasJson({
                build: {
                    staging: { releaseChannel: "staging-1.0.0" },
                    prod: { releaseChannel: "prod-1.0.0" }
                },
            })
            await assertPackageJson({ version: "1.0.0" })
            await assertFailed([
                "Invalid git workspace",
                "You have git working changes. Please resolve the following files before continuing.",
                modifiedFiles,
            ])
        })
    })
})