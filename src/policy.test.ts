import { describe, it, expect } from 'vitest';
import { evaluate, type ToolPolicy } from './policy';

const allowlist: ToolPolicy[] = [
  { actionId: 'work.item.read', minLevel: 'L0' },
  { actionId: 'code.branch.create', minLevel: 'L2' },
  { actionId: 'prod.deploy.run', minLevel: 'L4', requiresApproval: true },
];

describe('evaluate', () => {
  it('deniega ids mal formados', () => {
    expect(evaluate({ actionId: 'NotValid', agentLevel: 'L4', allowlist }).decision).toBe('deny');
  });

  it('deniega por defecto lo que no está en la allowlist', () => {
    expect(evaluate({ actionId: 'secrets.vault.read', agentLevel: 'L4', allowlist }).decision).toBe('deny');
  });

  it('deniega cuando el nivel del agente es insuficiente', () => {
    expect(evaluate({ actionId: 'code.branch.create', agentLevel: 'L1', allowlist }).decision).toBe('deny');
  });

  it('permite cuando el nivel alcanza y no requiere aprobación', () => {
    expect(evaluate({ actionId: 'work.item.read', agentLevel: 'L0', allowlist }).decision).toBe('allow');
    expect(evaluate({ actionId: 'code.branch.create', agentLevel: 'L2', allowlist }).decision).toBe('allow');
  });

  it('exige aprobación para acciones L4 aunque el nivel alcance', () => {
    expect(evaluate({ actionId: 'prod.deploy.run', agentLevel: 'L4', allowlist }).decision).toBe(
      'requires_approval',
    );
  });
});
