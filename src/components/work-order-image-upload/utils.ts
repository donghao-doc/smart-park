/** 压缩现场图片，控制长边和文件体积，减少浏览器 Mock 持久化占用 */
export async function compressWorkOrderImage(file: File): Promise<File> {
  const source = URL.createObjectURL(file)
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image()
      element.onload = () => resolve(element)
      element.onerror = () => reject(new Error('无法读取图片，请选择有效的 JPG、PNG 或 WebP 文件'))
      element.src = source
    })
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) throw new Error('当前浏览器无法处理图片')
    let scale = Math.min(1, 1280 / Math.max(image.naturalWidth, image.naturalHeight))
    for (let attempt = 0; attempt < 5; attempt += 1) {
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82))
      if (blob && blob.size <= 256 * 1024) {
        const name = `${file.name.replace(/\.[^.]+$/, '').slice(0, 76)}.jpg`
        return new File([blob], name, { type: 'image/jpeg' })
      }
      scale *= 0.65
    }
    throw new Error('图片压缩失败，请选择尺寸较小的图片')
  } finally {
    URL.revokeObjectURL(source)
  }
}
