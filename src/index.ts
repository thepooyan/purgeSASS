import { findUnusedSelectors } from "./mainFunctions"
import { handleOptions } from "./options"
import { cleanResult, newLogger, prepareResultToLog, utilContext } from "./util"

interface props {
    content: string[]
    scss: string[]
}
export interface Ioptions {
    log: {
        enabled: boolean
        logfile: string
        logDevices: ("console" | "logfile")[]
    }
}
const defaultOptions:Ioptions = {
    log: {
        enabled: false,
        logfile: "./Unused_SASS_Log.json",
        logDevices: ["console"]
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
        JSON.stringify(resultLog)
    )

    // let dependencyGraph = mapSassImports(props.scss)
    // analyzeAndPurge(purgeResult, dependencyGraph)


    log("Done!")
})