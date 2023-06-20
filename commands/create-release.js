const path = require("path")
const replaceInFile = require("replace-in-file")
const git = require("../helpers/git");
const cwd = process.cwd()

const DEFAULT_APP_CONFIG_PATH = path.resolve(cwd, "./app.config.js")
const DEFAULT_EAS_JSON_PATH = path.resolve(cwd, "./eas.json")
const DEFAULT_PACKAGE_JSON_PATH = path.resolve(cwd, "./package.json")

/**
 * Runs the command
 * @param {Object} args Command line arguments
 */
function run(args) {
    const currentAppConfigPath = args.appConfigPath || DEFAULT_APP_CONFIG_PATH
    const currentAppConfig = require(currentAppConfigPath)

    return validateReleaseStep(args)
        .then(() => validateGitStatusStep())
        .then(() => updatePackageStep(args, currentAppConfig))
        .then(() => updateAppConfigStep(args, currentAppConfig, currentAppConfigPath))
        .then(() => updateReleaseChannelsStep(args, currentAppConfig))
        .then(() => {
            process.exit(0)
        })
        .catch((e) => {
            console.error(e.message)
            process.exit(1)
        })
}

/**
 * Validate the command params and project setup before executing further
 *
 * @param {Object} args Command line arguments
 * @return {Promise}
 */
function validateReleaseStep(args) {
    return new Promise((resolve, reject) => {
        const { release } = args

        // https://regexr.com/39s32
        const semverRegex = /^((([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?)(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?)$/
        if (!release.match(semverRegex)) {
            return reject(new Error(`Invalid app version: '${release}'. Please follow https://semver.org/`))
        }


        // TODO: validate cannot go back in semver

        return resolve()
    })
}

/**
 * @return {Promise}
 */
function validateGitStatusStep() {
    return new Promise((resolve, reject) => {
        git.status(function (err, statusSummary) {
            if (err) return reject(err)

            const { modified } = statusSummary

            if (modified.length > 0) {
                console.error("You have git working changes. Please resolve the following files before continuing.")
                console.error(modified)
                return reject(new Error("Invalid git workspace"))
            }

            return resolve()
        })
    })
}

/**
 * Write version updates to package.json
 *
 * @param {Object} args Command line arguments
 * @param {Object} appConfig The current expo app.config.js file content
 * @return {Promise<void>}
 */
function updatePackageStep(args, appConfig) {
    const { release } = args

    const packageJsonPath = args.packageJsonPath || DEFAULT_PACKAGE_JSON_PATH
    __replace(packageJsonPath, `"version": "${appConfig.version}"`, `"version": "${release}"`)

    return Promise.resolve()
}

/**
 * Write version updates to app.config.js
 *
 * @param {Object} args The command line arguments
 * @param {Object} appConfig The current expo app.config.js file content
 * @param {String} appConfigPath The current expo app.config.js file path
 * @return {Promise<void>}
 */
function updateAppConfigStep(args, appConfig, appConfigPath) {
    const { release } = args
    // App version
    __replace(appConfigPath, `version: "${appConfig.version}"`, `version: "${release}"`)

    // Apple build number
    const iosBuildNumber = appConfig.ios.buildNumber
    __replace(appConfigPath, `buildNumber: "${iosBuildNumber}"`, `buildNumber: "${parseInt(iosBuildNumber) + 1}"`)

    // Android version code
    const androidVersionCode = appConfig.android.versionCode
    __replace(appConfigPath, `versionCode: ${androidVersionCode}`, `versionCode: ${androidVersionCode + 1}`)

    return Promise.resolve()
}

/**
 * Write version updates to eas.json
 *
 * @param {Object} args The command line arguments
 * @param {Object} appConfig The current expo app.config.js file content
 * @return {Promise<void>}
 */
function updateReleaseChannelsStep(args, appConfig) {
    const { release, ignoreReleaseChannel } = args
    const easPath = args.easJsonPath || DEFAULT_EAS_JSON_PATH

    if (!ignoreReleaseChannel) {
        __replace(easPath, `staging-${appConfig.version}`, `staging-${release}`)
        __replace(easPath, `production-${appConfig.version}`, `production-${release}`)
    }

    return Promise.resolve()
}

// Replace content in a file on disk
function __replace(path, from, to) {
    replaceInFile.sync({ files: path, from, to })
}

// TODO: it would nice to display some before and after version changes in verbose mode
// function reportVersions() {
//     const currentStagingReleaseChannel = (easJSON && easJSON.build.staging.releaseChannel) || null
//     const currentProdReleaseChannel = (easJSON && easJSON.build.prod.releaseChannel) || null
//
//     console.table({
//         "App Version": appConfig.version,
//         "Staging Release": currentStagingReleaseChannel,
//         "Production Release": currentProdReleaseChannel,
//     })
//     console.log("Your current app version is:", appConfig.version)
// }


module.exports = run
