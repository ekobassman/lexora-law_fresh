/** Limite 20 messaggi/giorno per la chat demo (localStorage) */

const KEY_PREFIX = 'lexora_demo_';

function todayKey(): string {
  return KEY_PREFIX + new Date().toISOString().slice(0, 10);
}

export function getDemoUsageToday(): number {
  try {
    const raw = localStorage.getItem(todayKey());
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

export function incrementDemoUsage(): void {
  const key = todayKey();
  const count = getDemoUsageToday() + 1;
  localStorage.setItem(key, String(count));
}

export function canSendDemoMessage(): boolean {
  return getDemoUsageToday() < 20;
}

export const DEMO_LIMIT = 20;
