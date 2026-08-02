import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { builtinModules, createRequire } from 'node:module';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const nodeBuiltins = new Set(
  builtinModules.flatMap((moduleName) => [moduleName, `node:${moduleName}`])
);
const boundaryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const webRoot = path.resolve(boundaryRoot, '../..');
const upstreamRoot = process.argv[2] || process.env.POSTIZ_UPSTREAM_DIR;

if (!upstreamRoot) {
  throw new Error(
    'Pass the pinned Postiz checkout path: node vendor/postiz/scripts/validate-import.mjs /path/to/postiz'
  );
}

const manifest = JSON.parse(
  readFileSync(path.join(boundaryRoot, 'provenance.json'), 'utf8')
);
const boundaryPrefix = 'web/vendor/postiz/';
const metadataFiles = new Set(
  manifest.metadataFiles.map((file) => file.replace(boundaryPrefix, ''))
);
const allowedAdapterSeams = new Set(manifest.intentionalAdapterSeams);
const aliases = {
  '@gitroom/frontend/': 'apps/frontend/src/',
  '@gitroom/backend/': 'apps/backend/src/',
  '@gitroom/orchestrator/': 'apps/orchestrator/src/',
  '@gitroom/nestjs-libraries/': 'libraries/nestjs-libraries/src/',
  '@gitroom/helpers/': 'libraries/helpers/src/',
  '@gitroom/react/': 'libraries/react-shared-libraries/src/',
};
const sourceExtensions = [
  '',
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.cjs',
  '.mjs',
  '.json',
  '.scss',
  '.css',
  '.png',
  '.svg',
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function walk(directory) {
  const output = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...walk(absolute));
    else output.push(absolute);
  }
  return output;
}

function sha256(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex');
}

function findLocalFile(basePath) {
  for (const extension of sourceExtensions) {
    const candidate = `${basePath}${extension}`;
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  for (const extension of sourceExtensions.slice(1)) {
    const candidate = path.join(basePath, `index${extension}`);
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

function getImportSpecifiers(file) {
  const source = readFileSync(file, 'utf8');
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );
  const specifiers = [];
  function visit(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      specifiers.push(node.moduleSpecifier.text);
    }
    if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === 'require')) &&
      node.arguments[0] &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      specifiers.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return { source, specifiers };
}

function resolveLocalImport(importer, specifier) {
  if (specifier.startsWith('.')) {
    return findLocalFile(path.resolve(path.dirname(importer), specifier));
  }
  const alias = Object.keys(aliases).find((prefix) => specifier.startsWith(prefix));
  if (!alias) return undefined;
  return findLocalFile(
    path.join(boundaryRoot, aliases[alias], specifier.slice(alias.length))
  );
}

function packageName(specifier) {
  return specifier.startsWith('@')
    ? specifier.split('/').slice(0, 2).join('/')
    : specifier.split('/')[0];
}

const allBoundaryFiles = walk(boundaryRoot)
  .map((file) => path.relative(boundaryRoot, file).split(path.sep).join('/'))
  .sort();
const sourceBoundaryFiles = allBoundaryFiles.filter(
  (file) => !metadataFiles.has(file)
);
const manifestPaths = manifest.files
  .map((entry) => entry.localPath.replace(boundaryPrefix, ''))
  .sort();

assert(
  JSON.stringify(sourceBoundaryFiles) === JSON.stringify(manifestPaths),
  'Manifest coverage does not exactly match non-metadata boundary files.'
);
assert(
  new Set(manifestPaths).size === manifestPaths.length,
  'Manifest contains duplicate local paths.'
);

const checkoutCommit = execFileSync(
  'git',
  ['-C', upstreamRoot, 'rev-parse', 'HEAD'],
  { encoding: 'utf8' }
).trim();
assert(
  checkoutCommit === manifest.sourceCommit,
  `Upstream checkout is ${checkoutCommit}; expected ${manifest.sourceCommit}.`
);

