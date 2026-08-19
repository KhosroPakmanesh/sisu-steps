import { createRequire } from 'node:module';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { cwd, platform } from 'node:process';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const SOURCE_EXTENSIONS = new Set(['.ts']);
const CSS_EXTENSION = '.css';
const RUNTIME_ENTRYPOINTS = ['src/main.ts', 'src/styles.css'];

async function filesWithExtensions(directory, extensions) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? filesWithExtensions(path, extensions) : [path];
    }),
  );
  return nested.flat().filter((file) => extensions.has(extname(file)));
}

const root = resolve(cwd());
const normalized = (path) => {
  const absolute = resolve(path);
  return platform === 'win32' ? absolute.toLowerCase() : absolute;
};
const display = (path) => relative(root, path).split(sep).join('/');
const sourceFiles = await filesWithExtensions(join(root, 'src'), SOURCE_EXTENSIONS);
const cssFiles = await filesWithExtensions(join(root, 'src'), new Set([CSS_EXTENSION]));
const sourceByPath = new Map(sourceFiles.map((file) => [normalized(file), file]));
const cssByPath = new Map(cssFiles.map((file) => [normalized(file), file]));
const graph = new Map([...sourceFiles, ...cssFiles].map((file) => [normalized(file), new Set()]));
const unresolvedLocalResources = [];
const configFile = ts.readConfigFile(join(root, 'tsconfig.app.json'), ts.sys.readFile);

if (configFile.error) {
  console.error(
    ts.formatDiagnosticsWithColorAndContext([configFile.error], {
      getCanonicalFileName: (file) => file,
      getCurrentDirectory: () => root,
      getNewLine: () => '\n',
    }),
  );
  process.exit(1);
}

const compilerOptions = ts.parseJsonConfigFileContent(configFile.config, ts.sys, root).options;

function importedSpecifiers(file, sourceText) {
  const source = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true);
  const specifiers = [];
  const visit = (node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      specifiers.push(node.moduleSpecifier.text);
    }
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length === 1 &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      specifiers.push(node.arguments[0].text);
    }
    if (
      ts.isPropertyAssignment(node) &&
      ts.isIdentifier(node.name) &&
      ['styleUrl', 'templateUrl'].includes(node.name.text) &&
      ts.isStringLiteral(node.initializer)
    ) {
      specifiers.push(node.initializer.text);
    }
    if (
      ts.isPropertyAssignment(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'styleUrls' &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      for (const element of node.initializer.elements) {
        if (ts.isStringLiteral(element)) specifiers.push(element.text);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return specifiers;
}

function localCssPath(specifier, containingFile) {
  if (!specifier.endsWith(CSS_EXTENSION)) return undefined;
  if (specifier.startsWith('@/')) return join(root, 'src', specifier.slice(2));
  if (specifier.startsWith('.')) return resolve(dirname(containingFile), specifier);
  return undefined;
}

function localSourcePath(specifier, containingFile) {
  const resolved = ts.resolveModuleName(
    specifier,
    containingFile,
    compilerOptions,
    ts.sys,
  ).resolvedModule;
  return resolved && sourceByPath.get(normalized(resolved.resolvedFileName));
}

for (const file of sourceFiles) {
  const sourceText = await readFile(file, 'utf8');
  const edges = graph.get(normalized(file));
  for (const specifier of importedSpecifiers(file, sourceText)) {
    const cssPath = localCssPath(specifier, file);
    const cssTarget = cssPath && cssByPath.get(normalized(cssPath));
    const sourceTarget = localSourcePath(specifier, file);
    if (cssTarget) edges.add(normalized(cssTarget));
    else if (cssPath) unresolvedLocalResources.push(`${display(file)} -> ${specifier}`);
    else if (sourceTarget) edges.add(normalized(sourceTarget));
  }
}

for (const file of cssFiles) {
  const sourceText = await readFile(file, 'utf8');
  const edges = graph.get(normalized(file));
  for (const match of sourceText.matchAll(
    /@import\s+(?:url\(\s*)?(?:(['"])([^'"]+)\1|([^'"\s;)]+))/gu,
  )) {
    const specifier = match[2] ?? match[3];
    const cssPath = localCssPath(specifier, file);
    const cssTarget = cssPath && cssByPath.get(normalized(cssPath));
    if (cssTarget) edges.add(normalized(cssTarget));
    else if (cssPath) unresolvedLocalResources.push(`${display(file)} -> ${specifier}`);
  }
}

const pending = RUNTIME_ENTRYPOINTS.map((path) => normalized(join(root, path)));
const reachable = new Set();
while (pending.length) {
  const current = pending.pop();
  if (reachable.has(current)) continue;
  reachable.add(current);
  for (const target of graph.get(current) ?? []) pending.push(target);
}

const unreachable = [...sourceFiles, ...cssFiles]
  .filter((file) => !file.endsWith('.d.ts') && !reachable.has(normalized(file)))
  .map(display)
  .sort();

if (unresolvedLocalResources.length || unreachable.length) {
  console.error('Source reachability review failed:');
  for (const entry of unresolvedLocalResources.sort()) {
    console.error(`- unresolved local CSS resource: ${entry}`);
  }
  for (const file of unreachable) console.error(`- ${file}`);
  process.exitCode = 1;
} else {
  console.log('Source reachability review passed.');
}
