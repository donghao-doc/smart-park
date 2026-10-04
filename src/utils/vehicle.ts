/** 普通及新能源民用车牌格式，排除易混淆的 I、O 字母 */
export const vehiclePlatePattern =
  /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼][A-HJ-NP-Z](?:[A-HJ-NP-Z0-9]{5}|[DF][A-HJ-NP-Z0-9][0-9]{4}|[0-9]{5}[DF])$/

/** 统一车牌大小写并移除输入中的空白及常见分隔符 */
export function normalizeVehiclePlate(value: string) {
  return value.replace(/[\s·•.-]/g, '').toUpperCase()
}
