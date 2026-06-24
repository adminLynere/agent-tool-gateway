/**
 * Núcleo de política del Agent Tool Gateway (frontera L3/L4).
 *
 * El Gateway se sitúa ENCIMA del action-registry (`@lynere/actions-runtime`): el registry
 * valida id/permiso/params/idempotencia de cada acción; el Gateway decide si una acción se
 * **permite**, se **deniega**, o **requiere aprobación humana** (L4 → Approval Request en Notion),
 * según el nivel de autonomía del agente y la allowlist por herramienta.
 *
 * Esto es el esqueleto puro (sin I/O). El servicio HTTP (NestJS) que lo expone arranca en
 * `lynere/` y migrará a este repo — ver docs/decision.md.
 */

/** Niveles de autonomía (modelo de Lynere OS). */
export type AutonomyLevel = 'L0' | 'L1' | 'L2' | 'L3' | 'L4';

const LEVEL_ORDER: Record<AutonomyLevel, number> = { L0: 0, L1: 1, L2: 2, L3: 3, L4: 4 };

/** Patrón de id de acción: `module.entity.verb` (igual que el action-registry del monorepo). */
export const ACTION_ID_PATTERN = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/;

/** Entrada de la allowlist para una acción. */
export interface ToolPolicy {
  /** id de la acción, p. ej. `incidents.incident.create`. */
  readonly actionId: string;
  /** Nivel mínimo de autonomía requerido para ejecutarla. */
  readonly minLevel: AutonomyLevel;
  /** Si true, SIEMPRE requiere aprobación humana aunque el nivel alcance (acción L4). */
  readonly requiresApproval?: boolean;
}

export type Decision = 'allow' | 'deny' | 'requires_approval';

export interface EvaluationInput {
  readonly actionId: string;
  /** Nivel de autonomía del agente que solicita la acción. */
  readonly agentLevel: AutonomyLevel;
  readonly allowlist: readonly ToolPolicy[];
}

export interface EvaluationResult {
  readonly decision: Decision;
  readonly reason: string;
}

/**
 * Decide si una acción solicitada por un agente se permite, deniega o requiere aprobación.
 *
 * Reglas:
 *  - id mal formado            → deny
 *  - acción no en la allowlist → deny (deny-by-default)
 *  - nivel del agente < minLevel → deny
 *  - acción marcada requiresApproval → requires_approval (L4 → Approval Request en Notion)
 *  - en otro caso              → allow
 */
export function evaluate({ actionId, agentLevel, allowlist }: EvaluationInput): EvaluationResult {
  if (!ACTION_ID_PATTERN.test(actionId)) {
    return { decision: 'deny', reason: `id de acción inválido: ${actionId}` };
  }

  const policy = allowlist.find((p) => p.actionId === actionId);
  if (!policy) {
    return { decision: 'deny', reason: `acción fuera de la allowlist: ${actionId}` };
  }

  if (LEVEL_ORDER[agentLevel] < LEVEL_ORDER[policy.minLevel]) {
    return {
      decision: 'deny',
      reason: `nivel insuficiente: ${agentLevel} < ${policy.minLevel} requerido por ${actionId}`,
    };
  }

  if (policy.requiresApproval) {
    return {
      decision: 'requires_approval',
      reason: `${actionId} requiere aprobación humana (L4) → Approval Request en Notion`,
    };
  }

  return { decision: 'allow', reason: `permitido para ${agentLevel}` };
}
