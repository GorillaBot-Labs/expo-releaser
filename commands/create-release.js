const fs = require("fs")
const path = require("path")
const readline = require("readline")
const replace = require("replace-in-file")
const cwd = process.cwd()

// https://regexr.com/39s32
const semverRegex = /^((([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?)(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?)$/
const DEFAULT_APP_CONFIG_PATH = path.resolve(cwd, "./app.config.js")

function main(args) {
    const {releaseVersion, verbose} = args
    const packageJsonPath = path.resolve(cwd, "./package.json")
    const appConfigPath = args.appConfigPath || DEFAULT_APP_CONFIG_PATH
    const easConfigPath = path.resolve(cwd, "./eas.json")

    const appConfig = require(appConfigPath)
    let easJSON = null
    let packageJSON = null

    try {
        if (fs.existsSync(easConfigPath)) {
            easJSON = JSON.parse(fs.readFileSync(easConfigPath).toString())
        }

        if (fs.existsSync(packageJsonPath)) {
            packageJSON = JSON.parse(fs.readFileSync(packageJsonPath).toString())
        }
    } catch (e) {
    }

    if (!releaseVersion.match(semverRegex)) {
        console.error("Invalid app version:", releaseVersion)
    }

    if (packageJSON) {
        updatePackageJsonVersion(releaseVersion)
    }

    updateAppVersions(releaseVersion)
    updateReleaseChannelVersions(releaseVersion)

    // Write version updates to app.config.js
    function updatePackageJsonVersion(newAppVersion) {
        try {
            replace.sync({
                files: packageJsonPath,
                from: `"version": "${appConfig.version}"`,
                to: `"version": "${newAppVersion}"`,
            })
            // console.log("package.json saved!")
        } catch (e) {
            reportError(e)
        }

    }

    // Write version updates to app.config.js
    function updateAppVersions(newAppVersion) {
        try {
            // App version
            replace.sync({
                files: appConfigPath,
                from: `version: "${appConfig.version}"`,
                to: `version: "${newAppVersion}"`,
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
    function updateReleaseChannelVersions(newAppVersion) {
        try {
            replace.sync({
                files: easConfigPath,
                from: `staging-${appConfig.version}`,
                to: `staging-${newAppVersion}`,
            })
            replace.sync({
                files: easConfigPath,
                from: `prod-${appConfig.version}`,
                to: `prod-${newAppVersion}`,
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
