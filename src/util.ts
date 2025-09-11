import {globSync} from "glob"
import * as sass from "sass"

export const compileSassFiles = (files: string[]) => {
    let fileNames = globSync(files)
    return fileNames.map(f => ({raw: sass.compile(f).css, name: f}) )
}