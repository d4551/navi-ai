// UnifiedIcons.js - Centralized icon system with MUI and Bootstrap support
import { h } from 'vue'

// Icon component factory for MUI icons
const createMUIcon = (iconName, defaultClass = '') => ({
  name: `MUI${iconName}`,
  props: {
    className: { type: String, default: defaultClass },
    size: { type: String, default: 'sm' }
  },
  render() {
    return h('i', {
      class: ['mdi', `mdi-${iconName.toLowerCase().replace(/icon$/, '')}`, `icon-${this.size}`, this.className],
      'aria-hidden': 'true'
    })
  }
})

// Icon component factory for Bootstrap icons
const createBSIcon = (iconName, defaultClass = '') => ({
  name: `BS${iconName}`,
  props: {
    className: { type: String, default: defaultClass },
    size: { type: String, default: 'sm' }
  },
  render() {
    return h('i', {
      class: ['bi', `bi-${iconName.toLowerCase().replace(/icon$/, '')}`, `icon-${this.size}`, this.className],
      'aria-hidden': 'true'
    })
  }
})

// Universal icon component that can use either MUI or Bootstrap
const createUniversalIcon = (muiName, bsName, defaultClass = '') => ({
  name: muiName.replace('Icon', ''),
  props: {
    className: { type: String, default: defaultClass },
    size: { type: String, default: 'sm' },
    library: { type: String, default: 'mui' } // 'mui' or 'bootstrap'
  },
  render() {
    const iconName = this.library === 'bootstrap' ? bsName : muiName
    const prefix = this.library === 'bootstrap' ? 'bi' : 'mdi'
    const formattedName = this.library === 'bootstrap'
      ? iconName.toLowerCase().replace(/icon$/, '')
      : iconName.toLowerCase().replace(/icon$/, '')

    return h('i', {
      class: [prefix, `${prefix}-${formattedName}`, `icon-${this.size}`, this.className],
      'aria-hidden': 'true'
    })
  }
})

// Export MUI icon components
export const PersonIcon = createMUIcon('Account')
export const StarsIcon = createMUIcon('StarFourPoints')
export const BadgeIcon = createMUIcon('Certificate')
export const SaveIcon = createMUIcon('ContentSave')
export const KeyIcon = createMUIcon('Key')
export const VisibilityIcon = createMUIcon('Eye')
export const VisibilityOffIcon = createMUIcon('EyeOff')
export const SoundwaveIcon = createMUIcon('Waveform')
export const MicIcon = createMUIcon('Microphone')
export const RefreshIcon = createMUIcon('Refresh')
export const SlashIcon = createMUIcon('Cancel')
export const CpuIcon = createMUIcon('Chip')
export const PlugIcon = createMUIcon('PowerPlug')
export const CheckIcon = createMUIcon('Check')
export const CloseIcon = createMUIcon('Close')
export const SettingsIcon = createMUIcon('Cog')
export const GameIcon = createMUIcon('GamepadVariant')
export const LightbulbIcon = createMUIcon('Lightbulb')
export const DatabaseIcon = createMUIcon('Database')
export const BarChartIcon = createMUIcon('ChartBar')
export const DownloadIcon = createMUIcon('Download')
export const UploadIcon = createMUIcon('Upload')
export const DeleteIcon = createMUIcon('Delete')
export const WarningIcon = createMUIcon('Alert')
export const CheckCircleIcon = createMUIcon('CheckCircle')
export const GithubIcon = createMUIcon('Github')
export const BulletListIcon = createMUIcon('FormatListBulleted')
export const InfoIcon = createMUIcon('Info')
export const BotIcon = createMUIcon('Robot')
export const BriefcaseIcon = createMUIcon('Briefcase')
export const MessageSquareIcon = createMUIcon('MessageText')
export const FileTextIcon = createMUIcon('FileDocument')
export const CalendarIcon = createMUIcon('Calendar')
export const ActivityIcon = createMUIcon('Activity')
export const ClockIcon = createMUIcon('Clock')
export const ChevronLeftIcon = createMUIcon('ChevronLeft')
export const ChevronRightIcon = createMUIcon('ChevronRight')
export const CircleIcon = createMUIcon('Circle')
export const CogIcon = createMUIcon('Cog')
export const AzureIcon = createMUIcon('MicrosoftAzure')
export const EyeIcon = createMUIcon('Eye')
export const EyeSlashIcon = createMUIcon('EyeOff')
export const TrashIcon = createMUIcon('Delete')
export const RotateCcwIcon = createMUIcon('RotateLeft')
export const LinkedinIcon = createMUIcon('Linkedin')
export const ExternalLinkIcon = createMUIcon('OpenInNew')
export const BookIcon = createMUIcon('Book')
export const MessageCircleIcon = createMUIcon('MessageText')
export const AlertTriangleIcon = createMUIcon('Alert')
export const MailIcon = createMUIcon('Email')
export const HeartIcon = createMUIcon('Heart')
export const CodeTagsIcon = createMUIcon('CodeTags')
export const PulseIcon = createMUIcon('Pulse')
export const GraduationCapIcon = createMUIcon('SchoolOutline')

