#!/usr/bin/env node

const yargs = require("yargs/yargs")
const { hideBin } = require('yargs/helpers')
const createReleaseCmd = require("../commands/create-release")

yargs(hideBin(process.argv))
    .command('$0',
        "Creates a new release for your Expo app and updates config versions",
        () => { },
        createReleaseCmd
    )
    .option("release", {
        alias: "r",
        type: "string",
        description: "New semver release version"
    })
    .option("ignore-release-channel", {
        alias: "i",
        type: "boolean",
        description: "Will not increment release channel versions. Useful if you use single persisted staging or production branches"
    })
    .option("verbose", {
        alias: "v",
        type: "boolean",
        description: "Run with verbose logging"
    })
    .demandOption(["release"])
    .parse()
