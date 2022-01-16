const path = require("path")
const replaceInFile = require("replace-in-file")
const cwd = process.cwd()

// https://regexr.com/39s32
const semverRegex = /^((([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?)(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?)$/
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

    validateStep(args)
    updatePackageStep(args, currentAppConfig)
    updateAppConfigStep(args, currentAppConfig, currentAppConfigPath)
    updateReleaseChannelsStep(args, currentAppConfig)
}

/**
 * Validate the command params and project setup before executing further
 *
 * @param {Object} args Command line arguments
 */
function validateStep(args) {
    const {releaseVersion} = args
    if (!releaseVersion.match(semverRegex)) {
        throw new Error(`Invalid app version: '${semverRegex}'. Please follow https://semver.org/`, )
    }

    // TODO: cannot go back in semver
}

/**
 * Write version updates to package.json
 *
 * @param {Object} args Command line arguments
 * @param {Object} appConfig The current expo app.config.js file content
 */
function updatePackageStep(args, appConfig) {
    const {releaseVersion} = args

    const packageJsonPath = args.packageJsonPath || DEFAULT_PACKAGE_JSON_PATH
    __replace(packageJsonPath, `"version": "${appConfig.version}"`, `"version": "${releaseVersion}"`)
}

/**
 * Write version updates to app.config.js
 *
 * @param {Object} args The command line arguments
 * @param {Object} appConfig The current expo app.config.js file content
 * @param {String} appConfigPath The current expo app.config.js file path
 */
function updateAppConfigStep(args, appConfig, appConfigPath) {
    const {releaseVersion} = args
    // App version
    __replace(appConfigPath, `version: "${appConfig.version}"`, `version: "${releaseVersion}"`)

    // Apple build number
    const iosBuildNumber = appConfig.ios.buildNumber
    __replace(appConfigPath, `buildNumber: "${iosBuildNumber}"`, `buildNumber: "${parseInt(iosBuildNumber) + 1}"`)

    // Android version code
    const androidVersionCode = appConfig.android.versionCode
    __replace(appConfigPath, `versionCode: ${androidVersionCode}`, `versionCode: ${androidVersionCode + 1}`)
}

/**
 * Write version updates to eas.json
 *
 * @param {Object} args The command line arguments
 * @param {Object} appConfig The current expo app.config.js file content
 */
function updateReleaseChannelsStep(args, appConfig) {
    const {releaseVersion} = args
    const easPath = args.easJsonPath || DEFAULT_EAS_JSON_PATH

    __replace(easPath, `staging-${appConfig.version}`, `staging-${releaseVersion}`)
    __replace(easPath, `prod-${appConfig.version}`, `prod-${releaseVersion}`)
}

// Replace content in a file on disk
function __replace(path, from, to) {
    try {
        replaceInFile.sync({files: path, from, to})
    } catch (e) {
        console.error(e)
        process.exit(1)
    }
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
