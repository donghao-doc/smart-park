import { PlusOutlined } from '@ant-design/icons'
import { App, Button, Flex, Image, Upload, type UploadFile, type UploadProps } from 'antd'
import { useEffect, useState } from 'react'

import { reqUploadWorkOrderImage, reqUploadWorkOrderSampleImage } from '@/api'
import type { WorkOrderImageDto } from '@/types/work-order'
import { compressWorkOrderImage } from './utils'
import './work-order-image-upload.scss'

interface WorkOrderImageUploadProps {
  /** 已上传并保存的工单图片，最多 5 张 */
  value?: WorkOrderImageDto[]
  /** 新增或删除后保存附件，保存完成后才解除上传锁定 */
  onChange?: (images: WorkOrderImageDto[]) => void | Promise<void>
  /** 归档或无权限时仅展示和预览图片 */
  disabled?: boolean
  /** 通知外层在上传或保存期间禁止提交工单 */
  onBusyChange?: (busy: boolean) => void
}

/** 工单图片上传与预览，串行保存附件，支持本地文件及示例图片 */
function WorkOrderImageUpload({
  value = [],
  onChange,
  disabled,
  onBusyChange,
}: WorkOrderImageUploadProps) {
  const { message } = App.useApp()
  const [busy, setBusy] = useState(false)
  const [pendingFile, setPendingFile] = useState<UploadFile>()
  const [previewIndex, setPreviewIndex] = useState<number>()

  useEffect(() => {
    onBusyChange?.(busy)
  }, [busy, onBusyChange])

  /** 校验原始文件，实际请求前还会统一压缩 */
  const beforeUpload: UploadProps['beforeUpload'] = (file, files) => {
    if (busy || value.length + files.length > 5) {
      void message.warning('最多上传 5 张图片，请等待当前上传完成')
      return Upload.LIST_IGNORE
    }
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      void message.warning('请选择不超过 2 MB 的 JPG、PNG 或 WebP 图片')
      return Upload.LIST_IGNORE
    }
    return true
  }

  /** 压缩、上传并交由业务页面保存，失败时保留原有附件 */
  const handleUpload: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    if (!(file instanceof File)) return
    setBusy(true)
    setPendingFile({ uid: 'pending', name: file.name, status: 'uploading' })
    let compressed: File
    try {
      compressed = await compressWorkOrderImage(file)
    } catch (error) {
      void message.error(error instanceof Error ? error.message : '图片处理失败')
      onError?.(new Error('图片处理失败'))
      setPendingFile(undefined)
      setBusy(false)
      return
    }
    try {
      const image = await reqUploadWorkOrderImage(compressed)
      await onChange?.([...value, image])
      onSuccess?.(image)
    } catch {
      // HTTP 层统一展示上传或保存错误，保留已有附件供用户重试
      onError?.(new Error('图片上传失败'))
    } finally {
      setPendingFile(undefined)
      setBusy(false)
    }
  }

  /** 示例图片也经过模拟上传接口并保存，便于演示完整附件流程 */
  async function handleAddSample() {
    setBusy(true)
    try {
      const image = await reqUploadWorkOrderSampleImage(value.length % 3)
      await onChange?.([...value, image])
    } catch {
      // 统一 HTTP 层反馈错误，不改变已有附件
    } finally {
      setBusy(false)
    }
  }

  /** 先保存删除结果，接口失败时保留图片 */
  async function handleRemove(file: UploadFile) {
    if (busy || disabled) return false
    setBusy(true)
    try {
      await onChange?.(value.filter((image) => image.id !== file.uid))
      return true
    } catch {
      return false
    } finally {
      setBusy(false)
    }
  }

  const files: UploadFile[] = value.map((image) => ({
    uid: image.id,
    name: image.name,
    url: image.url,
    thumbUrl: image.url,
    status: 'done',
  }))

  return (
    <Flex className="work-order-image-upload" vertical gap={8}>
      <Upload
        accept="image/jpeg,image/png,image/webp"
        listType="picture-card"
        fileList={pendingFile ? [...files, pendingFile] : files}
        disabled={disabled || busy}
        beforeUpload={beforeUpload}
        customRequest={handleUpload}
        onRemove={handleRemove}
        onPreview={(file) => setPreviewIndex(value.findIndex((image) => image.id === file.uid))}
        showUploadList={{
          showRemoveIcon: !disabled && !busy,
          showPreviewIcon: true,
        }}
      >
        {!disabled && value.length < 5 ? (
          <Flex vertical align="center" gap={8}>
            <PlusOutlined />
            <span>{busy ? '正在保存' : '上传图片'}</span>
          </Flex>
        ) : null}
      </Upload>
      {!disabled ? (
        <Flex align="center" gap={12} wrap>
          <span className="work-order-image-upload-hint">
            最多 5 张，JPG / PNG / WebP，每张不超过 2 MB
          </span>
          <Button
            size="small"
            disabled={busy || value.length >= 5}
            loading={busy && !pendingFile}
            onClick={() => void handleAddSample()}
          >
            添加示例图片
          </Button>
        </Flex>
      ) : value.length === 0 ? (
        <span className="work-order-image-upload-hint">暂无现场图片</span>
      ) : null}
      <Image.PreviewGroup
        items={value.map((image) => ({ src: image.url, alt: image.name }))}
        preview={{
          open: previewIndex !== undefined && previewIndex >= 0,
          current: previewIndex ?? 0,
          onOpenChange: (open) => {
            if (!open) setPreviewIndex(undefined)
          },
          onChange: (index) => setPreviewIndex(index),
        }}
      />
    </Flex>
  )
}

export default WorkOrderImageUpload
