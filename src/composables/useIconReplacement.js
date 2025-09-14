import { computed } from "vue";
import {
  getIconForEmoji,
  createIconComponent,
  hasReplaceableEmojis,
} from "@/utils/iconMapping";

export function useIconReplacement() {
  const getIcon = (emoji, fallback = "mdi-help-circle") => {
    return getIconForEmoji(emoji, fallback);
  };

  const createReactiveIcon = (emojiRef, options = {}) => {
    return computed(() => createIconComponent(emojiRef.value, options));
  };

  const replaceEmojisReactive = (textRef) => {
    return computed(() => {
      if (!textRef.value) return "";

      let result = textRef.value;

      // Replace common emojis with icon components
      result = result.replace(
        "<v-icon>mdi-file-document-outline-edit</v-icon>",
      );
      result = result.replace(
        "<v-icon>mdi-check-circle-outline</v-icon>",
      );
      result = result.replace(
        "<v-icon>mdi-close-circle-outline</v-icon>",
      );
      result = result.replace(/✓/g, "<v-icon>mdi-check</v-icon>");
      result = result.replace(
        "<v-icon>mdi-file-document-outline</v-icon>",
      );

      return result;
    });
  };

  const containsEmojis = (text) => {
    return hasReplaceableEmojis(text);
  };

  const getIconSize = (context = "default") => {
    const sizeMap = {
      small: "small",
      medium: "default",
      large: "large",
      "x-large": "x-large",
      button: "small",
      header: "large",
      card: "default",
      list: "small",
    };

    return sizeMap[context] || "default";
  };

  const getIconColor = (context = "default") => {
    const colorMap = {
      primary: "primary",
      secondary: "secondary",
      success: "success",
      warning: "warning",
      error: "error",
      info: "info",
      muted: "grey",
      gaming: "purple",
      achievement: "amber",
    };

    return colorMap[context] || undefined;
  };

  return {
    getIcon,
    createReactiveIcon,
    replaceEmojisReactive,
    containsEmojis,
    getIconSize,
    getIconColor,
  };
}

export default useIconReplacement;
