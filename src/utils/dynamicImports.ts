/**
 * Dynamic Import Utilities
 * Lazy load heavy dependencies to improve initial bundle size
 */

// PDF utilities - lazy loaded
export const loadPDFLib = async () => {
  const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
  return { PDFDocument, rgb, StandardFonts };
};

export const loadPDFJS = async () => {
  const pdfjs = await import('pdfjs-dist');
  return pdfjs;
};

// Excel export - lazy loaded
export const loadExcelExport = async () => {
  const writeXlsxFile = (await import('write-excel-file')).default;
  return writeXlsxFile;
};

// QR Code generation - lazy loaded
export const loadQRCode = async () => {
  const QRCode = (await import('qrcode')).default;
  return QRCode;
};

// HTML to Canvas - lazy loaded
export const loadHtml2Canvas = async () => {
  const html2canvas = (await import('html2canvas')).default;
  return html2canvas;
};

// ZIP utilities - lazy loaded
export const loadJSZip = async () => {
  const JSZip = (await import('jszip')).default;
  return JSZip;
};

// Chart.js - lazy loaded
export const loadChartJS = async () => {
  const {
    Chart,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
  } = await import('chart.js');

  // Register components only when needed
  Chart.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

  return Chart;
};

// Cytoscape - lazy loaded
export const loadCytoscape = async () => {
  const cytoscape = (await import('cytoscape')).default;
  return cytoscape;
};

// Syntax highlighting - lazy loaded
export const loadHighlightJS = async () => {
  const hljs = (await import('highlight.js')).default;
  return hljs;
};

// Natural Language Processing - lazy loaded
export const loadNLP = async () => {
  // Use compromise instead of natural for lighter weight
  const nlp = (await import('compromise')).default;
  return nlp;
};

// Markdown parsing - lazy loaded with lighter alternative
export const loadMarkdownParser = async () => {
  // Consider replacing marked with a lighter alternative in the future
  const marked = (await import('marked')).marked;
  return marked;
};

// Utility to preload critical dependencies
export const preloadCriticalDeps = async () => {
  // Preload only the most frequently used dependencies
  const promises = [
    // These are likely to be used soon after app load
    loadMarkdownParser(),
  ];

  try {
    await Promise.allSettled(promises);
    console.log('✅ Critical dependencies preloaded');
  } catch (error) {
    console.warn('⚠️ Some critical dependencies failed to preload:', error);
  }
};

// Utility to check if a dependency is already loaded
export const isDependencyLoaded = (depName: string): boolean => {
  // Simple check - could be enhanced with more sophisticated tracking
  return document.querySelector(`script[src*="${depName}"]`) !== null;
};

// Progressive enhancement helper
export const enhanceWithFeature = async <T>(
  loader: () => Promise<T>,
  fallback: () => void,
  onSuccess: (module: T) => void
) => {
  try {
    const module = await loader();
    onSuccess(module);
  } catch (error) {
    console.warn('Failed to load enhancement, falling back:', error);
    fallback();
  }
};