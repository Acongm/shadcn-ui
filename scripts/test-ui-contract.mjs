import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const uiRoot = path.join(root, "registry/acongm/ui");
const libRoot = path.join(root, "registry/acongm/lib");
const errors = [];
let assertions = 0;

function readUi(file) {
  return fs.readFileSync(path.join(uiRoot, file), "utf8");
}

function readLib(file) {
  return fs.readFileSync(path.join(libRoot, file), "utf8");
}

function expectSource(source, label, pattern, description) {
  assertions += 1;
  if (!pattern.test(source)) errors.push(`${label}: ${description}`);
}

function expectUi(file, checks) {
  const source = readUi(file);
  for (const [pattern, description] of checks) {
    expectSource(source, file, pattern, description);
  }
}

const cnSource = readLib("ui-cn.ts");
expectSource(cnSource, "ui-cn.ts", /from ["']clsx["']/, "cn must use clsx for conditional class composition.");
expectSource(cnSource, "ui-cn.ts", /from ["']tailwind-merge["']/, "cn must use tailwind-merge so consumer classes can override defaults.");
expectSource(cnSource, "ui-cn.ts", /twMerge\(clsx\(inputs\)\)/, "cn must merge Tailwind conflicts after clsx composition.");

expectUi("button.tsx", [
  [/@base-ui\/react\/button/, "Button must use the Base UI primitive from the pinned shadcn baseline."],
  [/class-variance-authority/, "Button variants must use a typed CVA contract."],
  [/link:/, "Button must preserve shadcn's link variant."],
  [/"icon-xs"/, "Button must preserve shadcn's icon-xs size."],
  [/"icon-sm"/, "Button must preserve shadcn's icon-sm size."],
  [/"icon-lg"/, "Button must preserve shadcn's icon-lg size."],
  [/data-variant=\{variant\}/, "Button must expose its variant as a stable state marker."],
  [/data-size=\{size\}/, "Button must expose its size as a stable state marker."],
  [/focus-visible:ring-\[3px\]/, "Button must expose a visible keyboard focus ring."],
  [/disabled:pointer-events-none/, "Button must preserve disabled interaction styling."],
]);

expectUi("input.tsx", [
  [/@base-ui\/react\/input/, "Input must use the Base UI primitive from the pinned shadcn baseline."],
  [/React\.ComponentProps<"input">/, "Input public props must remain compatible with native input props."],
  [/aria-invalid:border-destructive/, "Input must expose invalid-state styling."],
  [/focus-visible:ring-\[3px\]/, "Input must expose keyboard focus styling."],
  [/file:inline-flex/, "Input must preserve file-input support."],
]);

expectUi("textarea.tsx", [
  [/<textarea\b/, "Textarea must remain a native textarea like the shadcn baseline."],
  [/React\.ComponentProps<"textarea">/, "Textarea public props must remain native-compatible."],
  [/aria-invalid:border-destructive/, "Textarea must expose invalid-state styling."],
]);

expectUi("label.tsx", [
  [/<label\b/, "Label must remain a native label."],
  [/React\.ComponentProps<"label">/, "Label public props must remain native-compatible."],
]);

expectUi("card.tsx", [
  [/size\?: "default" \| "sm"/, "Card must preserve the current shadcn size contract."],
  [/data-slot="card-action"/, "Card must provide CardAction composition."],
  [/function CardTitle[\s\S]*?<div/, "CardTitle must not force an application heading level."],
  [/function CardDescription[\s\S]*?<div/, "CardDescription must remain semantically neutral."],
]);

expectUi("badge.tsx", [
  [/@base-ui\/react\/use-render/, "Badge must use Base UI render semantics."],
  [/class-variance-authority/, "Badge variants must use a typed CVA contract."],
  [/ghost:/, "Badge must preserve the shadcn ghost variant."],
  [/link:/, "Badge must preserve the shadcn link variant."],
  [/slot: "badge"/, "Badge must expose a stable slot state."],
]);

const alertSource = readUi("alert.tsx");
expectSource(alertSource, "alert.tsx", /role="alert"/, "Alert must expose role=alert.");
expectSource(alertSource, "alert.tsx", /data-slot="alert-action"/, "Alert must provide AlertAction composition.");
expectSource(alertSource, "alert.tsx", /function AlertTitle[\s\S]*?<div/, "AlertTitle must not force a heading level.");
expectSource(alertSource, "alert.tsx", /function AlertDescription[\s\S]*?<div/, "AlertDescription must remain a neutral content container.");
assertions += 1;
if (/success:/.test(alertSource)) {
  errors.push("alert.tsx: success must not be a core variant unless a dedicated semantic success token contract exists.");
}

expectUi("separator.tsx", [
  [/@base-ui\/react\/separator/, "Separator must delegate orientation semantics to Base UI."],
  [/orientation = "horizontal"/, "Separator must preserve the horizontal default."],
  [/data-horizontal:h-px/, "Separator must style Base UI horizontal state."],
  [/data-vertical:w-px/, "Separator must style Base UI vertical state."],
]);

expectUi("skeleton.tsx", [
  [/data-slot="skeleton"/, "Skeleton must expose a stable slot."],
  [/animate-pulse/, "Skeleton must preserve loading placeholder animation."],
]);

expectUi("field.tsx", [
  [/<fieldset\b/, "FieldSet must use native fieldset semantics."],
  [/<legend\b/, "FieldLegend must use native legend semantics."],
  [/role="group"/, "Field must expose group semantics."],
  [/data-slot="field-description"/, "Field must provide description composition."],
  [/role="alert"/, "FieldError must announce validation errors."],
  [/new Map\(errors\.map/, "FieldError must deduplicate repeated messages like the shadcn baseline."],
]);

expectUi("theme-toggle.tsx", [
  [/<Button\b/, "ThemeToggle recipe must compose core Button rather than define another interactive primitive."],
  [/aria-label=/, "ThemeToggle must retain an accessible name when icon-only."],
]);

if (errors.length > 0) {
  console.error(`UI source contract checks failed (${errors.length}/${assertions}):`);
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(
  `UI source contracts OK: ${assertions} reference-aligned assertions across API, semantics and composition.`,
);
