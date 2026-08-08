# Acongm shadcn-ui

Acongm applications 的共享 shadcn-compatible UI Registry。

## Scope

本仓库只维护跨应用稳定的表现层契约：

- semantic theme tokens
- `light / dark / system` theme runtime
- lightweight React UI primitives
- shadcn registry metadata

业务组件、页面布局、Chat runtime、Auth/Supabase 逻辑不进入本仓库。

## Registry

Registry source 位于：

- `registry.json`
- `registry/acongm/lib/*`
- `registry/acongm/ui/*`

消费项目应通过 Registry 获取基础组件，并在项目内拥有最终源码；不要从 `portal/chat/auth` 复制 primitives。

### Stable baseline

`stable.json` 声明当前经过完整质量门禁的稳定基线。消费者默认应固定到其中的完整 commit SHA，而不是直接追 `main`。

当前稳定版本：`0.1.0`。

```text
ref: da38680260103510fd6c57c741a5046024558282
```

使用完整 SHA 可以保证 Registry 安装结果不可变；`main` 只用于查看候选升级，不直接作为生产消费者的默认来源。

### Usage

```bash
# 浏览指定稳定 Registry
pnpm dlx shadcn@latest list Acongm/shadcn-ui#da38680260103510fd6c57c741a5046024558282

# 安装前检查完整 core-ui payload
pnpm dlx shadcn@latest view Acongm/shadcn-ui/core-ui#da38680260103510fd6c57c741a5046024558282

# 在目标应用目录安装 core-ui
pnpm dlx shadcn@latest add Acongm/shadcn-ui/core-ui#da38680260103510fd6c57c741a5046024558282
```

GitHub Registry 使用 `owner/repo/item#ref` 地址，不需要额外 registry server。未来如果具备 tag/release 自动化，可把稳定 SHA 再映射为语义版本 tag；消费者仍以不可变 ref 为最终基线。

## Validation

每个 PR 和 `main` push 都执行四层门禁：

1. Registry structural contract：文件引用、item 唯一性、semantic token、依赖边界。
2. UI source contract：native semantics、focus、disabled、ARIA、`data-slot` 等源码级约束。
3. Runtime UI tests：Vitest + React Testing Library + user-event 验证真实 render / keyboard / click / theme persistence。
4. Accessibility smoke test：axe-core 验证代表性 primitive composition，并继续执行官方 `shadcn registry validate` 验证 Registry 可被 CLI 真实解析。

测试依赖只存在于本仓库的开发/CI 环境，不会进入 Portal、Chat 或 Auth 的运行时依赖。

本地执行：

```bash
npm install
npm test
npm run test:ui
npm run test:a11y
```

## Design principles

1. Semantic tokens first：业务代码不直接绑定固定色板。
2. Source ownership：组件安装到消费项目后由项目拥有源码。
3. Low dependency：基础 primitives 尽量零依赖；只有明确交互需求才引入第三方依赖。
4. Composition over wrappers：不机械包装第三方组件，只抽稳定的跨项目 UI 语义。
5. Behavior over snapshots：优先测试用户可观察的行为、语义和可访问性，不使用脆弱的 DOM snapshot 作为主门禁。
6. Stable by immutable ref：业务项目默认消费已审阅的完整 commit SHA；升级必须显式 review。
