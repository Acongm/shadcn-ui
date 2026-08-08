import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const uiRoot = path.join(root, 'registry/acongm/ui');
const errors = [];
let assertions = 0;

function read(file) {
  return fs.readFileSync(path.join(uiRoot, file), 'utf8');
}

function expectMatch(file, pattern, description) {
  assertions += 1;
  const source = read(file);
  if (!pattern.test(source)) {
    errors.push(`${file}: ${description}`);
  }
}

function expectAll(file, checks) {
  for (const [pattern, description] of checks) {
    expectMatch(file, pattern, description);
  }
}

// Native semantics and keyboard/focus contracts.
expectAll('button.tsx', [
  [/<button\b/, 'Button must render a native <button>.'],
  [/type\s*=\s*["']button["']/, 'Button must default to type="button" to avoid accidental form submits.'],
  [/focus-visible:ring-2/, 'Button must expose a visible keyboard focus ring.'],
  [/disabled:pointer-events-none/, 'Button must preserve disabled interaction semantics.'],
]);

expectAll('input.tsx', [
  [/<input\b/, 'Input must render a native <input>.'],
  [/type\s*=\s*["']text["']/, 'Input must have an explicit default type.'],
  [/focus-visible:ring-2/, 'Input must expose a visible keyboard focus ring.'],
  [/disabled:cursor-not-allowed/, 'Input must style the disabled state.'],
]);

expectAll('textarea.tsx', [
  [/<textarea\b/, 'Textarea must render a native <textarea>.'],
  [/focus-visible:ring-2/, 'Textarea must expose a visible keyboard focus ring.'],
  [/disabled:cursor-not-allowed/, 'Textarea must style the disabled state.'],
]);

expectAll('label.tsx', [
  [/<label\b/, 'Label must render a native <label>.'],
]);

// Live-region and structural accessibility contracts.
expectAll('alert.tsx', [
  [/role\s*=\s*["']alert["']/, 'Alert must expose role="alert".'],
  [/<h5\b/, 'AlertTitle must render a heading element.'],
  [/<p\b/, 'AlertDescription must render a paragraph element.'],
]);

expectAll('separator.tsx', [
  [/role\s*=\s*["']separator["']/, 'Separator must expose role="separator".'],
  [/aria-orientation\s*=\s*\{orientation\}/, 'Separator must expose aria-orientation.'],
]);

expectAll('skeleton.tsx', [
  [/aria-hidden\s*=\s*["']true["']/, 'Decorative Skeleton must be hidden from assistive technology.'],
]);

expectAll('theme-toggle.tsx', [
  [/aria-label\s*=\s*\{`\$\{meta\.label\}，\$\{meta\.nextLabel\}`\}/, 'ThemeToggle must remain named when rendered icon-only.'],
  [/aria-hidden/, 'ThemeToggle icon must be hidden from assistive technology.'],
  [/title\s*=\s*\{meta\.nextLabel\}/, 'ThemeToggle must expose the next action as a title.'],
  [/<Button\b/, 'ThemeToggle must compose the governed Button primitive instead of creating a second interactive primitive.'],
]);

// Atomic primitives need stable slot markers for styling/testing. Composed
// controls are allowed to inherit the slot contract from governed primitives.
for (const file of fs.readdirSync(uiRoot).filter((name) => name.endsWith('.tsx') && name !== 'theme-toggle.tsx')) {
  expectMatch(file, /data-slot=/, 'Atomic UI primitive must expose at least one data-slot marker.');
}

if (errors.length > 0) {
  console.error(`UI contract checks failed (${errors.length}/${assertions}):`);
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(`UI contracts OK: ${assertions} assertions across native semantics, focus, disabled and accessibility behavior.`);
