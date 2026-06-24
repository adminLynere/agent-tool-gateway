# agent-tool-gateway

> **Frontera técnica L3/L4** del ecosistema agentic de Lynere. Toda acción crítica de un agente
> pasa por aquí: allowlist (deny-by-default), budgets, idempotencia, auditoría y la conversión de
> acciones **L4** en *Approval Requests* de Notion.

Repo privado de `adminLynere`. Capa 3 del modelo *Lynere OS* — ver [`infra`](https://github.com/adminLynere/infra) para el diagrama de interconexión.

## Responsabilidades

| Pieza | Qué hace |
| --- | --- |
| **allowlist** | deny-by-default por herramienta (`module.entity.verb`). Solo lo explícitamente permitido se ejecuta. |
| **budgets** | límites por agente/acción (rate + coste); corta cuando se exceden. |
| **idempotencia** | clave de idempotencia por acción (reusa el `action-registry`). |
| **audit** | todo intento → *Agent Action Log* en Notion. |
| **L4 → Approval** | acciones L4 (prod, secrets, merge a main, billing…) crean una *Approval Request* y **no** se ejecutan hasta aprobación humana. |

Se apoya en `@lynere/actions-runtime` (action-registry: valida id/permiso/params). El Gateway
añade la capa de **política + gobernanza** encima. Estándar de acciones:
`lynere/docs/development/agents/actions-standard.md` y `action-catalog.md` (SoT).

## Estado y decisión de ubicación

**Esqueleto** del núcleo de política (`src/policy.ts` — puro, testeado). El servicio HTTP
(NestJS) que lo expone **arranca en `lynere/`** (donde ya viven `libs/actions-runtime`,
contracts, auth) y **migra a este repo** cuando estabilice. Ver [`docs/decision.md`](docs/decision.md).

## Desarrollo

```bash
nvm use            # Node 22
pnpm install
pnpm lint          # eslint (flat config)
pnpm build         # tsc -> dist/
pnpm test          # vitest
```

CI: `.github/workflows/ci.yml` (lint + build + test) en `main` y `development`. Equivale al
reusable `adminLynere/infra/.github/workflows/reusable-node-ci.yml`.

## Flujo de ramas (gobernanza)

`feature/* → development → main` (misma convención que `lynere`). PRs **contra `development`**;
`development` se promociona a `main` (release). **Merge a `main` = aprobación humana** (L4). El plan
free de la org no permite branch protection en privados → la regla se aplica **por convención**.
