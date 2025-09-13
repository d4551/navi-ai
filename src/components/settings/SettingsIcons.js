// SettingsIcons.js - Centralized icon components for settings sections
import { h } from "vue";

// Icon component factory
const createIcon = (iconName, defaultClass = "") => ({
  name: iconName,
  props: {
    className: { type: String, default: defaultClass },
  },
  render() {
    return h("i", {
      class: [
        "mdi",
        `mdi-${iconName.toLowerCase().replace(/icon$/, "")}`,
        this.className,
      ],
      "aria-hidden": "true",
    });
  },
});

// Export all icon components
export const PersonIconComponent = createIcon("Account", "icon-sm");
export const StarsIconComponent = createIcon("StarFourPoints", "icon-sm");
export const BadgeIconComponent = createIcon("Certificate", "icon-sm");
export const SaveIconComponent = createIcon("ContentSave", "icon-sm");
export const KeyIconComponent = createIcon("Key", "icon-sm");
export const VisibilityIconComponent = createIcon("Eye", "icon-sm");
export const VisibilityOffIconComponent = createIcon("EyeOff", "icon-sm");
export const SoundwaveIconComponent = createIcon("Waveform", "icon-sm");
export const MicIconComponent = createIcon("Microphone", "icon-sm");
export const RefreshIconComponent = createIcon("Refresh", "icon-sm");
export const SlashIconComponent = createIcon("Cancel", "icon-sm");
export const CpuIconComponent = createIcon("Chip", "icon-sm");
export const PlugIconComponent = createIcon("PowerPlug", "icon-sm");
export const CheckIconComponent = createIcon("Check", "icon-sm");
export const CloseIconComponent = createIcon("Close", "icon-sm");
export const SettingsIconComponent = createIcon("Cog", "icon-sm");
export const GameIconComponent = createIcon("GamepadVariant", "icon-sm");
export const LightbulbIconComponent = createIcon("Lightbulb", "icon-sm");
export const DatabaseIconComponent = createIcon("Database", "icon-sm");
export const BarChartIconComponent = createIcon("ChartBar", "icon-sm");
export const DownloadIconComponent = createIcon("Download", "icon-sm");
export const UploadIconComponent = createIcon("Upload", "icon-sm");
export const DeleteIconComponent = createIcon("Delete", "icon-sm");
export const WarningIconComponent = createIcon("Alert", "icon-sm");
export const CheckCircleIconComponent = createIcon("CheckCircle", "icon-sm");
export const GithubIconComponent = createIcon("Github", "icon-sm");
export const BulletListIconComponent = createIcon(
  "FormatListBulleted",
  "icon-sm",
);
export const InfoIconComponent = createIcon("Info", "icon-sm");
export const BotIconComponent = createIcon("Robot", "icon-sm");
export const BriefcaseIconComponent = createIcon("Briefcase", "icon-sm");
export const MessageSquareIconComponent = createIcon("MessageText", "icon-sm");
export const FileTextIconComponent = createIcon("FileDocument", "icon-sm");
export const CalendarIconComponent = createIcon("Calendar", "icon-sm");
export const ActivityIconComponent = createIcon("Activity", "icon-sm");
export const ClockIconComponent = createIcon("Clock", "icon-sm");
export const ChevronLeftIconComponent = createIcon("ChevronLeft", "icon-sm");
export const ChevronRightIconComponent = createIcon("ChevronRight", "icon-sm");
export const CircleIconComponent = createIcon("Circle", "icon-sm");
export const CogIconComponent = createIcon("Cog", "icon-sm");
export const AzureIconComponent = createIcon("MicrosoftAzure", "icon-sm");
export const EyeIconComponent = createIcon("Eye", "icon-sm");
export const EyeSlashIconComponent = createIcon("EyeOff", "icon-sm");
export const TrashIconComponent = createIcon("Delete", "icon-sm");
export const RotateCcwIconComponent = createIcon("RotateLeft", "icon-sm");
export const LinkedinIconComponent = createIcon("Linkedin", "icon-sm");
export const ExternalLinkIconComponent = createIcon("OpenInNew", "icon-sm");
export const BookIconComponent = createIcon("Book", "icon-sm");
export const MessageCircleIconComponent = createIcon("MessageText", "icon-sm");
export const AlertTriangleIconComponent = createIcon("Alert", "icon-sm");
export const MailIconComponent = createIcon("Email", "icon-sm");
export const HeartIconComponent = createIcon("Heart", "icon-sm");
export const CodeTagsIconComponent = createIcon("CodeTags", "icon-sm");
export const PulseIconComponent = createIcon("Pulse", "icon-sm");
export const ListIconComponent = createIcon("FormatListBulleted", "icon-sm");
export const CodeBracesIconComponent = createIcon("CodeBraces", "icon-sm");
export const GraduationCapIconComponent = createIcon(
  "SchoolOutline",
  "icon-sm",
);
