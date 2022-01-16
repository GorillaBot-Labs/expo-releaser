import {readFile} from "fs/promises";

/**
 * Assert that our command ran successfully
 * @return {Promise<void>}
 */
export const assertSuccess = async () => {
    expect(process.exit).toBeCalledWith(0)
    expect(console.error).not.toBeCalled()
}

/**
 * Assert that our command failed to run and some errors
 * @return {Promise<void>}
 */
export const assertFailed = async (errorMessages) => {
    expect(process.exit).toBeCalledWith(1)
    errorMessages.forEach((message) => {
        expect(console.error).toBeCalledWith(message)
    })
}

export const assertAppConfig = async (expectations) => {
    const buffer = await readFile(`${process.env.__TMP_DIR__}/app.config.js`)
    const config = eval(buffer.toString())

    expect(config.version).toBe(expectations.version)
    expect(config.ios.buildNumber).toBe(expectations.ios.buildNumber)
    expect(config.android.versionCode).toBe(expectations.android.versionCode)
}

export const assertEasJson = async (expectations) => {
    const buffer = await readFile(`${process.env.__TMP_DIR__}/eas.json`)
    const json = JSON.parse(buffer.toString())

    expect(json.build.staging.releaseChannel).toBe(expectations.build.staging.releaseChannel)
    expect(json.build.prod.releaseChannel).toBe(expectations.build.prod.releaseChannel)
}

export const assertPackageJson = async (expectations) => {
    const buffer = await readFile(`${process.env.__TMP_DIR__}/package.json`)
    const json = JSON.parse(buffer.toString())

    expect(json.version).toBe(expectations.version)
}
