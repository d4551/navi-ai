/**
 * Emoji to MUI Icons mapping utility
 * This provides consistent MUI icon replacement throughout the application
 */

// Import commonly used MUI icons
import {
  SportsEsports as GamepadIcon,
  MyLocation as TargetIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as ChartIcon,
  Diamond as DiamondIcon,
  Star as StarIcon,
  Rocket as RocketIcon,
  BusinessCenter as BriefcaseIcon,
  Edit as DocumentEditIcon,
  Palette as PaletteIcon,
  Build as WrenchIcon,
  Settings as CogIcon,
  PhoneAndroid as CellphoneIcon,
  Laptop as LaptopIcon,
  StarOutline as StarOutlineIcon,
  AutoAwesome as ShimmerIcon,
  CelebrationOutlined as PartyIcon,
  Lightbulb as LightbulbIcon,
  Flash as LightningIcon,
  Whatshot as FireIcon,
  Mic as MicrophoneIcon,
  VolumeUp as VolumeHighIcon,
  Phone as PhoneIcon,
  Chat as ChatIcon,
  CameraAlt as CameraIcon,
  Videocam as VideoIcon,
  VideoLibrary as VideoBoxIcon,
  Tv as TelevisionIcon,
  RecordVoiceOver as AccountVoiceIcon,
  CloudQueue as ThoughtBubbleIcon,
  Description as DocumentIcon,
  Folder as FolderIcon,
  Assignment as ClipboardIcon,
  MenuBook as BookIcon,
  LocationOn as MapMarkerIcon,
  Person as AccountIcon,
  Group as AccountGroupIcon,
  PersonAdd as AccountEditIcon,
  AutoFixHigh as WizardIcon,
  FaceRetouchingNatural as FaceWomanShimmerIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CloseCircleIcon,
  Check as CheckIcon,
  Lock as LockIcon,
  Search as MagnifyIcon,
  SmartToy as RobotIcon,
  DarkMode as WeatherNightIcon,
  LightMode as WeatherSunnyIcon,
  Festival as TentIcon,
  TheaterComedy as DramaMasksIcon,
  Casino as DiceIcon,
  Style as CardsPlayingIcon,
  Pets as DogServiceIcon,
  Cruelty_Free as RabbitIcon,
  Flag as PirateIcon,
  Science as OctopusIcon,
  TwoWheeler as MotorbikeIcon,
  LocalPolice as CarEmergencyIcon,
  Home as HomeIcon,
  WorkspacePremium as MedalIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as CashIcon,
  MoneyOff as CashMinusIcon,
  Celebration as BalloonIcon,
  CardGiftcard as GiftIcon,
  BugReport as BugIcon,
  Science as TestTubeIcon,
  Egg as EggEasterIcon,
  LocalCafe as CupIcon
} from '@mui/icons-material'

export const EMOJI_TO_MUI_ICON_MAP = {
  // Gaming & Career
  '🎮': GamepadIcon,
  '🎯': TargetIcon,
  '🏆': TrophyIcon,
  '📊': ChartIcon,
  '💎': DiamondIcon,
  '⭐': StarIcon,
  '🚀': RocketIcon,
  '💼': BriefcaseIcon,
  '📝': DocumentEditIcon,
  '🎨': PaletteIcon,
  
  // Technical & System
  '🔧': WrenchIcon,
  '⚙️': CogIcon,
  '📱': CellphoneIcon,
  '💻': LaptopIcon,
  '🌟': StarOutlineIcon,
  '✨': ShimmerIcon,
  '🎉': PartyIcon,
  '💡': LightbulbIcon,
  '⚡': LightningIcon,
  '🌈': PaletteIcon,
  '🔥': FireIcon,
  
  // Communication & Media
  '🎤': MicrophoneIcon,
  '🔊': VolumeHighIcon,
  '📞': PhoneIcon,
  '💬': ChatIcon,
  '📸': CameraIcon,
  '🎥': VideoIcon,
  '📹': VideoBoxIcon,
  '📺': TelevisionIcon,
  '🗣️': AccountVoiceIcon,
  '💭': ThoughtBubbleIcon,
  
  // Files & Documents
  '📄': DocumentIcon,
  '📁': FolderIcon,
  '📋': ClipboardIcon,
  '📖': BookIcon,
  '📍': MapMarkerIcon,
  
  // People & Users
  '👤': AccountIcon,
  '👥': AccountGroupIcon,
  '👩‍💻': AccountEditIcon,
  '👨‍💻': AccountEditIcon,
  '🧙‍♂️': WizardIcon,
  '🧚‍♀️': FaceWomanShimmerIcon,
  
  // Status & Actions
  '✅': CheckCircleIcon,
  '❌': CloseCircleIcon,
  '✓': CheckIcon,
  '🔒': LockIcon,
  '🔍': MagnifyIcon,
  '🤖': RobotIcon,
  
  // Theme & UI
  '🌙': WeatherNightIcon,
  '☀️': WeatherSunnyIcon,
  '🎪': TentIcon,
  '🎭': DramaMasksIcon,
  '🎲': DiceIcon,
  '🃏': CardsPlayingIcon,
  
  // Gaming Specific
  '🐕‍🦺': DogServiceIcon, // Sam
  '🐰': RabbitIcon, // Max
  '🏴‍☠️': PirateIcon,
  '🐙': OctopusIcon,
  '🏍️': MotorbikeIcon,
  '🚔': CarEmergencyIcon,
  '🏠': HomeIcon,
  
  // Achievements & Progress
  '🏅': MedalIcon,
  '📈': ChartIcon,
  '📉': TrendingDownIcon,
  '💰': CashIcon,
  '💸': CashMinusIcon,
  '🎈': BalloonIcon,
  '🎁': GiftIcon,
  
  // Bugs & Development
  '🐛': BugIcon,
  '🧪': TestTubeIcon,
  
  // Easter Eggs
  '🥚': EggEasterIcon,
  '🥤': CupIcon
}