for (const entry of manifest.files) {
  const localRelative = entry.localPath.replace(boundaryPrefix, '');
  const localFile = path.join(boundaryRoot, localRelative);
  const upstreamFile = path.join(upstreamRoot, entry.upstreamPath);
  assert(existsSync(localFile), `Missing local file: ${entry.localPath}`);
  assert(existsSync(upstreamFile), `Missing upstream file: ${entry.upstreamPath}`);
  const localHash = sha256(localFile);
  const upstreamHash = sha256(upstreamFile);
  assert(localHash === entry.localSha256, `Local hash drift: ${entry.localPath}`);
  assert(
    upstreamHash === entry.upstreamSha256,
    `Upstream hash drift: ${entry.upstreamPath}`
  );
  assert(
    entry.sourceCommit === manifest.sourceCommit,
    `Source commit mismatch: ${entry.localPath}`
  );
  assert(
    entry.state === (localHash === upstreamHash ? 'verbatim' : 'modified'),
    `Incorrect modification state: ${entry.localPath}`
  );
  assert(
    entry.state === 'verbatim'
      ? entry.modificationSummary === null && entry.modifiedOn === null
      : Boolean(entry.modificationSummary) && entry.modifiedOn === manifest.importedOn,
    `Incomplete modification metadata: ${entry.localPath}`
  );
}

for (const file of allBoundaryFiles) {
  const segments = file.split('/');
  const excludedSegment = segments.find(
    (segment) =>
      segment === '.env' ||
      segment.startsWith('.env.') ||
      /^(?:\.git|node_modules|dist|build|\.next|uploads|screenshots?|reports?|caches?)$/i.test(
        segment
      )
  );
  assert(!excludedSegment, `Excluded path found: ${file}`);
}

const sourceFiles = sourceBoundaryFiles.filter((file) => /\.[cm]?[jt]sx?$/.test(file));
for (const excludedProductPath of [
  'apps/frontend/src/components/launches/creation.method.badge.tsx',
  'apps/frontend/src/components/new-launch/dummy.code.component.tsx',
]) {
  assert(
    !sourceBoundaryFiles.includes(excludedProductPath),
    `Excluded product surface found: ${excludedProductPath}`
  );
}
const unresolvedImports = [];
const importInventory = new Map();
const secretPattern =
  /(?:sk-proj-[A-Za-z0-9_-]{16,}|sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}|AKIA[A-Z0-9]{16}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)/;

for (const relativeFile of sourceFiles) {
  const absolute = path.join(boundaryRoot, relativeFile);
  const { source, specifiers } = getImportSpecifiers(absolute);
  assert(!secretPattern.test(source), `Possible committed secret in ${relativeFile}`);
  assert(
    !/(?:^|\/)(?:copilot|openai|agent|generator)(?:[./-]|$)/i.test(relativeFile),
    `Excluded AI/generator path found: ${relativeFile}`
  );
  assert(
    !/(?:DummyCode|\bsetDummy\b|\bdummy\s*=\s*useLaunchStore)/.test(source),
    `Excluded public API output mode found: ${relativeFile}`
  );
  const transpiled = ts.transpileModule(source, {
    fileName: relativeFile,
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.ReactJSX,
      experimentalDecorators: true,
    },
  });
  const syntaxErrors = (transpiled.diagnostics || []).filter(
    (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error
  );
  assert(syntaxErrors.length === 0, `Syntax error in ${relativeFile}`);

  for (const specifier of specifiers) {
    assert(
      !/(?:copilot|openai|agent\.graph|\/generator\/)/i.test(specifier),
      `Excluded AI/generator import in ${relativeFile}: ${specifier}`
    );
    if (
      specifier.includes('/integrations/social/') &&
      !/(?:instagram\.provider|instagram\.standalone\.provider|tiktok\.provider|social\.integrations\.interface)$/.test(
        specifier
      )
    ) {
      throw new Error(`Unrelated provider import in ${relativeFile}: ${specifier}`);
    }
    const local = resolveLocalImport(absolute, specifier);
    const isLocalSpecifier =
      specifier.startsWith('.') ||
      Object.keys(aliases).some((prefix) => specifier.startsWith(prefix));
    if (isLocalSpecifier && !local) {
      unresolvedImports.push({ relativeFile, specifier });
    }
    if (!isLocalSpecifier && !nodeBuiltins.has(specifier)) {
      const name = packageName(specifier);
      if (!importInventory.has(name)) importInventory.set(name, new Set());
      importInventory.get(name).add(relativeFile);
    }
  }
}

const unresolvedUnique = [...new Set(unresolvedImports.map(({ specifier }) => specifier))].sort();
assert(
  JSON.stringify(unresolvedUnique) === JSON.stringify([...allowedAdapterSeams].sort()),
  `Unexpected unresolved local imports: ${unresolvedUnique.join(', ')}`
);

