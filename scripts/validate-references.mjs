import fs from "node:fs";

const registry = JSON.parse(fs.readFileSync("registry.json", "utf8"));
const references = JSON.parse(fs.readFileSync("references/components.json", "utf8"));
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const errors = [];

const prefix = "Acongm/shadcn-ui/";
const items = new Map(registry.items.map((item) => [item.name, item]));
const core = items.get("core-ui");
if (!core) errors.push("registry.json must contain core-ui");

const coreNames = (core?.registryDependencies ?? []).map((dependency) => dependency.startsWith(prefix) ? dependency.slice(prefix.length) : dependency);
const referenceExempt = new Set(["acongm-theme"]);
for (const name of coreNames) {
  if (!referenceExempt.has(name) && !references.entries[name]) errors.push(`core-ui item ${name} has no references/components.json entry`);
}
for (const platformOnly of ["theme-runtime", "theme-toggle", "platform-theme"]) {
  if (coreNames.includes(platformOnly)) errors.push(`${platformOnly} is Acongm platform-specific and must not be part of core-ui`);
}
if (references.primary.primitiveLibrary !== "@base-ui/react") errors.push("primary primitive library must be @base-ui/react for the current shadcn Base UI baseline");
const declaredBaseUi = pkg.devDependencies?.["@base-ui/react"];
if (declaredBaseUi !== references.primary.primitiveVersion) errors.push(`package.json @base-ui/react (${declaredBaseUi ?? "missing"}) must match reference primitiveVersion (${references.primary.primitiveVersion})`);

for (const [name, entry] of Object.entries(references.entries)) {
  if (!entry.upstreamPath || !entry.upstreamBlobSha || !Array.isArray(entry.contract)) errors.push(`${name}: reference entry must declare upstreamPath, upstreamBlobSha and contract[]`);
}

const treeUrl = `https://api.github.com/repos/${references.primary.repository}/git/trees/${encodeURIComponent(references.primary.ref)}?recursive=1`;
const response = await fetch(treeUrl, { headers: { Accept: "application/vnd.github+json", "User-Agent": "acongm-ui-reference-validator" } });
if (!response.ok) {
  errors.push(`failed to load upstream reference tree ${references.primary.repository}#${references.primary.ref}: ${response.status} ${response.statusText}`);
} else {
  const payload = await response.json();
  if (payload.truncated) errors.push("upstream reference tree response was truncated");
  else {
    const upstreamTree = new Map((payload.tree ?? []).filter((entry) => entry.type === "blob").map((entry) => [entry.path, entry.sha]));
    for (const [name, entry] of Object.entries(references.entries)) {
      const actualSha = upstreamTree.get(entry.upstreamPath);
      if (!actualSha) errors.push(`${name}: upstream path does not exist: ${entry.upstreamPath}`);
      else if (actualSha !== entry.upstreamBlobSha) errors.push(`${name}: upstream blob changed/mismatched at pinned ref\n  expected ${entry.upstreamBlobSha}\n  actual   ${actualSha}`);
    }
  }
}

if (errors.length > 0) {
  console.error("Reference validation failed:");
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`Reference contracts OK: ${Object.keys(references.entries).length} entries pinned to ${references.primary.repository}#${references.primary.ref}.`);
