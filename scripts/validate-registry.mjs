import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const registryPath = path.join(root, 'registry.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const items = Array.isArray(registry.items) ? registry.items : [];
const names = new Set();
const errors = [];

for (const item of items) {
  if (!item?.name) {
    errors.push('registry item is missing name');
    continue;
  }
  if (names.has(item.name)) errors.push(`duplicate registry item: ${item.name}`);
  names.add(item.name);
}

for (const item of items) {
  for (const file of item.files ?? []) {
    const filePath = path.join(root, file.path);
    if (!fs.existsSync(filePath)) {
      errors.push(`${item.name}: missing file ${file.path}`);
    }
  }

  for (const dependency of item.registryDependencies ?? []) {
    if (!dependency.startsWith('Acongm/shadcn-ui/')) {
      errors.push(`${item.name}: registry dependency must use Acongm/shadcn-ui/*: ${dependency}`);
      continue;
    }
    const dependencyName = dependency.split('/').at(-1);
    if (!names.has(dependencyName)) {
      errors.push(`${item.name}: unknown registry dependency ${dependency}`);
    }
  }
}

const forbidden = JSON.stringify(registry).match(/Acongm\/(?:portal|chat|auth)\//g) ?? [];
if (forbidden.length > 0) {
  errors.push('registry must not depend on portal/chat/auth registries');
}

const theme = items.find((item) => item.name === 'acongm-theme');
const requiredTokens = [
  'background', 'foreground', 'card', 'card-foreground', 'popover',
  'popover-foreground', 'primary', 'primary-foreground', 'secondary',
  'secondary-foreground', 'muted', 'muted-foreground', 'accent',
  'accent-foreground', 'destructive', 'destructive-foreground',
  'border', 'input', 'ring',
];
for (const mode of ['light', 'dark']) {
  for (const token of requiredTokens) {
    if (!theme?.cssVars?.[mode]?.[token]) {
      errors.push(`acongm-theme: missing ${mode}.${token}`);
    }
  }
}

if (!names.has('core-ui')) errors.push('core-ui registry entry is required');

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(`Registry OK: ${items.length} items, single source Acongm/shadcn-ui`);
