import { findUnusedSelectors, mapSassImports, traceSelectorToOrigin as analyzeAndPurge } from "./mainFunctions"
import { deepMerge, handleOptions, type DeepPartial } from "./options"
import { compileSassFiles, readFilesFromPatterns } from "./util"
import fs from "fs"

interface props {
    content: string[]
    scss: string[]
}
interface Ioptions {
    log: {
        enabled: boolean
        logfile: string
    }
}
const defaultOptions:Ioptions = {
    log: {
        enabled: false,
        logfile: "./Unused_SASS_Log.json"
    }
}

export const purgeSASS = handleOptions(defaultOptions , async (props:props, options) => {
    
    const contentFiles = readFilesFromPatterns(props.content)

    console.log(`Found ${contentFiles.length} content files.`)
    // console.log(contentFiles.map(c => c.name))

    const compiledSass = compileSassFiles(props.scss)

    console.log(`Found ${compiledSass.length} Sass files.`)
    // console.log(compiledSass.map(c => c.name))

    let purgeResult = await findUnusedSelectors({rawContent: contentFiles, rawCss: compiledSass})
    console.log(`Found ${purgeResult.reduce((p,c) => c.rejected?.length || 0 + p, 0)} unused selectors across ${purgeResult.length} files.`)
    console.log(purgeResult.filter(p => p.rejected?.length).map(p => ({file: p.file, count: p.rejected?.length}) ))

    let dependencyGraph = mapSassImports(props.scss)
    analyzeAndPurge(purgeResult, dependencyGraph)

    options.log.enabled && fs.writeFileSync(options.log.logfile, JSON.stringify(purgeResult), "utf-8")

    console.log("Done!")
})