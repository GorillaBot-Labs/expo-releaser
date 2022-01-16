#!/usr/bin/env node

import meow from "meow"
import path from "path"
import replace from "replace-in-file"

const packageJsonPath = path.resolve(__dirname, "../package.json")
const appConfigPath = path.resolve(__dirname, "../app.config.js")
const easConfigPath = path.resolve(__dirname, "../eas.json")

const appConfig = require(appConfigPath)
const easConfig = require(easConfigPath)
const readline = require("readline")
// https://regexr.com/39s32
const semverRegex = /^((([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?)(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?)$/

reportCurrentVersions()
askForNewVersion()

function reportCurrentVersions() {
    console.table({
        "App Version": appConfig.version,
        "Staging Release": easConfig.build.staging.releaseChannel,
        "Production Release": easConfig.build.prod.releaseChannel,
    })
    console.log("\n")
    console.log("Looks the current app version is ", appConfig.version)
}

function askForNewVersion() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    rl.question("What is the new app version you want to create? ", function (newAppVersion) {
        if (!newAppVersion.match(semverRegex)) {
            console.error("Invalid app version:", newAppVersion)
            rl.close()
        }

        updatePackageJsonVersion(newAppVersion)
        updateAppVersions(newAppVersion)
        updateReleaseChannelVersions(newAppVersion)

        rl.close()
    })

    rl.on("close", function () {
        process.exit(0);
    })
}

// Write version updates to app.config.js
function updatePackageJsonVersion(newAppVersion) {
    try {
        replace.sync({
            files: packageJsonPath,
            from: `"version": "${appConfig.version}"`,
            to: `"version": "${newAppVersion}"`,
        })
        console.log("package.json saved!")
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
        console.log("app.config.js saved!");
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
        console.log("eas.json saved!");
    } catch (e) {
        reportError(e)
    }
}

function reportError(error) {
    console.error(error)
    process.exit(1)
}

