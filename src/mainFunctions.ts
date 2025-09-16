import { PurgeCSS, type ResultPurge } from "purgecss"
import fs from "fs"
import { purgeSassSelectorsFromFile, type rawProps } from "./util"
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

export type folan = {filename: string, removed: string[], sourceFile?: string}
export const analyzeAndPurge = (purgeResult: ResultPurge[], dependencyGraph: DependencyGraph) => {
    
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

export const compareRemovedAndUnused = (toBeCleaned: ResultPurge[], removed: folan[]) => {
    let allRemoved = new Set( removed.map(m => m.removed).flat() )

    const filter1 = toBeCleaned.map(t => ({file: t.file, rejected: t.rejected?.filter(f => !allRemoved.has(f))}))
    const diff = filter1.filter(f => (f.rejected?.length || 0) > 0)
    
    if (diff.length > 0) {
        console.log(`----------------------------------------`)
        console.log(`-- Warning!`)
        console.log(`-- Some unused selectors were detected, but not removed.`)
        console.log(`-- This might be a bug of the program, or an unhandled edge case.`)
        console.log(`-- You can go through the list and delete them manually at "undetected_rules.json"`)
        console.log(`-- Unhandled edge cases include classnames that are generated via mixins, loops, extends or ?`)
        console.log(`-- If you don't see the log file, enable logs by passing {log: {file: true}} to the function.`)
        console.log(`----------------------------------------`)
        fs.writeFileSync("undetected_rules.json", JSON.stringify(diff, null, 1), "utf-8")
    }
}