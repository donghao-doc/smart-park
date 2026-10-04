import { Modal, type ModalProps } from 'antd'

import './scrollable-modal.scss'

/** 公共滚动弹窗属性，沿用 Ant Design Modal 的标题、按钮、事件和语义化样式配置 */
export type ScrollableModalProps = ModalProps

/**
 * 公共滚动弹窗，默认居中并限制在视口内，固定标题与底部操作，仅内容区纵向滚动
 * 业务 className 和 classNames 与公共类名合并，避免覆盖滚动布局
 */
function ScrollableModal({
  className,
  classNames,
  centered = true,
  ...modalProps
}: ScrollableModalProps) {
  return (
    <Modal
      {...modalProps}
      centered={centered}
      className={['scrollable-modal', className].filter(Boolean).join(' ')}
      classNames={(info) => {
        const customClassNames = typeof classNames === 'function' ? classNames(info) : classNames

        return {
          ...customClassNames,
          container: ['scrollable-modal-container', customClassNames?.container]
            .filter(Boolean)
            .join(' '),
          header: ['scrollable-modal-header', customClassNames?.header].filter(Boolean).join(' '),
          body: ['scrollable-modal-body', customClassNames?.body].filter(Boolean).join(' '),
          footer: ['scrollable-modal-footer', customClassNames?.footer].filter(Boolean).join(' '),
        }
      }}
    />
  )
}

export default ScrollableModal
