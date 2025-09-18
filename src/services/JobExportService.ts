/**
 * JobExportService (Refactored minimal version, no jsPDF)
 */
import type { Job } from '@/shared/types/jobs'
import * as XLSX from 'xlsx'
import { jobsTablePDF, saveBlob } from '@/utils/pdfExport'

export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json' | 'ics'
export interface ExportOptions {
  format: ExportFormat
  filename?: string
  includeFilters?: boolean
  includeMatchScores?: boolean
  includeCompanyInfo?: boolean
  maxJobs?: number
  customFields?: string[]
}
export interface ExportData {
  jobs: Job[]
  filters?: Record<string, any>
  exportDate: string
  totalJobs: number
}

export class JobExportService {
  async exportJobs(data: ExportData, opts: ExportOptions) {
    const name = opts.filename || this.fileName(opts.format)
    if (opts.format === 'csv') return this.toCSV(data, name, opts)
    if (opts.format === 'excel') return this.toExcel(data, name, opts)
    if (opts.format === 'pdf') return this.toPDF(data, name, opts)
    if (opts.format === 'json') return this.toJSON(data, name, opts)
    if (opts.format === 'ics') return this.toICS(data, name, opts)
  }

  private toCSV(data: ExportData, filename: string, o: ExportOptions) {
    const headers = this.headers(o)
    const rows = data.jobs.slice(0, o.maxJobs).map(j => this.row(j, o))
    if (o.includeFilters && data.filters) {
      const fi = this.filtersCSV(data.filters)
      rows.unshift([`Applied Filters: ${fi}`])
      rows.unshift([`Total Jobs: ${data.totalJobs}`])
      rows.unshift([`Export Date: ${data.exportDate}`])
    }
    const csv = [headers, ...rows]
      .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    this.download(csv, filename, 'text/csv')
  }

  private toExcel(data: ExportData, filename: string, o: ExportOptions) {
    const wb = XLSX.utils.book_new()
    const headers = this.headers(o)
    const rows = data.jobs.slice(0, o.maxJobs).map(j => this.row(j, o))
    const sheetData: string[][] = [headers, ...rows]
    const sheet = XLSX.utils.aoa_to_sheet(sheetData)
    sheet['!cols'] = headers.map((_, i) => {
      const col = sheetData.map(r => r[i] || '')
      const max = Math.max(...col.map(c => String(c).length))
      return { wch: Math.min(max + 2, 50) }
    })
    XLSX.utils.book_append_sheet(wb, sheet, 'Jobs')
    XLSX.writeFile(wb, filename)
  }

  private async toPDF(data: ExportData, filename: string, o: ExportOptions) {
    const rows: string[][] = data.jobs
      .slice(0, o.maxJobs || 20)
      .map(j => [
        String(j.title || ''),
        String(j.company || ''),
        String((j.location || '') + (j.remote ? ' (Remote)' : '')),
        String(this.salary(j.salary)),
        String(j.experienceLevel || ''),
        ...(o.includeMatchScores
          ? [String(j.matchScore != null ? `${j.matchScore}%` : 'N/A')]
          : []),
      ])
    const headers = [
      'Job Title',
      'Company',
      'Location',
      'Salary',
      'Experience',
      ...(o.includeMatchScores ? ['Match'] : []),
    ]
    const info = [
      `Export Date: ${data.exportDate}`,
      `Total Jobs: ${data.totalJobs}`,
    ]
    if (o.includeFilters && data.filters)
      info.push('Filters: ' + this.filtersPDF(data.filters))
    const blob = await jobsTablePDF(headers, rows, {
      title: 'Gaming Job Opportunities',
      infoLines: info,
    })
    saveBlob(blob, filename.endsWith('.pdf') ? filename : filename + '.pdf')
  }

