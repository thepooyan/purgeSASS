import {globSync} from "glob"
import * as sass from "sass"

export const compileSassFiles = (files: string[]) => {
    let fileNames = globSync(files)
    return fileNames.map(f => sass.compile(f).css )
}