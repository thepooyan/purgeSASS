import { compileSassFiles, findUnusedSelectors, mapSassImports, readFilesFromPatterns, traceSelectorToOrigin } from "./util"

export interface props {
    content: string[]
    scss: string[]
}
export const purgeSASS = async (props:props) => {
    const contentFiles = readFilesFromPatterns(props.content)
    const compiledSass = compileSassFiles(props.scss)


    let purgeResult = await findUnusedSelectors({rawContent: contentFiles, rawCss: compiledSass})
    mapSassImports()
    traceSelectorToOrigin()
    console.log(purgeResult)
}


purgeSASS({content: ["./test/*.html"], scss: ["./test/mainStyles/*.scss"]})