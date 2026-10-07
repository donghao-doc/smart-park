# Favicon 生成记录

使用内置 imagegen 工具生成，透明背景输出，再通过 macOS `sips` 缩放为 64×64 PNG

项目资源：`public/favicon.png`

## 完整提示词

```text
Use case: logo-brand
Asset type: browser favicon for the Chinese Smart Park (智慧园区) administration web app
Primary request: Generate a single polished minimal favicon showing a modern business park as a bold white architectural mark inside a blue rounded square
Subject: two simple connected building silhouettes of different heights, integrated into one compact distinctive symbol
Style/medium: flat geometric graphic, crisp solid fills, professional enterprise software identity
Composition/framing: square canvas, centered mark, blue rounded square fills almost the whole canvas with a small uniform transparent margin, white mark occupies about 65 percent of tile width; thick shapes and generous negative space that remain recognizable at 16 by 16 pixels
Color palette: project primary blue #1677ff and white only
Scene/backdrop: genuinely transparent outside the rounded blue square
Constraints: exactly one icon, no letters, no text, no tiny windows, no fine lines, no gradients, no shadows, no 3D, no surrounding mockup, no watermark
```

## 瑕疵修复

使用内置 imagegen 编辑原始图标，去掉右上角模糊斑块，保留建筑轮廓、蓝色圆角底和透明背景，再缩放为 64×64 PNG 替换项目资源

页面引用追加 `?v=2`，让浏览器重新加载修复后的图标

```text
Use case: precise-object-edit
Asset type: repaired Smart Park favicon
Input images: Image 1 is the edit target, the original favicon
Primary request: Remove the blurry pixelated blemish in the upper-right blue area completely. Restore the blue tile to a perfectly uniform solid #1677ff fill throughout, with no mottling, patches, texture, glow, gradient, shadows, or extra marks
Constraints: Preserve exactly the existing white two-building symbol, its silhouette, line thickness, proportions, placement, and the rounded square outline. Keep the white symbol solid clean white. Preserve the square canvas and transparent margin outside the blue tile. Clean any stray edge pixels outside the rounded square. This is only blemish cleanup, do not redesign the icon
Avoid: any upper-right spot, mosaic, blurry artifact, dot, watermark, text, new symbol, checkered background baked into the image, dark background baked into the image
```
