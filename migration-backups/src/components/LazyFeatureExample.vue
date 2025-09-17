<template>
  <div class="lazy-feature-example">
    <!-- PDF Export Feature -->
    <div class="feature-section">
      <h3>PDF Export</h3>
      <UnifiedButton
        :loading="pdfLoading"
        :disabled="pdfLoading"
        @click="exportToPDF"
      >
        {{ pdfLoading ? 'Loading PDF Library...' : 'Export to PDF' }}
      </UnifiedButton>
    </div>

    <!-- Chart Feature -->
    <div class="feature-section">
      <h3>Charts</h3>
      <UnifiedButton
        :loading="chartLoading"
        :disabled="chartLoading"
        @click="showChart"
      >
        {{ chartLoading ? 'Loading Chart Library...' : 'Show Chart' }}
      </UnifiedButton>
      <canvas
        v-if="chartReady"
        ref="chartCanvas"
        width="400"
        height="200"
      ></canvas>
    </div>

    <!-- QR Code Feature -->
    <div class="feature-section">
      <h3>QR Code</h3>
      <UnifiedButton
        :loading="qrLoading"
        :disabled="qrLoading"
        @click="generateQR"
      >
        {{ qrLoading ? 'Loading QR Library...' : 'Generate QR Code' }}
      </UnifiedButton>
      <div v-if="qrCode" class="qr-container">
        <img :src="qrCode" alt="QR Code" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import {
  loadPDFLib,
  loadChartJS,
  loadQRCode,
  enhanceWithFeature,
} from '@/utils/dynamicImports'

// Loading states
const pdfLoading = ref(false)
const chartLoading = ref(false)
const qrLoading = ref(false)

// Feature states
const chartReady = ref(false)
const qrCode = ref<string | null>(null)
const chartCanvas = ref<HTMLCanvasElement | null>(null)

// PDF Export with dynamic loading
const exportToPDF = async () => {
  pdfLoading.value = true

  await enhanceWithFeature(
    loadPDFLib,
    () => {
      // Fallback: show message that PDF export is not available
      alert('PDF export feature is not available. Please try again later.')
    },
    async ({ PDFDocument, rgb, StandardFonts }) => {
      try {
        // Create a simple PDF
        const pdfDoc = await PDFDocument.create()
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)

        const page = pdfDoc.addPage()
        const { width, height } = page.getSize()

        page.drawText('Hello from NAVI AI!', {
          x: 50,
          y: height - 4 * 30,
          size: 30,
          font: timesRomanFont,
          color: rgb(0, 0.53, 0.71),
        })

        page.drawText('This PDF was generated using dynamic imports!', {
          x: 50,
          y: height - 6 * 30,
          size: 16,
          font: timesRomanFont,
          color: rgb(0, 0, 0),
        })

        const pdfBytes = await pdfDoc.save()

        // Download the PDF
        const blob = new Blob([pdfBytes], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'navi-export.pdf'
        a.click()
        URL.revokeObjectURL(url)

        console.log('✅ PDF exported successfully')
      } catch (error) {
        console.error('❌ PDF export failed:', error)
        alert('Failed to export PDF. Please try again.')
      }
    }
  )

  pdfLoading.value = false
}

// Chart with dynamic loading
const showChart = async () => {
  chartLoading.value = true

  await enhanceWithFeature(
    loadChartJS,
    () => {
      // Fallback: show static chart or message
      alert('Chart feature is not available. Please try again later.')
    },
    Chart => {
      try {
        chartReady.value = true

        // Wait for canvas to be available
        setTimeout(() => {
          if (chartCanvas.value) {
            const ctx = chartCanvas.value.getContext('2d')
            if (ctx) {
              new Chart(ctx, {
                type: 'line',
                data: {
                  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                  datasets: [
                    {
                      label: 'Job Applications',
                      data: [12, 19, 3, 5, 2, 3],
                      borderColor: 'rgb(75, 192, 192)',
                      tension: 0.1,
                    },
                  ],
                },
                options: {
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                },
              })
            }
          }
        }, 100)

        console.log('✅ Chart created successfully')
      } catch (error) {
        console.error('❌ Chart creation failed:', error)
        alert('Failed to create chart. Please try again.')
      }
    }
  )

  chartLoading.value = false
}

// QR Code with dynamic loading
const generateQR = async () => {
  qrLoading.value = true

  await enhanceWithFeature(
    loadQRCode,
    () => {
      // Fallback: show text or link instead of QR code
      alert('QR code feature is not available. Please try again later.')
    },
    async QRCode => {
      try {
        const qrDataURL = await QRCode.toDataURL(
          'https://navi-ai.example.com',
          {
            width: 200,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
          }
        )

        qrCode.value = qrDataURL
        console.log('✅ QR code generated successfully')
      } catch (error) {
        console.error('❌ QR code generation failed:', error)
        alert('Failed to generate QR code. Please try again.')
      }
    }
  )

  qrLoading.value = false
}
</script>

<style scoped>
.lazy-feature-example {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.feature-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  background: #f8f9fa;
}

.feature-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.qr-container {
  margin-top: 15px;
  text-align: center;
}

.qr-container img {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  background: white;
}

canvas {
  margin-top: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
