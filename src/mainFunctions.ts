import { PurgeCSS, type ResultPurge } from "purgecss"
import { purgeSassSelectorsFromFile, type finalResult, type rawProps } from "./util"
import { analyzeSassDependencies, type DependencyGraph } from "./graph"

export const findUnusedSelectors = async ({rawContent, rawCss}:rawProps) => {
    return await new PurgeCSS().purge({
        content: rawContent,
        css: rawCss,
        rejected: true
    })
}

export const mapSassImports = (sassFiles: string[]) => {
    return analyzeSassDependencies(sassFiles)
}   

export const analyzeAndPurge = (purgeResult: ResultPurge[], dependencyGraph: DependencyGraph) => {
    
    type folan = {filename: string, removed: string[], sourceFile?: string}
    let removedLog: folan[] = []

    for (const unused of purgeResult) {
        if (!unused.rejected || unused.rejected.length === 0) continue
        if (!unused.file) continue
        let deps = dependencyGraph.get(unused.file || "")
        if (!deps || deps.length === 0) { //File has no dependcies, all unused selectors are in root
            console.log(`Purging ${unused.rejected.length} selectors directly from ${unused.file}`)
            // console.log({file: unused.file, selectors: unused.rejected})

            if (unused.file === "F:\\Abbas\\Projecct\\Projecct\\TahlilProject\\TahlildadehMVC\\Content\\swiper.scss") continue
            let removed = purgeSassSelectorsFromFile(unused.file, unused.rejected)
            if (removed && removed.length > 0)
            removedLog.push({filename: unused.file!, removed: removed })
            continue
        }
        //file has dependencies, read them and assign 
        console.log(`Removing ${unused.rejected.length} selectors from ${unused.file} and it's children:`)
        let removed = purgeSassSelectorsFromFile(unused.file, unused.rejected)
        if (removed && removed.length > 0)
        removedLog.push({filename: unused.file!, removed:  removed })

        for (const dep of deps) {
            console.log(`- ${dep}`)
            let removed = purgeSassSelectorsFromFile(dep, unused.rejected)
            if (removed && removed.length > 0)
            removedLog.push({filename: dep, sourceFile: unused.file!, removed: removed})
        }
    }

    return removedLog
}

