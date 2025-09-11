import { PurgeCSS } from "purgecss"
import { compileSassFiles } from "./util"

interface props {
    content: string[]
    scss: string[]
}
export const purgeSASS = async ({content, scss}:props) => {

    let purgeResult = await new PurgeCSS().purge({
        content: content,
        css: compileSassFiles(scss).map(s => ({raw: s})) ,
        rejected: true
    })
    console.log(purgeResult)
}


purgeSASS({content: ["./test/*.html"], scss: ["./test/*.scss"]})