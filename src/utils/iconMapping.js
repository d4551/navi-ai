
export const EMOJI_TO_ICON_MAP = {
  // Gaming & Career

  // Technical & System

  // Communication & Media

  // Files & Documents

  // People & Users

  // Status & Actions
  "✓": "mdi-check",

  // Theme & UI

  // Gaming Specific

  // Achievements & Progress

  // Bugs & Development

};

  return EMOJI_TO_ICON_MAP[emoji] || fallback;
}

  const {
    size = "default",
    color = "default",
    fallback = "mdi-help-circle",
  } = options;

  return {
    icon: getIconForEmoji(emoji, fallback),
    size,
    color,
  };
}

  let result = text;

  Object.entries(EMOJI_TO_ICON_MAP).forEach(([emoji, icon]) => {
    const regex = new RegExp(emoji, "g");
    result = result.replace(regex, `[${icon}]`);
  });

  return result;
}

  return Object.keys(EMOJI_TO_ICON_MAP).some((emoji) => text.includes(emoji));
}

  return Object.keys(EMOJI_TO_ICON_MAP).filter((emoji) => text.includes(emoji));
}

export default {
  EMOJI_TO_ICON_MAP,
  getIconForEmoji,
  createIconComponent,
  replaceEmojisInText,
  hasReplaceableEmojis,
  extractEmojis,
};
