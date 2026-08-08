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

### Usage

```bash
# 浏览 Registry
pnpm dlx shadcn@latest list Acongm/shadcn-ui

# 安装前检查完整 core-ui payload
pnpm dlx shadcn@latest view Acongm/shadcn-ui/core-ui

# 在目标应用目录安装 core-ui
pnpm dlx shadcn@latest add Acongm/shadcn-ui/core-ui

# 只安装一个组件
pnpm dlx shadcn@latest add Acongm/shadcn-ui/button
```

GitHub Registry 使用 `owner/repo/item` 地址，不需要额外 registry server。稳定发布后可在地址末尾加 `#tag` 或完整 commit SHA 进行版本固定。

## Validation

每个 PR 和 `main` push 都执行：

1. 本地结构约束检查：文件引用、item 唯一性、semantic token、依赖边界。
2. 官方 `shadcn registry validate`，验证真实 CLI 可解析该 GitHub Registry。

## Design principles

1. Semantic tokens first：业务代码不直接绑定固定色板。
2. Source ownership：组件安装到消费项目后由项目拥有源码。
3. Low dependency：基础 primitives 尽量零依赖；只有明确交互需求才引入第三方依赖。
4. Composition over wrappers：不机械包装第三方组件，只抽稳定的跨项目 UI 语义。
