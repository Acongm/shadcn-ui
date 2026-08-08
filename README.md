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

## Design principles

1. Semantic tokens first：业务代码不直接绑定固定色板。
2. Source ownership：组件安装到消费项目后由项目拥有源码。
3. Low dependency：基础 primitives 尽量零依赖；只有明确交互需求才引入第三方依赖。
4. Composition over wrappers：不机械包装第三方组件，只抽稳定的跨项目 UI 语义。
