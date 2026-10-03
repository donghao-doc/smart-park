/**
 * 隐藏 11 位手机号码中间四位，非标准格式保持原值
 * @param phone 手机号码
 * @returns 脱敏后的手机号码
 */
export function maskPhoneNumber(phone: string): string {
  return phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
}