  private toJSON(data: ExportData, filename: string, o: ExportOptions) {
    const payload = {
      metadata: {
        exportDate: data.exportDate,
        totalJobs: data.totalJobs,
        exportedJobs: Math.min(data.jobs.length, o.maxJobs || data.jobs.length),
      },
      filters: o.includeFilters ? data.filters : undefined,
      jobs: data.jobs
        .slice(0, o.maxJobs)
        .map(j => ({
          id: j.id,
          title: j.title,
          company: j.company,
          location: j.location,
          remote: j.remote,
          salary: j.salary,
          experienceLevel: j.experienceLevel,
          type: j.type,
          postedDate: j.postedDate,
          matchScore: o.includeMatchScores ? j.matchScore : undefined,
        })),
    }
    this.download(
      JSON.stringify(payload, null, 2),
      filename,
      'application/json'
    )
  }

  private toICS(data: ExportData, filename: string, o: ExportOptions) {
    const events = data.jobs
      .slice(0, o.maxJobs)
      .map(j => this.event(j, this.deadline(j.postedDate)))
      .join('')
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//JobExport//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      events,
      'END:VCALENDAR',
    ].join('\r\n')
    this.download(ics, filename, 'text/calendar')
  }

  private headers(o: ExportOptions) {
    const h = [
      'Job Title',
      'Company',
      'Location',
      'Remote',
      'Salary Range',
      'Experience Level',
      'Job Type',
      'Posted Date',
      'Technologies',
      'Key Requirements',
    ]
    if (o.includeMatchScores) h.push('Match Score')
    if (o.includeCompanyInfo) h.push('Company Size', 'Studio Type')
    if (o.customFields) h.push(...o.customFields)
    return h
  }
  private row(j: Job, o: ExportOptions): string[] {
    const r: string[] = [
      String(j.title || ''),
      String(j.company || ''),
      String(j.location || ''),
      j.remote ? 'Yes' : 'No',
      String(this.salary(j.salary)),
      String(j.experienceLevel || ''),
      String(j.type || ''),
      new Date(j.postedDate as any).toLocaleDateString(),
      String((j.technologies || []).join(', ')),
      String((j as any).requirements?.slice?.(0, 3).join?.('; ') || ''),
    ]
    if (o.includeMatchScores)
      r.push(j.matchScore != null ? `${j.matchScore}%` : 'N/A')
    if (o.includeCompanyInfo) {
      r.push(
        String((j as any).companySize || 'Unknown'),
        String((j as any).studioType || 'Unknown')
      )
    }
    return r
  }
  private salary(s: any) {
    if (!s) return 'Not specified'
    if (typeof s === 'string') return s
    if (s.min && s.max)
      return `$${s.min.toLocaleString()} - $${s.max.toLocaleString()}`
    return 'Not specified'
  }
  private filtersCSV(f: Record<string, any>) {
    const p: string[] = []
    for (const [k, v] of Object.entries(f))
      if (v && (Array.isArray(v) ? v.length : true))
        p.push(`${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
    return p.join(' | ')
  }
  private filtersPDF(f: Record<string, any>) {
    const p: string[] = []
    for (const [k, v] of Object.entries(f))
      if (v && (Array.isArray(v) ? v.length : true))
        p.push(`${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
    return p.join('\n')
  }
  private deadline(posted: string | Date) {
    const d = new Date(posted)
    d.setDate(d.getDate() + 30)
    return d
  }
  private event(j: Job, d: Date) {
    const fmt = (x: Date) =>
      x.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const now = new Date()
    return [
      'BEGIN:VEVENT',
      `UID:job-${j.id}@jobs`,
      `DTSTAMP:${fmt(now)}`,
      `DTSTART:${fmt(d)}`,
      `DTEND:${fmt(new Date(d.getTime() + 3600000))}`,
      `SUMMARY:Apply to ${j.title} at ${j.company}`,
      `DESCRIPTION:Deadline for ${j.title} at ${j.company}. Location: ${j.location}${j.remote ? ' (Remote)' : ''}`,
      `LOCATION:${j.location}`,
      'END:VEVENT',
      '',
    ].join('\r\n')
  }
  private fileName(fmt: ExportFormat) {
    const date = new Date().toISOString().split('T')[0]
    const ext: Record<ExportFormat, string> = {
      csv: 'csv',
      excel: 'xlsx',
      pdf: 'pdf',
      json: 'json',
      ics: 'ics',
    }
    return `gaming-jobs-export-${date}.${ext[fmt]}`
  }
  private download(content: string, filename: string, mime: string) {
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

export const jobExportService = new JobExportService()
