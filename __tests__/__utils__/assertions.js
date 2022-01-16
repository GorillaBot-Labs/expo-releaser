import {readFile} from "fs/promises";

export const assertSuccess = async () => {
    expect(process.exit).toBeCalledWith(0)
    expect(console.error).not.toBeCalled()
}

export const assertFailed = async (errorMessages) => {
    expect(process.exit).toBeCalledWith(1)
    errorMessages.forEach((message) => {
        expect(console.error).toBeCalledWith(message)
    })
}

export const assertAppConfig = async (expectations) => {
    // TODO: figure out why we can't just require() here.
    const buffer = await readFile(`${process.env.__TMP_DIR__}/app.config.js`)
    const config = eval(buffer.toString())

    expect(config.version).toBe(expectations.version)
    expect(config.ios.buildNumber).toBe(expectations.ios.buildNumber)
    expect(config.android.versionCode).toBe(expectations.android.versionCode)
}

export const assertEasJson = async (expectations) => {
    // TODO: figure out why we can't just require() here.
    const buffer = await readFile(`${process.env.__TMP_DIR__}/eas.json`)
    const json = JSON.parse(buffer.toString())

    expect(json.build.staging.releaseChannel).toBe(expectations.build.staging.releaseChannel)
    expect(json.build.prod.releaseChannel).toBe(expectations.build.prod.releaseChannel)
}

export const assertPackageJson = async (expectations) => {
    // TODO: figure out why we can't just require() here.
    const buffer = await readFile(`${process.env.__TMP_DIR__}/package.json`)
    const json = JSON.parse(buffer.toString())

    expect(json.version).toBe(expectations.version)
}
