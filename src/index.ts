import { MapStringify } from "./graph"
import { findUnusedSelectors, mapSassImports } from "./mainFunctions"
import { handleOptions } from "./options"
import { cleanResult, newLogger, prepareResultToLog, utilContext } from "./util"

interface props {
    content: string[]
    scss: string[]
}
export interface Ioptions {
    log: {
        file: boolean
        logfile: string
    }
}
const defaultOptions:Ioptions = {
    log: {
        file: false,
        logfile: "./Unused_SASS_Log.json",
    }
}

export const purgeSASS = handleOptions(defaultOptions , async (props:props, options) => {
    const log = newLogger(options.log)
    const {readFilesFromPatterns, compileSassFiles} = utilContext(log)
    
    const contentFiles = readFilesFromPatterns(props.content)

    log(`Found ${contentFiles.length} content files.`)
    // log(contentFiles.map(c => c.name))

    const compiledSass = compileSassFiles(props.scss)

    log(`Found ${compiledSass.length} Sass files.`)
    // log(compiledSass.map(c => c.name))

    let purgeResult = await findUnusedSelectors({rawContent: contentFiles, rawCss: compiledSass})
    let cleanedResult = cleanResult(purgeResult)
    let resultLog = prepareResultToLog(cleanedResult)

    log(`Found ${cleanedResult.reduce((p,c) => c.rejected?.length || 0 + p, 0)} unused selectors across ${purgeResult.length} files.`)
    log(resultLog)
    log.file(
        JSON.stringify(resultLog, null, 1)
    )

    let dependencyGraph = mapSassImports(cleanedResult.map(c => c.file!))
    // analyzeAndPurge(purgeResult, dependencyGraph)
    log.file(
        MapStringify(dependencyGraph),
        "dependency_graph.json"
    )


    log("Done!")
})