/**
 * 后端接口统一响应结构
 */
export interface ApiResponse<T> {
  /** 业务状态码，0 表示成功 */
  code: number
  /** 可直接展示给用户的响应消息 */
  message: string
  /** 接口返回的业务数据 */
  data: T
}

/**
 * 分页列表统一响应结构
 */
export interface PageResult<T> {
  /** 当前页数据 */
  list: T[]
  /** 符合筛选条件的数据总数 */
  total: number
  /** 当前页码，从 1 开始 */
  page: number
  /** 每页数据条数 */
  pageSize: number
}
