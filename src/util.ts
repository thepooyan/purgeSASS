import {globSync} from "glob"
import * as sass from "sass"
import type { props } from "."
import { PurgeCSS } from "purgecss"

export const compileSassFiles = (files: string[]) => {
    let fileNames = globSync(files)
    return fileNames.map(f => ({raw: sass.compile(f).css, name: f}) )
}

export const findUnusedSelectors = async ({content, scss}:props) => {
    return await new PurgeCSS().purge({
        content: content,
        css: compileSassFiles(scss) ,
        rejected: true
    })
}