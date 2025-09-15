import * as fs from 'fs';
import * as path from 'path';

// Defines the structure of the dependency graph.
// It's a map where the key is a file path and the value is an array of its dependencies.
export type DependencyGraph = Map<string, string[]>;

/**
 * Analyzes a list of entry Sass files and builds a dependency graph.
 * @param entryFiles - An array of paths to the entry SCSS files.
 * @returns A map representing the dependency graph.
 */
export function analyzeSassDependencies(entryFiles: string[]): DependencyGraph {
  const graph: DependencyGraph = new Map();
  const processedFiles = new Set<string>();

  /**
   * Tries to resolve a Sass import path to an actual file on the filesystem.
   * Sass has a specific resolution order:
   * 1. Check for a file with a .scss extension.
   * 2. Check for a partial file (prefixed with '_').
   * 3. Check for an index file within a directory.
   * @param importPath - The path from the @import or @use rule.
   * @param basePath - The directory of the file containing the import.
   * @returns The resolved absolute file path or null if not found.
   */
  function resolveSassPath(importPath: string, basePath: string): string | null {
    const potentialPaths = [
      path.resolve(basePath, importPath),
      // e.g., components/button -> components/button.scss
      path.resolve(basePath, `${importPath}.scss`),
      // e.g., components/button -> components/_button.scss
      path.resolve(basePath, path.dirname(importPath), `_${path.basename(importPath)}.scss`),
      // e.g., components/button -> components/button/index.scss
      path.resolve(basePath, importPath, 'index.scss'),
      // e.g., components/button -> components/button/_index.scss
      path.resolve(basePath, importPath, '_index.scss'),
    ];

    for (const p of potentialPaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
    return null;
  }

  /**
   * Recursively traverses a Sass file and its dependencies.
   * @param filePath - The absolute path to the SCSS file to process.
   */
  function traverse(filePath: string) {
    if (processedFiles.has(filePath)) {
      // Avoid circular dependencies and redundant processing.
      return;
    }
    processedFiles.add(filePath);
    graph.set(filePath, []);

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const importRegex = /^@(?:use|import)\s+['"]([^'"]+)['"]( as .+)?;/gm
      let match;

      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1]!;
        const resolvedPath = resolveSassPath(importPath, path.dirname(filePath));

        if (resolvedPath) {
          graph.get(filePath)?.push(resolvedPath);
          traverse(resolvedPath);
        } else {
          console.warn(`[Warning] Could not resolve import "${importPath}" in ${filePath}`);
        }
      }
    } catch (error) {
      console.error(`[Error] Could not read file: ${filePath}`, error);
    }
  }

  // Start traversal from each entry file.
  for (const file of entryFiles) {
    const absolutePath = path.resolve(file);
    if (fs.existsSync(absolutePath)) {
      traverse(absolutePath);
    } else {
      console.warn(`[Warning] Entry file not found: ${absolutePath}`);
    }
  }

  return graph;
}

export const MapStringify = (map: Map<any,any>) => JSON.stringify(
  Array.from(
    map.entries()
  )
  , null, 1
)