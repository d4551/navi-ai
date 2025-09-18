import { ref } from 'vue'
import { useToast } from '@/composables/useToast'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

export function useHomePageFeatures() {
  const templatesModal = ref(false)
  const analysisModal = ref(false)
  const designModal = ref(false)
  const portfolioModal = ref(false)
  const businessCardModal = ref(false)

  const analysisContent = ref('')
  const designContent = ref('')

  const openTemplates = () => {
    templatesModal.value = true
  }

  const processFileContent = (content: string) => {
    const toast = useToast()
    try {
      JSON.parse(content)
      toast.success('File imported')
    } catch {
      toast.error('Invalid file format')
    }
  }

  const showAnalysis = (text: string) => {
    analysisContent.value = text
    analysisModal.value = true
  }

  const improveDesign = () => {
    designContent.value = 'Consider using consistent spacing and typography.'
    designModal.value = true
  }

  const openPortfolio = () => {
    portfolioModal.value = true
  }

  const openBusinessCard = () => {
    businessCardModal.value = true
  }

  const exportAll = async () => {
    const zip = new JSZip()
    zip.file('readme.txt', 'Bulk export placeholder')
    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, 'presentations.zip')
  }

  return {
    templatesModal,
    analysisModal,
    designModal,
    portfolioModal,
    businessCardModal,
    analysisContent,
    designContent,
    openTemplates,
    processFileContent,
    showAnalysis,
    improveDesign,
    openPortfolio,
    openBusinessCard,
    exportAll,
  }
}
