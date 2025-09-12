import { findUnusedSelectors, mapSassImports, traceSelectorToOrigin as analyzeAndPurge } from "./mainFunctions"
import { compileSassFiles, readFilesFromPatterns } from "./util"

export interface props {
    content: string[]
    scss: string[]
}
export const purgeSASS = async (props:props) => {
    const contentFiles = readFilesFromPatterns(props.content)
    const compiledSass = compileSassFiles(props.scss)


    let purgeResult = await findUnusedSelectors({rawContent: contentFiles, rawCss: compiledSass})
    let dependencyGraph = await mapSassImports(props.scss)
    analyzeAndPurge(purgeResult, dependencyGraph)
}


purgeSASS({content: ["D://testproj/*.html"], scss: ["D://testproj/mainStyles/*.scss"]})