const socialProviderFiles = readdirSync(
  path.join(boundaryRoot, 'libraries/nestjs-libraries/src/integrations/social')
).sort();
assert(
  JSON.stringify(socialProviderFiles) ===
    JSON.stringify([
      'instagram.provider.ts',
      'instagram.standalone.provider.ts',
      'social.integrations.interface.ts',
      'tiktok.provider.ts',
    ]),
  `Unexpected provider implementation file: ${socialProviderFiles.join(', ')}`
);

const managerSource = readFileSync(
  path.join(
    boundaryRoot,
    'libraries/nestjs-libraries/src/integrations/integration.manager.ts'
  ),
  'utf8'
);
const constructors = [...managerSource.matchAll(/new\s+(\w+Provider)\s*\(/g)].map(
  (match) => match[1]
);
assert(
  JSON.stringify(constructors) ===
    JSON.stringify([
      'InstagramProvider',
      'InstagramStandaloneProvider',
      'TiktokProvider',
    ]),
  `Provider registry drift: ${constructors.join(', ')}`
);

const shellEntries = [
  'apps/frontend/src/components/new-layout/layout.component.tsx',
  'apps/frontend/src/components/layout/top.menu.tsx',
  'apps/frontend/src/components/new-layout/menu-item.tsx',
];
const shellExternalPackages = new Set();
for (const relativeFile of shellEntries) {
  const absolute = path.join(boundaryRoot, relativeFile);
  const { source, specifiers } = getImportSpecifiers(absolute);
  assert(!source.includes('clsx'), `Shell unexpectedly depends on clsx: ${relativeFile}`);
  assert(!source.includes('@gitroom/'), `Shell unexpectedly needs an alias: ${relativeFile}`);
  assert(
    !/(?:newBg|newText|textItem|boxFocused|minCustom:|custom:)/.test(source),
    `Shell unexpectedly uses an upstream theme utility: ${relativeFile}`
  );
  for (const specifier of specifiers) {
    if (!specifier.startsWith('.')) shellExternalPackages.add(packageName(specifier));
  }
}
assert(
  JSON.stringify([...shellExternalPackages].sort()) ===
    JSON.stringify(['next', 'react']),
  `Shell runtime dependency drift: ${[...shellExternalPackages].sort().join(', ')}`
);

const externalPackages = [...importInventory.keys()].sort();
assert(
  JSON.stringify(externalPackages) ===
    JSON.stringify(manifest.runtimeDependencies.fullSource),
  `Manifest full-source package inventory is stale. Recomputed-only: ${externalPackages
    .filter((name) => !manifest.runtimeDependencies.fullSource.includes(name))
    .join(', ')}; manifest-only: ${manifest.runtimeDependencies.fullSource
    .filter((name) => !externalPackages.includes(name))
    .join(', ')}`
);
const packageJson = JSON.parse(readFileSync(path.join(webRoot, 'package.json'), 'utf8'));
const declaredPackages = {
  ...(packageJson.dependencies || {}),
  ...(packageJson.devDependencies || {}),
  ...(packageJson.peerDependencies || {}),
};
const undeclaredPackages = externalPackages.filter((name) => !declaredPackages[name]);
assert(
  JSON.stringify(undeclaredPackages) ===
    JSON.stringify(manifest.runtimeDependencies.undeclaredInClipStitchr),
  'Manifest undeclared package inventory is stale.'
);

console.log(
  JSON.stringify(
    {
      sourceCommit: manifest.sourceCommit,
      manifestFiles: manifest.files.length,
      verbatimFiles: manifest.files.filter((file) => file.state === 'verbatim').length,
      modifiedFiles: manifest.files.filter((file) => file.state === 'modified').length,
      syntaxCheckedFiles: sourceFiles.length,
      unresolvedImportOccurrences: unresolvedImports.length,
      intentionalAdapterSeams: unresolvedUnique,
      providerRegistry: constructors,
      shellRuntimeDependencies: [...shellExternalPackages].sort(),
      shellAdditionalTsconfigAliases: [],
      fullSourceExternalPackages: externalPackages.length,
      undeclaredFullSourcePackages: undeclaredPackages.length,
    },
    null,
    2
  )
);
