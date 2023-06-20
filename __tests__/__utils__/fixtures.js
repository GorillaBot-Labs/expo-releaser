import { cp } from "node:fs/promises";

export const useFixture = async (name) => {
    const src = `${process.env.__FIXTURES_DIR__}/${name}`

    // We nest fixtures, but need a simple way to assert files against a their predetermined name
    // (e.g. app.config.js or package.json) This has obvious problems with duplicate names so you cannot
    // ever copy and assert two files of the same name in the same test. This is acceptable tech debt for now.
    const baseFileName = name.split("/")[1]
    const dest = `${process.env.__TMP_DIR__}/${baseFileName}`

    await cp(src, dest, { recursive: true })
    return dest
}
