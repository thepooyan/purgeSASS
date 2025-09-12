import { findUnusedSelectors, mapSassImports, traceSelectorToOrigin as analyzeAndPurge } from "./mainFunctions"
import { compileSassFiles, readFilesFromPatterns } from "./util"

export interface props {
    content: string[]
    scss: string[]
}
export const purgeSASS = async (props:props) => {
    const contentFiles = readFilesFromPatterns(props.content)

    console.log(`Found ${contentFiles.length} content files.`)
    console.log(contentFiles.map(c => c.name))

    const compiledSass = compileSassFiles(props.scss)

    console.log(`Found ${compiledSass.length} Sass files.`)
    console.log(compiledSass.map(c => c.name))

    let purgeResult = await findUnusedSelectors({rawContent: contentFiles, rawCss: compiledSass})
    console.log(`Found ${purgeResult.reduce((p,c) => c.rejected?.length || 0 + p, 0)} unused selectors across ${purgeResult.length} files.`)
    console.log(purgeResult.map(p => ({file: p.file, count: p.rejected?.length || 0}) ))

    let dependencyGraph = await mapSassImports(props.scss)
    analyzeAndPurge(purgeResult, dependencyGraph)
    console.log("Done!")
}


purgeSASS({content: ["D://testproj/*.html"], scss: ["D://testproj/mainStyles/*.scss"]})