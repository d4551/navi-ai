// UnifiedIcons.js - Centralized icon system with MUI and Heroicons support
import { h } from 'vue'
import {
  UserIcon as HeroUserIcon,
  StarIcon as HeroStarIcon,
  ShieldCheckIcon as HeroShieldCheckIcon,
  ArchiveBoxIcon as HeroArchiveBoxIcon,
  KeyIcon as HeroKeyIcon,
  EyeIcon as HeroEyeIcon,
  EyeSlashIcon as HeroEyeSlashIcon,
  SpeakerWaveIcon as HeroSpeakerWaveIcon,
  MicrophoneIcon as HeroMicrophoneIcon,
  ArrowPathIcon as HeroArrowPathIcon,
  NoSymbolIcon as HeroNoSymbolIcon,
  CpuChipIcon as HeroCpuChipIcon,
  PowerIcon as HeroPlugIcon,
  CheckIcon as HeroCheckIcon,
  XMarkIcon as HeroXMarkIcon,
  CogIcon as HeroCogIcon,
  PuzzlePieceIcon as HeroPuzzlePieceIcon,
  LightBulbIcon as HeroLightBulbIcon,
  CircleStackIcon as HeroCircleStackIcon,
  ChartBarIcon as HeroChartBarIcon,
  ArrowDownTrayIcon as HeroArrowDownTrayIcon,
  ArrowUpTrayIcon as HeroArrowUpTrayIcon,
  TrashIcon as HeroTrashIcon,
  ExclamationTriangleIcon as HeroExclamationTriangleIcon,
  CheckCircleIcon as HeroCheckCircleIcon,
  CodeBracketIcon as HeroCodeBracketIcon,
  ListBulletIcon as HeroListBulletIcon,
  InformationCircleIcon as HeroInformationCircleIcon,
  CommandLineIcon as HeroRobotIcon,
  BriefcaseIcon as HeroBriefcaseIcon,
  ChatBubbleLeftRightIcon as HeroChatBubbleLeftRightIcon,
  DocumentTextIcon as HeroDocumentTextIcon,
  CalendarIcon as HeroCalendarIcon,
  PresentationChartLineIcon as HeroChartLineIcon,
  ClockIcon as HeroClockIcon,
  ChevronLeftIcon as HeroChevronLeftIcon,
  ChevronRightIcon as HeroChevronRightIcon,
  CircleStackIcon as HeroCircleIcon,
  ArrowTopRightOnSquareIcon as HeroArrowTopRightOnSquareIcon,
  BookOpenIcon as HeroBookOpenIcon,
  ChatBubbleLeftIcon as HeroChatBubbleLeftIcon,
  EnvelopeIcon as HeroEnvelopeIcon,
  HeartIcon as HeroHeartIcon,
  AcademicCapIcon as HeroAcademicCapIcon,
} from '@heroicons/vue/24/outline'

// Icon component factory for MUI icons
const createMUIcon = (iconName, defaultClass = '') => ({
  name: `MUI${iconName}`,
  props: {
    className: { type: String, default: defaultClass },
    size: { type: String, default: 'sm' },
  },
  render() {
    return h('i', {
      class: [
        'mdi',
        `mdi-${iconName.toLowerCase().replace(/icon$/, '')}`,
        `icon-${this.size}`,
        this.className,
      ],
      'aria-hidden': 'true',
    })
  },
})

// Icon component factory for Heroicons
const createHeroIcon = (iconComponent, defaultClass = '') => ({
  name: `Hero${iconComponent.name || 'Icon'}`,
  props: {
    className: { type: String, default: defaultClass },
    size: { type: String, default: 'sm' },
  },
  render() {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
      xl: 'h-8 w-8',
    }
    return h(iconComponent, {
      class: [sizeClasses[this.size] || sizeClasses.sm, this.className],
      'aria-hidden': 'true',
    })
  },
})

