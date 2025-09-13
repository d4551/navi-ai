// Lightweight PDF generation helpers using pdf-lib (no eval / CSP safe)
// Focus: text content, simple tables, image embedding from canvas
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";


  // Create offscreen canvas to slice image for true pagination
  if (typeof Image === "undefined") {
    throw new Error("Image API not available in this environment");
  }
  const img = new Image();
  img.src = dataUrl;
  await new Promise((res, rej) => {
    img.onload = res;
    img.onerror = rej;
  });
  const sliceCanvas = document.createElement("canvas");

  // Scale to page width; height will vary
  const scale = pageWidthPt / img.width;
  const sliceHeightSource = pageHeightPt / scale; // height in source image pixels per PDF page

  const pdfDoc = await PDFDocument.create();
  sliceCanvas.width = img.width;

  for (
    y += sliceHeightSource, pageIndex++
  ) {
    const remaining = img.height - y;
    const currentSliceHeight = Math.min(sliceHeightSource, remaining);
    sliceCanvas.height = currentSliceHeight;
    ctx.drawImage(
      img,
      y,
      img.width,
      currentSliceHeight,
      img.width,
      currentSliceHeight,
    );
    const sliceDataUrl = sliceCanvas.toDataURL("image/png");
    );
    const pngImage = await pdfDoc.embedPng(pngBuffer);
    const page = pdfDoc.addPage([pageWidthPt, pageHeightPt]);
    page.drawImage(pngImage, {
      y: pageHeightPt - sliceScaledHeight,
      width: pageWidthPt,
      height: sliceScaledHeight,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: "application/pdf" });
}

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  let page = pdfDoc.addPage([pageWidth, pageHeight]);

  if (meta.title) {
    page.drawText(meta.title, {
      y,
      size: fontSizeTitle,
      font: boldFont,
    });
  }
  if (Array.isArray(meta.infoLines)) {
    meta.infoLines.forEach((line) => {
    });
  }

  const colCount = headers.length;

  // Draw header
  headers.forEach((h, i) => {
    page.drawRectangle({
      x,
      width: colWidth,
      height: rowHeight,
      color: headerBg,
    });
      font: boldFont,
      color: headerColor,
    });
  });

  for (const r of rows) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      // repeat header on new page
      headers.forEach((h, i) => {
        page.drawRectangle({
          x,
          width: colWidth,
          height: rowHeight,
          color: headerBg,
        });
          font: boldFont,
          color: headerColor,
        });
      });
    }
    r.forEach((cell, i) => {
        font,
        color: textColor,
      });
    });
    y -= rowHeight;
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: "application/pdf" });
}

  const ellipsis = "…";
  let current = text;
      break;
    }
  }
  return current;
}

  if (typeof window !== "undefined" && window.URL && window.document) {
    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    a.click();
  }
}
