# Decisión: ¿arranca aquí o en `lynere/`?

**Decisión (2026-06):** el servicio **arranca en `lynere/`** y migra a este repo después.

## Por qué

- El Gateway depende fuertemente de código que ya vive en el monorepo: `libs/actions-runtime`
  (action-registry), `libs/contracts`, `libs/auth`/`auth-admin`, tipos y Prisma. Arrancar aquí
  obligaría a publicar esas libs como paquetes o duplicarlas — fricción prematura.
- El plan del ecosistema (README maestro, §"06→03/04 blando") es explícito: **03/04 arrancan en
  `lynere/` y migran después** → 06 no bloquea a 03.
- "No big-bang": primero esqueleto + contrato (este repo), luego migración incremental.

## Qué vive dónde (ahora)

| Pieza | Ahora | Destino |
| --- | --- | --- |
| Núcleo de política (allowlist/niveles) | este repo (`src/policy.ts`, esqueleto) | este repo |
| action-registry | `lynere/libs/actions-runtime` | se reusa vía paquete o se mueve con el servicio |
| Servicio HTTP NestJS (módulo Gateway) | `lynere/apps/*` (lo crea el agente 03) | este repo |
| Estándar/catálogo de acciones | `lynere/docs/development/agents/` | SoT en el monorepo |

## Disparador de la migración

Cuando el módulo Gateway en `lynere/` esté estable (allowlist + idempotencia + audit + L4→Approval
funcionando contra Notion) y haya contrato de versionado para las libs compartidas, se mueve el
servicio aquí en un PR coordinado (regenerando lockfiles).