// MDI to MUI Icon mapping for existing codebase
export const MDI_TO_MUI_ICON_MAP = {
  'mdi-gamepad-variant': GamepadIcon,
  'mdi-target': TargetIcon,
  'mdi-trophy': TrophyIcon,
  'mdi-chart-line': ChartIcon,
  'mdi-diamond-stone': DiamondIcon,
  'mdi-star': StarIcon,
  'mdi-rocket': RocketIcon,
  'mdi-briefcase': BriefcaseIcon,
  'mdi-file-document-outline-edit': DocumentEditIcon,
  'mdi-palette': PaletteIcon,
  'mdi-wrench': WrenchIcon,
  'mdi-cog': CogIcon,
  'mdi-cellphone': CellphoneIcon,
  'mdi-laptop': LaptopIcon,
  'mdi-star-outline': StarOutlineIcon,
  'mdi-shimmer': ShimmerIcon,
  'mdi-party-popper': PartyIcon,
  'mdi-lightbulb': LightbulbIcon,
  'mdi-lightning-bolt': LightningIcon,
  'mdi-fire': FireIcon,
  'mdi-microphone': MicrophoneIcon,
  'mdi-volume-high': VolumeHighIcon,
  'mdi-phone': PhoneIcon,
  'mdi-chat': ChatIcon,
  'mdi-camera': CameraIcon,
  'mdi-video': VideoIcon,
  'mdi-video-box': VideoBoxIcon,
  'mdi-television': TelevisionIcon,
  'mdi-account-voice': AccountVoiceIcon,
  'mdi-thought-bubble': ThoughtBubbleIcon,
  'mdi-file-document-outline': DocumentIcon,
  'mdi-folder': FolderIcon,
  'mdi-clipboard-text': ClipboardIcon,
  'mdi-book': BookIcon,
  'mdi-map-marker': MapMarkerIcon,
  'mdi-account': AccountIcon,
  'mdi-account-group': AccountGroupIcon,
  'mdi-account-edit': AccountEditIcon,
  'mdi-wizard-hat': WizardIcon,
  'mdi-face-woman-shimmer': FaceWomanShimmerIcon,
  'mdi-check-circle-outline': CheckCircleIcon,
  'mdi-close-circle-outline': CloseCircleIcon,
  'mdi-check': CheckIcon,
  'mdi-lock': LockIcon,
  'mdi-magnify': MagnifyIcon,
  'mdi-robot': RobotIcon,
  'mdi-weather-night': WeatherNightIcon,
  'mdi-weather-sunny': WeatherSunnyIcon,
  'mdi-tent': TentIcon,
  'mdi-drama-masks': DramaMasksIcon,
  'mdi-dice-6': DiceIcon,
  'mdi-cards-playing-outline': CardsPlayingIcon,
  'mdi-dog-service': DogServiceIcon,
  'mdi-rabbit': RabbitIcon,
  'mdi-pirate': PirateIcon,
  'mdi-octopus': OctopusIcon,
  'mdi-motorbike': MotorbikeIcon,
  'mdi-car-emergency': CarEmergencyIcon,
  'mdi-home': HomeIcon,
  'mdi-medal': MedalIcon,
  'mdi-trending-up': ChartIcon,
  'mdi-trending-down': TrendingDownIcon,
  'mdi-cash': CashIcon,
  'mdi-cash-minus': CashMinusIcon,
  'mdi-balloon': BalloonIcon,
  'mdi-gift': GiftIcon,
  'mdi-bug': BugIcon,
  'mdi-test-tube': TestTubeIcon,
  'mdi-egg-easter': EggEasterIcon,
  'mdi-cup': CupIcon,
  'mdi-help-circle': StarIcon // Default fallback
}

/**
 * Get MUI Icon component for emoji
 * @param {string} emoji - The emoji to convert
 * @param {Component} fallback - Fallback icon component if emoji not found
 * @returns {Component} MUI Icon component
 */
export function getMuiIconForEmoji(emoji, fallback = StarIcon) {
  return EMOJI_TO_MUI_ICON_MAP[emoji] || fallback
}

/**
 * Get MUI Icon component for MDI icon name
 * @param {string} mdiIcon - The MDI icon name to convert
 * @param {Component} fallback - Fallback icon component if icon not found
 * @returns {Component} MUI Icon component
 */
export function getMuiIconForMdi(mdiIcon, fallback = StarIcon) {
  return MDI_TO_MUI_ICON_MAP[mdiIcon] || fallback
}

/**
 * Replace emoji with MUI icon component
 * @param {string} emoji - The emoji to replace
 * @param {Object} options - Additional options
 * @returns {Object} Component and props
 */
export function createMuiIconComponent(emoji, options = {}) {
  const {
    fallback = StarIcon
  } = options

  return {
    component: getMuiIconForEmoji(emoji, fallback),
    props: {}
  }
}

export default {
  EMOJI_TO_MUI_ICON_MAP,
  MDI_TO_MUI_ICON_MAP,
  getMuiIconForEmoji,
  getMuiIconForMdi,
  createMuiIconComponent
}