import StatusPage from '@/components/status-page'

/**
 * 403 无权限页面
 */
function ForbiddenPage() {
  return <StatusPage status="403" subTitle="抱歉，您无权访问此页面。" />
}

export default ForbiddenPage
