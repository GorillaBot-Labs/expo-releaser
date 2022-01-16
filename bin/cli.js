#!/usr/bin/env node

const yargs = require("yargs/yargs")
const {hideBin} = require('yargs/helpers')
const createReleaseCmd = require("../commands/create-release")

yargs(hideBin(process.argv))
    // TODO: appConfigPath option
    .command('$0 <release-version>',
        "Creates a new release for your Expo app and updates config versions",
        () => {},
        createReleaseCmd
    )
    .option("release-version", {
        type: "string",
        description: "The new release version in semver format (1.4.0, 2.3.0, 6.6.5, etc.)"
    })
    .option('verbose', {
        alias: 'v',
        type: 'boolean',
        description: 'Run with verbose logging'
    })
    .parse()
