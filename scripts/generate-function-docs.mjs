import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));

/** Find application TypeScript files recursively, excluding generated declaration files. */
function collectSourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(/** Expand each directory entry into its nested TypeScript files or an empty list for unrelated files. */ (entry) => {
    // Expand directories recursively; keep only handwritten .ts and .tsx source files.
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory()
      ? collectSourceFiles(entryPath)
      : /\.tsx?$/.test(entry.name) && !entry.name.endsWith(".d.ts")
        ? [entryPath]
        : [];
  });
}

const files = ["app", "components", "lib"].flatMap(/** Collect application source files from each configured root directory. */ (directory) =>
  // Search each source directory relative to this script, independent of the shell directory.
  collectSourceFiles(path.join(root, directory))
).concat(path.join(root, "middleware.ts")).sort();
const lines = [
  "# Function reference",
  "",
  "Generated from source JSDoc comments with `npm run docs`. Edit the comments in the TypeScript files, then regenerate this file. Line numbers refer to the source at generation time.",
  "",
];
let count = 0;

for (const file of files) {
  const relative = path.relative(root, file).split(path.sep).join("/");
  const source = fs.readFileSync(file, "utf8");
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const entries = [];
  let localCount = 0;

  /** Visit each syntax node, requiring a JSDoc explanation for every function and callback. */
  function visit(node) {
    if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isMethodDeclaration(node)) {
      localCount += 1;
      const leading = source.slice(node.getFullStart(), node.getStart(ast));
      const comments = [...leading.matchAll(/\/\*\*([\s\S]*?)\*\//g)];
      const comment = comments.at(-1)?.[1];
      if (!comment) throw new Error(`Missing function comment: ${relative}, function ${localCount}`);
      const description = comment.split("\n").map(/** Clean one JSDoc line before including it in the generated reference. */ (line) =>
        // Strip the decorative JSDoc asterisk and combine the explanation into one paragraph.
        line.replace(/^\s*\*\s?/, "").trim()
      ).join(" ").trim();
      const name = node.name?.getText(ast)
        ?? (ts.isVariableDeclaration(node.parent) ? node.parent.name.getText(ast) : `Callback ${localCount}`);
      const line = ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1;
      entries.push(`- **${name}** (line ${line}): ${description}`);
      count += 1;
    }
    ts.forEachChild(node, visit);
  }

  visit(ast);
  if (entries.length) lines.push(`## [${relative}](../${relative})`, "", ...entries, "");
}

fs.mkdirSync(path.join(root, "docs"), { recursive: true });
fs.writeFileSync(path.join(root, "docs/functions.md"), `${lines.join("\n")}\n`);
console.log(`Documented ${count} functions and callbacks in docs/functions.md`);
