import { findUnusedSelectors, mapSassImports, traceSelectorToOrigin } from "./mainFunctions"
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
    let folan = traceSelectorToOrigin(purgeResult, dependencyGraph)
}


purgeSASS({content: ["./test/*.html"], scss: ["./test/mainStyles/*.scss"]})