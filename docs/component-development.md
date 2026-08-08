# Component development standard

`Acongm/shadcn-ui` 是多个应用共享的 source Registry，不允许把某个页面的临时实现直接提升为 core component，也不允许因为一个组件“本身通用”就自动加入默认安装集合。

## 1. Reference first

每个 generic UI item 必须在 `references/components.json` 中声明 reference implementation。

默认基线：

1. shadcn/ui 当前 Base UI registry：确定公开 API、composition、slot/state 约定。
2. Base UI：承担复杂交互 primitive 的行为、键盘和无障碍基础。
3. React Aria：对 composite/interactive 组件做第二套 accessibility / interaction model cross-check。
4. Native HTML：当上游本身保持 native element 时，不为了“统一”强行引入 headless dependency。

Acongm 可以改变视觉 token，但不能没有理由地缩窄成熟 API、改变 HTML 语义或重新实现复杂交互。

## 2. Generic component != default bundle

组件是否适合放在 Registry，和是否应该被 `core-ui` 默认安装，是两个独立决策。

### `core-ui` — 最小默认基础

默认 bundle 只接受：

- foundational contract，例如 semantic theme / `cn`；或
- 已在至少两个独立应用中经过 review 的通用组件。

当前默认 core：

- semantic theme
- ui-cn
- Button
- Card
- Badge

真实消费记录维护在 `references/adoption.json`，CI 会校验默认 core 的 admission evidence。

### `form-ui` — 按需表单能力

只有拥有表单的应用才安装：

- Input
- Textarea
- Label
- Field
- Alert
- Separator

这些组件仍然是 generic primitives，但不会因为“组件库里有”就污染每个项目的默认源码集合。

### Individual / on-demand

例如 Skeleton 当前只有 Chat 实际使用，因此保持单独安装，不进入默认 bundle。

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

## 3. Admission rules

新增组件前必须先回答：

1. 哪个真实应用需要它？
2. 是否已经有成熟 upstream reference？
3. 它解决的是通用 UI 问题，还是某个页面/产品问题？
4. 如果只被一个应用使用，为什么不能保持 app-local 或 individual Registry item？
5. 是否需要复杂交互 primitive；如果需要，为什么选择 Base UI / React Aria，而不是手写？
6. 它是否需要进入默认 core；如果是，是否满足 foundational 或至少两个独立消费者？

不因为 shadcn 官方存在某组件，就自动复制到 Acongm Registry。

## 4. API rules

- 优先保持 shadcn 当前公开 API；偏离时必须在代码或 reference manifest 中记录理由。
- 不能用 `h3/h5` 等固定 heading level 代替中性 content container，除非组件语义本身要求该 heading。
- `className` 必须可可靠覆盖默认 Tailwind utility，因此使用 `clsx + tailwind-merge`。
- Variant/size 使用 CVA 或等价的可枚举 typed contract，不用散落的条件字符串。
- 复杂交互不自写 focus management、keyboard navigation、dismiss、positioning、selection state。
- 不把业务颜色借用成状态颜色，例如用 `primary` 假装 `success`。
- 独立 Registry 不得隐式依赖消费项目未安装的全局 Tailwind custom variants。

## 5. Required tests

每个 generic component 至少覆盖与其职责相关的测试：

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

Snapshot-only tests do not count as behavior coverage。

## 6. Release gate

A component can be treated as reviewed Registry source only when:

1. reference manifest exists and upstream source is reproducible;
2. component API is reviewed against reference;
3. source contract passes;
4. strict TypeScript public API typecheck passes;
5. runtime behavior tests pass;
6. axe smoke passes;
7. official `shadcn registry validate` passes;
8. relevant Portal / Chat / Auth drift review and production build pass for consumer upgrades。

进入 `core-ui` 还必须额外通过 `references/adoption.json` admission policy。

Stable release/tag/SHA must not be created while known core contract gaps remain.
