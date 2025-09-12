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
    return files.map(f => ({raw: readCachedFile(f), name: f, extension: path.extname(f)}))
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
    originFile: string | null
}[]
    
export const traceSelectorToOrigin = (purgeResult: ResultPurge[], dependencyGraph: DependencyGraph) => {
    let result:finalResult = []
    for (const unused of purgeResult) {
        if (!unused.rejected) continue
        if (!unused.file) continue
        let deps = dependencyGraph.get(unused.file || "")
        if (!deps) { //File has no dependcies, all unused selectors are in root
            purgeSassSelectorsFromFile(unused.file, unused.rejected)
            continue
        }
        //file has dependencies, read them and assign 
        for (const dep of deps) {
            purgeSassSelectorsFromFile(dep, unused.rejected)
        }
        purgeSassSelectorsFromFile(unused.file, unused.rejected)
    }
}

const listSassSelectors = (sassContent: string) => {
    let process = new postcss.Processor().process(sassContent, {syntax: postcss_scss})
    process.root.walkRules(rule => {

    })
}

const newFileCacher = () => {
    let map = new Map<string, string>()

    return (filename: string) => {
        let get = map.get(filename) 
        if (get) return get
        let fileContent = readFile(filename)
        map.set(filename, fileContent)
        return fileContent
    }
}

const readFile = (path: string) => {
    return fs.readFileSync(path, "utf-8")
}

export const readCachedFile = newFileCacher()

export const purgeSassSelectorsFromFile = (scssPath:string, targetSelectors: string[]) => {
    let content = readCachedFile(scssPath)
    let newContent = purgeSassSelectors(content, targetSelectors)
    fs.writeFileSync(scssPath, newContent, "utf-8")
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