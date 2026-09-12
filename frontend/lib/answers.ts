export function firstAnswer(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

export function answerList(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value
  return value === undefined ? [] : [value]
}
