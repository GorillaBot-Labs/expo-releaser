import {mkdir, rm} from "fs/promises";

export const cleanTmpFiles = async () => {
    await rm(process.env.__TMP_DIR__, {recursive: true, force: true})
    await mkdir(process.env.__TMP_DIR__)
}