// Export Bootstrap icon components
export const BSPersonIcon = createBSIcon('person')
export const BSStarsIcon = createBSIcon('stars')
export const BSBadgeIcon = createBSIcon('badge')
export const BSSaveIcon = createBSIcon('save')
export const BSKeyIcon = createBSIcon('key')
export const BSVisibilityIcon = createBSIcon('eye')
export const BSVisibilityOffIcon = createBSIcon('eye-slash')
export const BSSoundwaveIcon = createBSIcon('soundwave')
export const BSMicIcon = createBSIcon('mic')
export const BSRefreshIcon = createBSIcon('arrow-clockwise')
export const BSSlashIcon = createBSIcon('slash-circle')
export const BSCpuIcon = createBSIcon('cpu')
export const BSPlugIcon = createBSIcon('plug')
export const BSCheckIcon = createBSIcon('check')
export const BSCloseIcon = createBSIcon('x')
export const BSSettingsIcon = createBSIcon('gear')
export const BSGameIcon = createBSIcon('controller')
export const BSLightbulbIcon = createBSIcon('lightbulb')
export const BSDatabaseIcon = createBSIcon('database')
export const BSBarChartIcon = createBSIcon('bar-chart')
export const BSDownloadIcon = createBSIcon('download')
export const BSUploadIcon = createBSIcon('upload')
export const BSDeleteIcon = createBSIcon('trash')
export const BSWarningIcon = createBSIcon('exclamation-triangle')
export const BSCheckCircleIcon = createBSIcon('check-circle')
export const BSGithubIcon = createBSIcon('github')
export const BSBulletListIcon = createBSIcon('list-ul')
export const BSInfoIcon = createBSIcon('info-circle')
export const BSBotIcon = createBSIcon('robot')
export const BSBriefcaseIcon = createBSIcon('briefcase')
export const BSMessageSquareIcon = createBSIcon('chat-square')
export const BSFileTextIcon = createBSIcon('file-text')
export const BSCalendarIcon = createBSIcon('calendar')
export const BSActivityIcon = createBSIcon('activity')
export const BSClockIcon = createBSIcon('clock')
export const BSChevronLeftIcon = createBSIcon('chevron-left')
export const BSChevronRightIcon = createBSIcon('chevron-right')
export const BSCircleIcon = createBSIcon('circle')
export const BSCogIcon = createBSIcon('gear')
export const BSAzureIcon = createBSIcon('cloud')
export const BSEyeIcon = createBSIcon('eye')
export const BSEyeSlashIcon = createBSIcon('eye-slash')
export const BSTrashIcon = createBSIcon('trash')
export const BSRotateCcwIcon = createBSIcon('arrow-counterclockwise')
export const BSLinkedinIcon = createBSIcon('linkedin')
export const BSExternalLinkIcon = createBSIcon('box-arrow-up-right')
export const BSBookIcon = createBSIcon('book')
export const BSMessageCircleIcon = createBSIcon('chat')
export const BSAlertTriangleIcon = createBSIcon('exclamation-triangle')
export const BSMailIcon = createBSIcon('envelope')
export const BSHeartIcon = createBSIcon('heart')
export const BSCodeTagsIcon = createBSIcon('code-slash')
export const BSPulseIcon = createBSIcon('graph-up')
export const BSGraduationCapIcon = createBSIcon('mortarboard')

