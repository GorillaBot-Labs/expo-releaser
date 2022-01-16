import {copyFile} from "fs/promises";

export const useFixture = async (name) => {
    const src = `${process.env.__FIXTURES_DIR__}/${name}`
    const dest = `${process.env.__TMP_DIR__}/${name}`
    await copyFile(src, dest)
    return dest
}
