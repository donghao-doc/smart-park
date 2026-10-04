import { Tag } from 'antd'

import type { OperationLogResult } from '@/types/operation-log'
import { operationLogResultLabels } from '@/utils/operation-log'
import './operation-log-result.scss'

interface OperationLogResultTagProps {
  /** 日志记录的操作执行结果 */
  result: OperationLogResult
}

/** 用统一颜色和文字区分操作成功与失败 */
function OperationLogResultTag({ result }: OperationLogResultTagProps) {
  return (
    <Tag className={`operation-log-result-tag is-${result}`} variant="filled">
      {operationLogResultLabels[result]}
    </Tag>
  )
}

export default OperationLogResultTag
