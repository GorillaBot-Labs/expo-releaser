const fs = require("fs")
const path = require("path")
const readline = require("readline")
const replace = require("replace-in-file")
const cwd = process.cwd()

// https://regexr.com/39s32
const semverRegex = /^((([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?)(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?)$/
const DEFAULT_APP_CONFIG_PATH = path.resolve(cwd, "./app.config.js")
const DEFAULT_EAS_JSON_PATH = path.resolve(cwd, "./eas.json")
const DEFAULT_PACKAGE_JSON_PATH = path.resolve(cwd, "./package.json")

function main(args) {
    const {releaseVersion, verbose} = args
    const appConfigPath = args.appConfigPath || DEFAULT_APP_CONFIG_PATH
    const appConfig = require(appConfigPath)

    if (!releaseVersion.match(semverRegex)) {
        console.error("Invalid app version:", releaseVersion)
    }

    updatePackageJsonVersion()
    updateAppVersions()
    updateReleaseChannelVersions()

    // Write version updates to app.config.js
    function updatePackageJsonVersion() {
        const packageJsonPath = args.packageJsonPath || DEFAULT_PACKAGE_JSON_PATH

        try {
            replace.sync({
                files: packageJsonPath,
                from: `"version": "${appConfig.version}"`,
                to: `"version": "${releaseVersion}"`,
            })
            // console.log("package.json saved!")
        } catch (e) {
            reportError(e)
        }

    }

    // Write version updates to app.config.js
    function updateAppVersions() {
        try {
            // App version
            replace.sync({
                files: appConfigPath,
                from: `version: "${appConfig.version}"`,
                to: `version: "${releaseVersion}"`,
            })

            // Apple build number
            const iosBuildNumber = appConfig.ios.buildNumber
            replace.sync({
                files: appConfigPath,
                from: `buildNumber: "${iosBuildNumber}"`,
                to: `buildNumber: "${parseInt(iosBuildNumber) + 1}"`,
            })

            // Android version code
            const androidVersionCode = appConfig.android.versionCode
            replace.sync({
                files: appConfigPath,
                from: `versionCode: ${androidVersionCode}`,
                to: `versionCode: ${androidVersionCode + 1}`,
            })
            // console.log("app.config.js saved!");
        } catch (e) {
            reportError(e)
        }

    }

    // Write version updates to eas.json
    function updateReleaseChannelVersions() {
        const easPath = args.easJsonPath || DEFAULT_EAS_JSON_PATH

        try {
            replace.sync({
                files: easPath,
                from: `staging-${appConfig.version}`,
                to: `staging-${releaseVersion}`,
            })
            replace.sync({
                files: easPath,
                from: `prod-${appConfig.version}`,
                to: `prod-${releaseVersion}`,
            })
            // console.log("eas.json saved!");
        } catch (e) {
            reportError(e)
        }
    }

    function reportError(error) {
        console.error(error)
        process.exit(1)
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
}


module.exports = main
