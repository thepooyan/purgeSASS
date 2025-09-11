import {globSync} from "glob"
import madge from "madge"
import fs from "fs"
import * as sass from "sass"
import { PurgeCSS } from "purgecss"
import path from "path"

export const compileSassFiles = (files: string[]) => {
    let fileNames = globSync(files)
    return fileNames.map(f => ({raw: sass.compile(f).css, name: f, extension: "css"}) )
}
export const readFilesFromPattern = (pattern:string) => {
    const files = globSync(pattern)
    return files.map(f => ({raw: fs.readFileSync(f, "utf-8"), name: f, extension: path.extname(f)}))
}
export const readFilesFromPatterns = (patterns: string[]) => patterns.map(readFilesFromPattern).flat()

interface rawFile {extension: string, raw: string, name: string}
interface rawProps {
    rawContent: rawFile[]
    rawCss: rawFile[]
}
export const findUnusedSelectors = async ({rawContent, rawCss}:rawProps) => {
    return await new PurgeCSS().purge({
        content: rawContent,
        css: rawCss,
        rejected: true
    })
}

export const mapSassImports = async (sassGlobs: string[]) => {
    const files = sassGlobs.map(g => globSync(g)).flat()
    console.log(files)
    const result = await madge(".", {fileExtensions: ["scss"]});
    const dependencyMap = result.obj();
    console.log(dependencyMap)
}

export const traceSelectorToOrigin = () => {}