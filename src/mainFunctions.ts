import { PurgeCSS, type ResultPurge } from "purgecss"
import { purgeSassSelectorsFromFile, type finalResult, type rawProps } from "./util"
import { analyzeSassDependencies, type DependencyGraph } from "./graph"
import { globSync } from "glob"
import { unsafe } from "bun"

export const findUnusedSelectors = async ({rawContent, rawCss}:rawProps) => {
    return await new PurgeCSS().purge({
        content: rawContent,
        css: rawCss,
        rejected: true
    })
}

export const mapSassImports = async (sassGlobs: string[]) => {
    const files = sassGlobs.map(g => globSync(g)).flat()
    return analyzeSassDependencies(files)
}   

export const traceSelectorToOrigin = (purgeResult: ResultPurge[], dependencyGraph: DependencyGraph) => {
    let result:finalResult = []
    for (const unused of purgeResult) {
        if (!unused.rejected) continue
        if (!unused.file) continue
        let deps = dependencyGraph.get(unused.file || "")
        if (!deps) { //File has no dependcies, all unused selectors are in root
            console.log(`Purging ${unused.rejected.length} selectors from ${unused.file}`)
            console.log({file: unused.file, selectors: unused.rejected})

            purgeSassSelectorsFromFile(unused.file, unused.rejected)
            continue
        }
        //file has dependencies, read them and assign 
        for (const dep of deps) {
            purgeSassSelectorsFromFile(dep, unused.rejected)
            console.log(`Purging ${unused.rejected.length} selectors from ${dep}`)
            console.log({file: dep, selectors: unused.rejected})
        }
        purgeSassSelectorsFromFile(unused.file, unused.rejected)
    }
}

