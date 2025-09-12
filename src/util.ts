import {globSync} from "glob"
import postcss_scss from "postcss-scss"
import postcss from "postcss"
import fs from "fs"
import * as sass from "sass"
import { PurgeCSS, type ResultPurge } from "purgecss"
import path from "path"
import { analyzeSassDependencies, type DependencyGraph } from "./graph"

export const compileSassFiles = (files: string[]) => {
    let fileNames = standardPaths(globSync(files))
    return fileNames.map(f => ({raw: sass.compile(f).css, name: f, extension: "css"}) )
}
export const readFilesFromPattern = (pattern:string) => {
    const files = globSync(pattern)
    return files.map(f => ({raw: fs.readFileSync(f, "utf-8"), name: f, extension: path.extname(f)}))
}
export const readFilesFromPatterns = (patterns: string[]) => patterns.map(readFilesFromPattern).flat()

export const standardPath = (pathname:string) => path.join(process.cwd(), pathname)
export const standardPaths = (pathnames:string[]) => pathnames.map(standardPath)

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
    return analyzeSassDependencies(files)
}

type finalResult = {
    filename: string,
    selectors: string[]
    originFile: string
}[]
    
export const traceSelectorToOrigin = (purgeResult: ResultPurge[], dependencyGraph: DependencyGraph) => {
    for (const result of purgeResult) {
        let dep = dependencyGraph.get(result.file || "")
        console.log(dep)
        console.log(result.rejected)
    }
}


export const purgeSassSelectors = (scssCode: string, targetSelectors: string[]) => {
    const root = new postcss.Processor().process(scssCode, { syntax: postcss_scss })

    root.root.walkRules(rule => {
        let fullSelector = getFullSassSelector(rule)
        if (targetSelectors.includes(fullSelector)) rule.remove()
    })
    return root.toString()
}

export const getFullSassSelector = (rule: postcss.Rule) => {

    let fullSelector = rule.selector
    let parent = rule.parent
    let node:postcss.Rule | postcss.AtRule = rule

    while (parent && parent.type !== "root") {
        if (parent.type === "rule") {
            fullSelector = parent.selector + ' ' + fullSelector;
            node = parent;
            parent = node.parent;
        } else if (parent.name === "mixin") {
            fullSelector = "@mixin" + ' ' + fullSelector;
            node = parent;
            parent = node.parent;
        }
    }
  

    return fullSelector
}