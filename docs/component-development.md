# Component development standard

`Acongm/shadcn-ui` 是多个应用共享的 source Registry，不允许把某个页面的临时实现直接提升为 core component。

## 1. Reference first

每个 `core-ui` item 必须在 `references/components.json` 中声明 reference implementation。

默认基线：

1. shadcn/ui 当前 Base UI registry：确定公开 API、composition、slot/state 约定。
2. Base UI：承担复杂交互 primitive 的行为、键盘和无障碍基础。
3. React Aria：对 composite/interactive 组件做第二套 accessibility / interaction model cross-check。
4. Native HTML：当上游本身保持 native element 时，不为了“统一”强行引入 headless dependency。

Acongm 可以改变视觉 token，但不能没有理由地缩窄成熟 API、改变 HTML 语义或重新实现复杂交互。

## 2. Core vs platform vs recipe

### Core

可跨 Portal / Chat / Auth 复用，且不包含域名、业务流程、特定产品状态：

- Button / Input / Textarea / Label / Field
- Card / Badge / Alert
- Separator / Skeleton
- semantic design tokens

### Platform

Acongm 多站点基础设施，可共享但不是通用 UI primitive：

- `.acongm.com` theme cookie
- cross-subdomain theme persistence
- Acongm-specific navigation/auth integration

### Recipe

由 core primitives 组合出的产品/场景组件：

- ThemeToggle
- status/success alert
- login panel
- chat action button

Platform/recipe item 不得被 `core-ui` aggregate 隐式安装。

## 3. API rules

- 优先保持 shadcn 当前公开 API；偏离时必须在代码或 reference manifest 中记录理由。
- 不能用 `h3/h5` 等固定 heading level 代替中性 content container，除非组件语义本身要求该 heading。
- `className` 必须可可靠覆盖默认 Tailwind utility，因此使用 `clsx + tailwind-merge`。
- Variant/size 使用 CVA 或等价的可枚举 typed contract，不用散落的条件字符串。
- 复杂交互不自写 focus management、keyboard navigation、dismiss、positioning、selection state。
- 不把业务颜色借用成状态颜色，例如用 `primary` 假装 `success`。

## 4. Required tests

每个 core component 至少覆盖与其职责相关的测试：

### API contract

- public variants / sizes
- passthrough native/primitive props
- data-slot / state markers
- className override and Tailwind conflict resolution

### Runtime behavior

- keyboard activation/focus where interactive
- disabled behavior
- controlled/uncontrolled state when applicable
- render/as-link semantics when supported
- horizontal/vertical behavior when applicable

### Accessibility

- accessible name/label association
- aria-invalid / role / orientation where applicable
- axe smoke for representative compositions
- heading hierarchy remains consumer-controlled

### Composition

- Field + Label + Input + Description + Error
- Card + Action
- Alert + Action
- icons do not break spacing/accessible names

Snapshot-only tests do not count as behavior coverage.

## 5. Release gate

A component can enter `core-ui` only when:

1. reference manifest exists and upstream source is reproducible;
2. component API is reviewed against reference;
3. source contract passes;
4. runtime behavior tests pass;
5. axe smoke passes;
6. official `shadcn registry validate` passes;
7. Portal / Chat / Auth drift review and production build pass for consumer upgrades.

Stable release/tag/SHA must not be created while known core contract gaps remain.
