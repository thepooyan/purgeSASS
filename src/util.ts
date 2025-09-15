import {globSync} from "glob"
import postcss_scss from "postcss-scss"
import postcss from "postcss"
import fs from "fs"
import * as sass from "sass"
import path from "path"
import type { ResultPurge } from "purgecss"
import type { Ioptions } from "."

export const utilContext = (log: ReturnType<typeof newLogger>) => {

    const compileSassFiles = (files: string[]) => {
        let fileNames = (globSync(files))
        return fileNames.map((f,i) => {
            log.onThousand(`Compiled ${i}/${fileNames.length} Sass files. (${files})`, i)
            return {raw: compileSass(f).css, name: f, extension: "css"}
        })
    }

    const readFilesFromPattern = (pattern:string ) => {
        const files = globSync(pattern)
        return files.map((f,i) => {
            log.onThousand(`Read ${i}/${files.length} files... ${pattern}`,i)
            return {raw: readCachedFile(f), name: f, extension: path.extname(f)}
        })
    }
    const readFilesFromPatterns = (patterns: string[]) => patterns.map(readFilesFromPattern).flat()

    return {readFilesFromPattern, readFilesFromPatterns, compileSassFiles }
}


export const compileSass = (fileName: string) => sass.compile(fileName, {logger: {warn: () => {}}} )
export const standardPath = (pathname:string) => path.join(process.cwd(), pathname)
export const standardPaths = (pathnames:string[]) => pathnames.map(standardPath)


export interface rawFile {extension: string, raw: string, name: string}
export interface rawProps {
    rawContent: rawFile[]
    rawCss: rawFile[]
}

export type finalResult = {
    filename: string,
    selectors: string[]
    originFile: string | null
}[]
 
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

const getFullSassSelector = (rule: postcss.Rule) => {

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
const purgeSassSelectors = (scssCode: string, targetSelectors: string[]) => {
    const root = new postcss.Processor().process(scssCode, { syntax: postcss_scss })

    root.root.walkRules(rule => {
        let fullSelector = getFullSassSelector(rule)
        if (targetSelectors.includes(fullSelector)) rule.remove()
    })
    return root.toString()
}
export const purgeSassSelectorsFromFile = (scssPath:string, targetSelectors: string[]) => {
    try {
        let content = readCachedFile(scssPath)
        let newContent = purgeSassSelectors(content, targetSelectors)
        fs.writeFileSync(scssPath, newContent, "utf-8")
    } catch(e) {
        console.log(`Error purging file: ${scssPath}`, e)
    }
}

export const cleanResult = (purgeResult: ResultPurge[]) => {
    return purgeResult
        .filter(f => (f.rejected?.length || 0) > 0)
        .map(m => ({...m, 
            rejected: m.rejected?.map(r => r.replaceAll("\n", "").trim())
        }))

}

export const prepareResultToLog = (purgeResult: ResultPurge[]) => {
    return purgeResult
        .map(p => ({
            file: p.file,
            unused_selectors: {
                count: p.rejected?.length || 0,
                items: p.rejected
            }
        }))
}

export const newLogger = ({file, logfile}: Ioptions["log"]) => {
    const log = (content: any) => console.log(content)
    log.file = (content: string, logfileSub?: string) => file && fs.writeFileSync(logfileSub || logfile, content, "utf-8")
    log.onThousand = (text:string, index:number) => {
        if (index % 1000 === 0) log(text)
    }
    return log
}