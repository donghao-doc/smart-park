/**
 * 将 ISO 时间格式化为本地年月日时分
 * @param value ISO 8601 时间字符串
 * @returns `YYYY-MM-DD HH:mm` 格式的本地时间
 */
export function formatDateTime(value: string): string {
  const date = new Date(value)
  const pad = (numberValue: number) => String(numberValue).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}
