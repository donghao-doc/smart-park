import stylistic from '@stylistic/eslint-plugin'

/**
 * 将样式和配置文件交给行长规则检查，不解析其语法
 * 这里只启用基于原始文本的 max-len，代码语义检查由 Oxlint 负责
 */
const textParser = {
  /** 为行长检查提供原始文本对应的位置范围 */
  parse(text) {
    const lines = text.split(/\r\n|[\n\r\u2028\u2029]/u)

    return {
      type: 'Program',
      body: [],
      sourceType: 'module',
      tokens: [],
      comments: [],
      range: [0, text.length],
      loc: {
        start: { line: 1, column: 0 },
        end: {
          line: lines.length,
          column: lines.at(-1).length,
        },
      },
    }
  },
}

export default [
  {
    ignores: ['dist/**', 'dist-ssr/**', 'docs/**', 'public/**'],
  },
  {
    files: ['**/*.{css,scss,html,json,jsonc}'],
    languageOptions: { parser: textParser },
    plugins: { '@stylistic': stylistic },
    rules: {
      '@stylistic/max-len': ['error', { code: 80, tabWidth: 2 }],
    },
  },
]
