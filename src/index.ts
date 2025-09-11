import { PurgeCSS } from "purgecss"
import { compileSassFiles, findUnusedSelectors } from "./util"

export interface props {
    content: string[]
    scss: string[]
}
export const purgeSASS = async (props:props) => {

    let purgeResult = await findUnusedSelectors(props)
    console.log(purgeResult)
}


purgeSASS({content: ["./test/*.html"], scss: ["./test/mainStyles/*.scss"]})