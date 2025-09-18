// Lightweight PDF generation helpers using pdf-lib (no eval / CSP safe)
// Focus: text content, simple tables, image embedding from canvas
/* global Image */
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

/**
 * Create a simple multi-page PDF from large PNG image slices (canvas capture workflow replacement)
 * @param {string} dataUrl PNG data url
 * @param {object} options { pageWidthPt, pageHeightPt }
 * @returns {Promise<Blob>}
 */
export async function pdfFromTallImage(dataUrl, options = {}) {
  const pageWidthPt = options.pageWidthPt || 595.28
  const pageHeightPt = options.pageHeightPt || 841.89

  // Create offscreen canvas to slice image for true pagination
  if (typeof Image === 'undefined') {
    throw new Error('Image API not available in this environment')
  }
  const img = new Image()
  img.src = dataUrl
  await new Promise((res, rej) => {
    img.onload = res
    img.onerror = rej
  })
  const sliceCanvas = document.createElement('canvas')
  const ctx = sliceCanvas.getContext('2d')

  // Scale to page width; height will vary
  const scale = pageWidthPt / img.width
  // const scaledFullHeight = img.height * scale // not currently used; retain comment for potential future proportional calculations
  const sliceHeightSource = pageHeightPt / scale // height in source image pixels per PDF page

  const pdfDoc = await PDFDocument.create()
  sliceCanvas.width = img.width

  for (
    let y = 0, pageIndex = 0;
    y < img.height && pageIndex < 50;
    y += sliceHeightSource, pageIndex++
  ) {
    const remaining = img.height - y
    const currentSliceHeight = Math.min(sliceHeightSource, remaining)
    sliceCanvas.height = currentSliceHeight
    ctx.clearRect(0, 0, sliceCanvas.width, sliceCanvas.height)
    ctx.drawImage(
      img,
      0,
      y,
      img.width,
      currentSliceHeight,
      0,
      0,
      img.width,
      currentSliceHeight
    )
    const sliceDataUrl = sliceCanvas.toDataURL('image/png')
    const pngBytes = sliceDataUrl.split(',')[1]
    const pngBuffer = Uint8Array.from(window.atob(pngBytes), c =>
      c.charCodeAt(0)
    )
    const pngImage = await pdfDoc.embedPng(pngBuffer)
    const page = pdfDoc.addPage([pageWidthPt, pageHeightPt])
    const sliceScaledHeight = pngImage.height * scale
    page.drawImage(pngImage, {
      x: 0,
      y: pageHeightPt - sliceScaledHeight,
      width: pageWidthPt,
      height: sliceScaledHeight,
    })
  }

  const pdfBytes = await pdfDoc.save()
  return new Blob([pdfBytes], { type: 'application/pdf' })
}

/**
 * Build a tabular jobs PDF (replacement for jsPDF + autotable)
 * @param {Array<string>} headers
 * @param {Array<Array<string>>} rows
 * @param {object} meta { title, infoLines }
 * @returns {Promise<Blob>}
 */
export async function jobsTablePDF(headers, rows, meta = {}) {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const pageWidth = 595.28
  const pageHeight = 841.89
  let page = pdfDoc.addPage([pageWidth, pageHeight])
  let y = pageHeight - 40

  const fontSizeTitle = 20
  if (meta.title) {
    page.drawText(meta.title, { x: 40, y, size: fontSizeTitle, font: boldFont })
    y -= fontSizeTitle + 10
  }
  if (Array.isArray(meta.infoLines)) {
    meta.infoLines.forEach(line => {
      page.drawText(line, { x: 40, y, size: 10, font })
      y -= 12
    })
    y -= 4
  }

  const colCount = headers.length
  const colWidth = (pageWidth - 80) / colCount
  const rowHeight = 14
  const headerBg = rgb(0.15, 0.18, 0.25)
  const headerColor = rgb(1, 1, 1)
  const textColor = rgb(0, 0, 0)

  // Draw header
  headers.forEach((h, i) => {
    const x = 40 + i * colWidth
    page.drawRectangle({
      x,
      y: y - rowHeight + 2,
      width: colWidth,
      height: rowHeight,
      color: headerBg,
    })
    page.drawText(truncate(h, colWidth, 10, boldFont), {
      x: x + 2,
      y: y - rowHeight + 6,
      size: 10,
      font: boldFont,
      color: headerColor,
    })
  })
  y -= rowHeight + 6

  for (const r of rows) {
    if (y < 60) {
      page = pdfDoc.addPage([pageWidth, pageHeight])
      y = pageHeight - 60
      // repeat header on new page
      headers.forEach((h, i) => {
        const x = 40 + i * colWidth
        page.drawRectangle({
          x,
          y: y - rowHeight + 2,
          width: colWidth,
          height: rowHeight,
          color: headerBg,
        })
        page.drawText(truncate(h, colWidth, 10, boldFont), {
          x: x + 2,
          y: y - rowHeight + 6,
          size: 10,
          font: boldFont,
          color: headerColor,
        })
      })
      y -= rowHeight + 6
    }
    r.forEach((cell, i) => {
      const x = 40 + i * colWidth
      page.drawText(truncate(String(cell), colWidth, 9, font), {
        x: x + 2,
        y: y - rowHeight + 4,
        size: 9,
        font,
        color: textColor,
      })
    })
    y -= rowHeight
  }

  const pdfBytes = await pdfDoc.save()
  return new Blob([pdfBytes], { type: 'application/pdf' })
}

function truncate(text, maxWidth, size, font) {
  const ellipsis = '…'
  let current = text
  while (font.widthOfTextAtSize(current, size) > maxWidth - 6) {
    if (current.length <= 1) {
      break
    }
    current = current.slice(0, -2) + ellipsis
  }
  return current
}

/**
 * Save blob to file (browser & Electron renderer)
 */
export function saveBlob(blob, filename) {
  if (typeof window !== 'undefined' && window.URL && window.document) {
    const a = document.createElement('a')
    const url = URL.createObjectURL(blob)
    a.href = url
    a.download = filename
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 3000)
  }
}
