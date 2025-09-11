import fs, { glob, globSync } from "fs"
import * as sass from "sass"

export const compileSassFiles = (files: string[]) => {
    let fileContents = globSync(files)
    return fileContents.map(f => sass.compile(f).css)
}