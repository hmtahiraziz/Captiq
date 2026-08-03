export function getParam(value: string | string[] | undefined, name = 'id'): string {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value) && value[0]) {
    return value[0];
  }

  throw new Error(`Missing route parameter: ${name}`);
}
