declare module '@/utils/pdfExport' {
	export function pdfFromTallImage(_dataUrl: string, _options?: { pageWidthPt?: number; pageHeightPt?: number }): Promise<Blob>;
	export function jobsTablePDF(_headers: string[], _rows: string[][], _meta?: { title?: string; infoLines?: string[] }): Promise<Blob>;
	export function saveBlob(_blob: Blob, _filename: string): void;
}
