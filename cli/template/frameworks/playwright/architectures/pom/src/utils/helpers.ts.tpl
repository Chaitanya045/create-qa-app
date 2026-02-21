export function normalizePath(value: string): string {
  if (!value.startsWith("/")) {
    return `/${value}`;
  }

  return value;
}