// Universal icons (can switch between libraries)
export const PersonIconComponent = createUniversalIcon('Account', 'person')
export const StarsIconComponent = createUniversalIcon('StarFourPoints', 'stars')
export const BadgeIconComponent = createUniversalIcon('Certificate', 'badge')
export const SaveIconComponent = createUniversalIcon('ContentSave', 'save')
export const KeyIconComponent = createUniversalIcon('Key', 'key')
export const VisibilityIconComponent = createUniversalIcon('Eye', 'eye')
export const VisibilityOffIconComponent = createUniversalIcon('EyeOff', 'eye-slash')
export const SoundwaveIconComponent = createUniversalIcon('Waveform', 'soundwave')
export const MicIconComponent = createUniversalIcon('Microphone', 'mic')
export const RefreshIconComponent = createUniversalIcon('Refresh', 'arrow-clockwise')
export const SlashIconComponent = createUniversalIcon('Cancel', 'slash-circle')
export const CpuIconComponent = createUniversalIcon('Chip', 'cpu')
export const PlugIconComponent = createUniversalIcon('PowerPlug', 'plug')
export const CheckIconComponent = createUniversalIcon('Check', 'check')
export const CloseIconComponent = createUniversalIcon('Close', 'x')
export const SettingsIconComponent = createUniversalIcon('Cog', 'gear')
export const GameIconComponent = createUniversalIcon('GamepadVariant', 'controller')
export const LightbulbIconComponent = createUniversalIcon('Lightbulb', 'lightbulb')
export const DatabaseIconComponent = createUniversalIcon('Database', 'database')
export const BarChartIconComponent = createUniversalIcon('ChartBar', 'bar-chart')
export const DownloadIconComponent = createUniversalIcon('Download', 'download')
export const UploadIconComponent = createUniversalIcon('Upload', 'upload')
export const DeleteIconComponent = createUniversalIcon('Delete', 'trash')
export const WarningIconComponent = createUniversalIcon('Alert', 'exclamation-triangle')
export const CheckCircleIconComponent = createUniversalIcon('CheckCircle', 'check-circle')
export const GithubIconComponent = createUniversalIcon('Github', 'github')
export const BulletListIconComponent = createUniversalIcon('FormatListBulleted', 'list-ul')
export const InfoIconComponent = createUniversalIcon('Info', 'info-circle')
export const BotIconComponent = createUniversalIcon('Robot', 'robot')
export const BriefcaseIconComponent = createUniversalIcon('Briefcase', 'briefcase')
export const MessageSquareIconComponent = createUniversalIcon('MessageText', 'chat-square')
export const FileTextIconComponent = createUniversalIcon('FileDocument', 'file-text')
export const CalendarIconComponent = createUniversalIcon('Calendar', 'calendar')
export const ActivityIconComponent = createUniversalIcon('Activity', 'activity')
export const ClockIconComponent = createUniversalIcon('Clock', 'clock')
export const ChevronLeftIconComponent = createUniversalIcon('ChevronLeft', 'chevron-left')
export const ChevronRightIconComponent = createUniversalIcon('ChevronRight', 'chevron-right')
export const CircleIconComponent = createUniversalIcon('Circle', 'circle')
export const CogIconComponent = createUniversalIcon('Cog', 'gear')
export const AzureIconComponent = createUniversalIcon('MicrosoftAzure', 'cloud')
export const EyeIconComponent = createUniversalIcon('Eye', 'eye')
export const EyeSlashIconComponent = createUniversalIcon('EyeOff', 'eye-slash')
export const TrashIconComponent = createUniversalIcon('Delete', 'trash')
export const RotateCcwIconComponent = createUniversalIcon('RotateLeft', 'arrow-counterclockwise')
export const LinkedinIconComponent = createUniversalIcon('Linkedin', 'linkedin')
export const ExternalLinkIconComponent = createUniversalIcon('OpenInNew', 'box-arrow-up-right')
export const BookIconComponent = createUniversalIcon('Book', 'book')
export const MessageCircleIconComponent = createUniversalIcon('MessageText', 'chat')
export const AlertTriangleIconComponent = createUniversalIcon('Alert', 'exclamation-triangle')
export const MailIconComponent = createUniversalIcon('Email', 'envelope')
export const HeartIconComponent = createUniversalIcon('Heart', 'heart')
export const CodeTagsIconComponent = createUniversalIcon('CodeTags', 'code-slash')
export const PulseIconComponent = createUniversalIcon('Pulse', 'graph-up')
export const GraduationCapIconComponent = createUniversalIcon('SchoolOutline', 'mortarboard')
