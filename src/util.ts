export function parseCommand(input: string): string {
  return input
    .split('\n')
    .filter((l) => l.trim())
    .filter((l) => !l.startsWith('#'))
    .join(' && ')
    .replaceAll(/&&\s+&&/g, '&&');
}

export function addCommand(previous: string | undefined, next: string): string {
  if (!previous?.trim()) return next;
  return `${previous} && ${next}`;
}
