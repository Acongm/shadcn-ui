import fs from "node:fs";

const registry = JSON.parse(fs.readFileSync("registry.json", "utf8"));
const references = JSON.parse(fs.readFileSync("references/components.json", "utf8"));
const adoption = JSON.parse(fs.readFileSync("references/adoption.json", "utf8"));
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const errors = [];

const prefix = "Acongm/shadcn-ui/";
const items = new Map(registry.items.map((item) => [item.name, item]));
const core = items.get("core-ui");
const form = items.get("form-ui");
if (!core) errors.push("registry.json must contain core-ui");
if (!form) errors.push("registry.json must contain form-ui");

const namesOf = (item) => (item?.registryDependencies ?? []).map((dependency) => dependency.startsWith(prefix) ? dependency.slice(prefix.length) : dependency);
const coreNames = namesOf(core);
const formNames = namesOf(form);
const referenceExempt = new Set(["acongm-theme"]);

for (const name of new Set([...coreNames, ...formNames])) {
  if (!referenceExempt.has(name) && !references.entries[name]) {
    errors.push(`bundled item ${name} has no references/components.json entry`);
  }
}

for (const platformOnly of ["theme-runtime", "theme-toggle", "platform-theme"]) {
  if (coreNames.includes(platformOnly)) errors.push(`${platformOnly} is Acongm platform-specific and must not be part of core-ui`);
  if (formNames.includes(platformOnly)) errors.push(`${platformOnly} is Acongm platform-specific and must not be part of form-ui`);
}

for (const name of coreNames) {
  const entry = adoption.items?.[name];
  if (!entry) {
    errors.push(`core-ui item ${name} has no references/adoption.json record`);
    continue;
  }
  const consumers = Array.isArray(entry.consumers) ? [...new Set(entry.consumers)] : [];
  if (!entry.foundation && consumers.length < 2) {
    errors.push(`core-ui item ${name} must be foundational or have reviewed adoption in at least two independent applications`);
  }
  if (entry.platformSpecific) errors.push(`core-ui item ${name} cannot be platformSpecific`);
}

for (const name of formNames) {
  const entry = adoption.items?.[name];
  if (!entry) errors.push(`form-ui item ${name} has no references/adoption.json record`);
  else if (entry.bundle !== "form-ui") errors.push(`form-ui item ${name} must declare bundle=form-ui in references/adoption.json`);
}

for (const [name, entry] of Object.entries(adoption.items ?? {})) {
  if (!items.has(name) && name !== "acongm-theme" && name !== "ui-cn") {
    errors.push(`${name}: adoption record points to an item missing from registry.json`);
  }
  if (entry.platformSpecific && coreNames.includes(name)) {
    errors.push(`${name}: platform-specific adoption cannot enter core-ui`);
  }
}

if (references.primary.primitiveLibrary !== "@base-ui/react") {
  errors.push("primary primitive library must be @base-ui/react for the current shadcn Base UI baseline");
}
const declaredBaseUi = pkg.devDependencies?.["@base-ui/react"];
if (declaredBaseUi !== references.primary.primitiveVersion) {
  errors.push(`package.json @base-ui/react (${declaredBaseUi ?? "missing"}) must match reference primitiveVersion (${references.primary.primitiveVersion})`);
}

for (const [name, entry] of Object.entries(references.entries)) {
  if (!entry.upstreamPath || !entry.upstreamBlobSha || !Array.isArray(entry.contract)) {
    errors.push(`${name}: reference entry must declare upstreamPath, upstreamBlobSha and contract[]`);
  }
}

const treeUrl = `https://api.github.com/repos/${references.primary.repository}/git/trees/${encodeURIComponent(references.primary.ref)}?recursive=1`;
const response = await fetch(treeUrl, {
  headers: { Accept: "application/vnd.github+json", "User-Agent": "acongm-ui-reference-validator" },
});
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
      else if (actualSha !== entry.upstreamBlobSha) {
        errors.push(`${name}: upstream blob changed/mismatched at pinned ref\n  expected ${entry.upstreamBlobSha}\n  actual   ${actualSha}`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error("Reference/admission validation failed:");
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(
  `Reference/admission contracts OK: ${Object.keys(references.entries).length} upstream references, ${coreNames.length} default core items, ${formNames.length} opt-in form items.`,
);