// Universal icon component that can use either MUI or Heroicons
const createUniversalIcon = (
  muiName,
  heroIconComponent,
  defaultClass = ''
) => ({
  name: muiName.replace('Icon', ''),
  props: {
    className: { type: String, default: defaultClass },
    size: { type: String, default: 'sm' },
    library: { type: String, default: 'mui' }, // 'mui' or 'heroicons'
  },
  render() {
    if (this.library === 'heroicons') {
      const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
        xl: 'h-8 w-8',
      }
      return h(heroIconComponent, {
        class: [sizeClasses[this.size] || sizeClasses.sm, this.className],
        'aria-hidden': 'true',
      })
    } else {
      const formattedName = muiName.toLowerCase().replace(/icon$/, '')
      return h('i', {
        class: [
          'mdi',
          `mdi-${formattedName}`,
          `icon-${this.size}`,
          this.className,
        ],
        'aria-hidden': 'true',
      })
    }
  },
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

// Export Heroicons components
export const HeroPersonWrapped = createHeroIcon(HeroUserIcon)
export const HeroStarsWrapped = createHeroIcon(HeroStarIcon)
export const HeroBadgeWrapped = createHeroIcon(HeroShieldCheckIcon)
export const HeroSaveWrapped = createHeroIcon(HeroArchiveBoxIcon)
export const HeroKeyWrapped = createHeroIcon(HeroKeyIcon)
export const HeroVisibilityWrapped = createHeroIcon(HeroEyeIcon)
export const HeroVisibilityOffWrapped = createHeroIcon(HeroEyeSlashIcon)
export const HeroSoundwaveWrapped = createHeroIcon(HeroSpeakerWaveIcon)
export const HeroMicWrapped = createHeroIcon(HeroMicrophoneIcon)
export const HeroRefreshWrapped = createHeroIcon(HeroArrowPathIcon)
export const HeroSlashWrapped = createHeroIcon(HeroNoSymbolIcon)
export const HeroCpuWrapped = createHeroIcon(HeroCpuChipIcon)
export const HeroPlugWrapped = createHeroIcon(HeroPlugIcon)
export const HeroCheckWrapped = createHeroIcon(HeroCheckIcon)
export const HeroCloseWrapped = createHeroIcon(HeroXMarkIcon)
export const HeroSettingsWrapped = createHeroIcon(HeroCogIcon)
export const HeroGameWrapped = createHeroIcon(HeroPuzzlePieceIcon)
export const HeroLightbulbWrapped = createHeroIcon(HeroLightBulbIcon)
export const HeroDatabaseWrapped = createHeroIcon(HeroCircleStackIcon)
export const HeroBarChartWrapped = createHeroIcon(HeroChartBarIcon)
export const HeroDownloadWrapped = createHeroIcon(HeroArrowDownTrayIcon)
export const HeroUploadWrapped = createHeroIcon(HeroArrowUpTrayIcon)
export const HeroDeleteWrapped = createHeroIcon(HeroTrashIcon)
export const HeroWarningWrapped = createHeroIcon(HeroExclamationTriangleIcon)
export const HeroCheckCircleWrapped = createHeroIcon(HeroCheckCircleIcon)
export const HeroGithubWrapped = createHeroIcon(HeroCodeBracketIcon)
export const HeroBulletListWrapped = createHeroIcon(HeroListBulletIcon)
export const HeroInfoWrapped = createHeroIcon(HeroInformationCircleIcon)
export const HeroBotWrapped = createHeroIcon(HeroRobotIcon)
export const HeroBriefcaseWrapped = createHeroIcon(HeroBriefcaseIcon)
export const HeroMessageSquareWrapped = createHeroIcon(
  HeroChatBubbleLeftRightIcon
)
export const HeroFileTextWrapped = createHeroIcon(HeroDocumentTextIcon)
export const HeroCalendarWrapped = createHeroIcon(HeroCalendarIcon)
export const HeroActivityWrapped = createHeroIcon(HeroChartLineIcon)
export const HeroClockWrapped = createHeroIcon(HeroClockIcon)
export const HeroChevronLeftWrapped = createHeroIcon(HeroChevronLeftIcon)
export const HeroChevronRightWrapped = createHeroIcon(HeroChevronRightIcon)
export const HeroCircleWrapped = createHeroIcon(HeroCircleIcon)
export const HeroCogWrapped = createHeroIcon(HeroCogIcon)
export const HeroEyeWrapped = createHeroIcon(HeroEyeIcon)
export const HeroEyeSlashWrapped = createHeroIcon(HeroEyeSlashIcon)
export const HeroTrashWrapped = createHeroIcon(HeroTrashIcon)
export const HeroRotateCcwWrapped = createHeroIcon(HeroArrowPathIcon)
export const HeroExternalLinkWrapped = createHeroIcon(
  HeroArrowTopRightOnSquareIcon
)
export const HeroBookWrapped = createHeroIcon(HeroBookOpenIcon)
export const HeroMessageCircleWrapped = createHeroIcon(HeroChatBubbleLeftIcon)
export const HeroAlertTriangleWrapped = createHeroIcon(
  HeroExclamationTriangleIcon
)
export const HeroMailWrapped = createHeroIcon(HeroEnvelopeIcon)
export const HeroHeartWrapped = createHeroIcon(HeroHeartIcon)
export const HeroCodeTagsWrapped = createHeroIcon(HeroCodeBracketIcon)
export const HeroPulseWrapped = createHeroIcon(HeroChartLineIcon)
export const HeroGraduationCapWrapped = createHeroIcon(HeroAcademicCapIcon)

// Universal icons (can switch between libraries)
export const PersonIconComponent = createUniversalIcon('Account', HeroUserIcon)
export const StarsIconComponent = createUniversalIcon(
  'StarFourPoints',
  HeroStarIcon
)
export const BadgeIconComponent = createUniversalIcon(
  'Certificate',
  HeroShieldCheckIcon
)
export const SaveIconComponent = createUniversalIcon(
  'ContentSave',
  HeroArchiveBoxIcon
)
export const KeyIconComponent = createUniversalIcon('Key', HeroKeyIcon)
export const VisibilityIconComponent = createUniversalIcon('Eye', HeroEyeIcon)
export const VisibilityOffIconComponent = createUniversalIcon(
  'EyeOff',
  HeroEyeSlashIcon
)
export const SoundwaveIconComponent = createUniversalIcon(
  'Waveform',
  HeroSpeakerWaveIcon
)
export const MicIconComponent = createUniversalIcon(
  'Microphone',
  HeroMicrophoneIcon
)
export const RefreshIconComponent = createUniversalIcon(
  'Refresh',
  HeroArrowPathIcon
)
export const SlashIconComponent = createUniversalIcon(
  'Cancel',
  HeroNoSymbolIcon
)
export const CpuIconComponent = createUniversalIcon('Chip', HeroCpuChipIcon)
export const PlugIconComponent = createUniversalIcon('PowerPlug', HeroPlugIcon)
export const CheckIconComponent = createUniversalIcon('Check', HeroCheckIcon)
export const CloseIconComponent = createUniversalIcon('Close', HeroXMarkIcon)
export const SettingsIconComponent = createUniversalIcon('Cog', HeroCogIcon)
export const GameIconComponent = createUniversalIcon(
  'GamepadVariant',
  HeroPuzzlePieceIcon
)
export const LightbulbIconComponent = createUniversalIcon(
  'Lightbulb',
  HeroLightBulbIcon
)
export const DatabaseIconComponent = createUniversalIcon(
  'Database',
  HeroCircleStackIcon
)
export const BarChartIconComponent = createUniversalIcon(
  'ChartBar',
  HeroChartBarIcon
)
export const DownloadIconComponent = createUniversalIcon(
  'Download',
  HeroArrowDownTrayIcon
)
export const UploadIconComponent = createUniversalIcon(
  'Upload',
  HeroArrowUpTrayIcon
)
export const DeleteIconComponent = createUniversalIcon('Delete', HeroTrashIcon)
export const WarningIconComponent = createUniversalIcon(
  'Alert',
  HeroExclamationTriangleIcon
)
export const CheckCircleIconComponent = createUniversalIcon(
  'CheckCircle',
  HeroCheckCircleIcon
)
export const GithubIconComponent = createUniversalIcon(
  'Github',
  HeroCodeBracketIcon
)
export const BulletListIconComponent = createUniversalIcon(
  'FormatListBulleted',
  HeroListBulletIcon
)
export const InfoIconComponent = createUniversalIcon(
  'Info',
  HeroInformationCircleIcon
)
export const BotIconComponent = createUniversalIcon('Robot', HeroRobotIcon)
export const BriefcaseIconComponent = createUniversalIcon(
  'Briefcase',
  HeroBriefcaseIcon
)
export const MessageSquareIconComponent = createUniversalIcon(
  'MessageText',
  HeroChatBubbleLeftRightIcon
)
export const FileTextIconComponent = createUniversalIcon(
  'FileDocument',
  HeroDocumentTextIcon
)
export const CalendarIconComponent = createUniversalIcon(
  'Calendar',
  HeroCalendarIcon
)
export const ActivityIconComponent = createUniversalIcon(
  'Activity',
  HeroChartLineIcon
)
export const ClockIconComponent = createUniversalIcon('Clock', HeroClockIcon)
export const ChevronLeftIconComponent = createUniversalIcon(
  'ChevronLeft',
  HeroChevronLeftIcon
)
export const ChevronRightIconComponent = createUniversalIcon(
  'ChevronRight',
  HeroChevronRightIcon
)
export const CircleIconComponent = createUniversalIcon('Circle', HeroCircleIcon)
export const CogIconComponent = createUniversalIcon('Cog', HeroCogIcon)
export const AzureIconComponent = createUniversalIcon(
  'MicrosoftAzure',
  HeroCircleStackIcon
)
export const EyeIconComponent = createUniversalIcon('Eye', HeroEyeIcon)
export const EyeSlashIconComponent = createUniversalIcon(
  'EyeOff',
  HeroEyeSlashIcon
)
export const TrashIconComponent = createUniversalIcon('Delete', HeroTrashIcon)
export const RotateCcwIconComponent = createUniversalIcon(
  'RotateLeft',
  HeroArrowPathIcon
)
export const LinkedinIconComponent = createUniversalIcon(
  'Linkedin',
  HeroArrowTopRightOnSquareIcon
)
export const ExternalLinkIconComponent = createUniversalIcon(
  'OpenInNew',
  HeroArrowTopRightOnSquareIcon
)
export const BookIconComponent = createUniversalIcon('Book', HeroBookOpenIcon)
export const MessageCircleIconComponent = createUniversalIcon(
  'MessageText',
  HeroChatBubbleLeftIcon
)
export const AlertTriangleIconComponent = createUniversalIcon(
  'Alert',
  HeroExclamationTriangleIcon
)
export const MailIconComponent = createUniversalIcon('Email', HeroEnvelopeIcon)
export const HeartIconComponent = createUniversalIcon('Heart', HeroHeartIcon)
export const CodeTagsIconComponent = createUniversalIcon(
  'CodeTags',
  HeroCodeBracketIcon
)
export const PulseIconComponent = createUniversalIcon(
  'Pulse',
  HeroChartLineIcon
)
export const GraduationCapIconComponent = createUniversalIcon(
  'SchoolOutline',
  HeroAcademicCapIcon
)
