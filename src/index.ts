import { MapStringify } from "./graph"
import { findUnusedSelectors, mapSassImports, analyzeAndPurge } from "./mainFunctions"
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

    log(`Total content files found: ${contentFiles.length}`)
    // log(contentFiles.map(c => c.name))

    const compiledSass = compileSassFiles(props.scss)

    log(`Total sass files Compiled: ${compiledSass.length}`)
    // log(compiledSass.map(c => c.name))

    let purgeResult = await findUnusedSelectors({rawContent: contentFiles, rawCss: compiledSass})
    let cleanedResult = cleanResult(purgeResult)
    let resultLog = prepareResultToLog(cleanedResult)

    log(`Found ${cleanedResult.reduce((p,c) => c.rejected?.length || 0 + p, 0)} unused selectors across ${purgeResult.length} files.`)
    // log.file(
    //     JSON.stringify(resultLog, null, 1)
    // )

    let dependencyGraph = mapSassImports(cleanedResult.map(c => c.file!))
    log("dependency_graph.json created.")
    log.file(
        MapStringify(dependencyGraph),
        "dependency_graph.json"
    )

    let removedLog = analyzeAndPurge(purgeResult, dependencyGraph)
    log.file(
        JSON.stringify(removedLog, null, 1)
    )

    log("Done!")
})