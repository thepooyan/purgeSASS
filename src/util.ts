import {globSync} from "glob"
import fs from "fs"
import * as sass from "sass"
import { PurgeCSS } from "purgecss"
import path from "path"

export const compileSassFiles = (files: string[]) => {
    let fileNames = globSync(files)
    return fileNames.map(f => ({raw: sass.compile(f).css, name: f}) )
}
export const readFilesFromPattern = (pattern:string) => {
    const files = globSync(pattern)
    return files.map(f => ({raw: fs.readFileSync(f, "utf-8"), name: f, extension: path.extname(f)}))
}
export const readFilesFromPatterns = (patterns: string[]) => patterns.map(readFilesFromPattern).flat()

interface rawCSS {name: string, raw: string}
interface rawFile {extension: string, raw: string}
interface rawProps {
    rawContent: rawFile[]
    rawCss: rawCSS[]
}
export const findUnusedSelectors = async ({rawContent, rawCss}:rawProps) => {
    return await new PurgeCSS().purge({
        content: rawContent,
        css: rawCss,
        rejected: true
    })
}

export const mapSassImports = () => {}

export const traceSelectorToOrigin = () => {}