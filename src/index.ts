/**
 * @adminlynere/agent-tool-gateway
 *
 * Frontera técnica de seguridad (capa 3 del modelo de Lynere OS): toda acción crítica de un
 * agente pasa por aquí. Responsabilidades:
 *
 *  - **allowlist** por herramienta (deny-by-default) — ver {@link evaluate}.
 *  - **budgets** por agente/acción (rate + coste).
 *  - **idempotencia** (clave de idempotencia por acción; reusa el action-registry).
 *  - **audit** (todo intento → Agent Action Log en Notion).
 *  - **L4 → Approval Request** en Notion (no se ejecuta hasta aprobación humana).
 *
 * Estado: esqueleto del núcleo de política. El servicio HTTP (NestJS) que lo expone arranca en
 * `lynere/` y migra aquí — ver docs/decision.md.
 */
export * from './policy';
