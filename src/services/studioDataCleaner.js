import { logger } from "@/shared/utils/logger";

// Gaming studio data schema with comprehensive validation
export const STUDIO_DATA_SCHEMA = {
  // Core required fields
  name: {
    required: true,
    type: "string",
    clean: (value) => value?.trim().replace(/\s+/g, " "),
  },

  // Location and regional data
  location: {
    required: false,
    type: "object",
    schema: {
      city: { type: "string", clean: (v) => v?.trim() },
      state: { type: "string", clean: (v) => v?.trim() },
      country: { type: "string", required: true, clean: (v) => v?.trim() },
      region: {
        type: "string",
        enum: [
          "North America",
          "Europe",
          "Asia",
          "South America",
          "Africa",
          "Oceania",
        ],
        derive: (_data) => deriveRegionFromCountry(data.country),
      },
      coordinates: {
        type: "object",
        schema: {
        },
      },
    },
  },

  // Company information
  companyInfo: {
    required: false,
    type: "object",
    schema: {
      founded: {
        type: "number",
        max: new Date().getFullYear(),
        clean: (value) => parseInt(value) || null,
      },
      employees: {
        type: "string",
        clean: (value) => normalizeEmployeeCount(value),
      },
      type: {
        type: "string",
        enum: [
          "Indie",
          "AA",
          "AAA",
          "Mobile",
          "VR/AR",
          "Serious Games",
          "Publisher",
        ],
        clean: (value) => normalizeStudioType(value),
      },
      status: {
        type: "string",
        enum: ["Active", "Acquired", "Closed", "Dormant"],
        default: "Active",
      },
    },
  },

  // Contact and web presence
  contact: {
    required: false,
    type: "object",
    schema: {
      website: {
        type: "string",
        pattern: /^https?:\/\/.+/,
        clean: (value) => normalizeURL(value),
      },
      email: {
        type: "string",
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        clean: (value) => value?.toLowerCase().trim(),
      },
      careers: {
        type: "string",
        clean: (value) => normalizeURL(value),
      },
    },
  },

  // Gaming specializations
  specializations: {
    required: false,
    type: "array",
    items: {
      type: "string",
      enum: [
        // Genres
        "Action",
        "Adventure",
        "RPG",
        "Strategy",
        "Simulation",
        "Sports",
        "Racing",
        "Fighting",
        "Puzzle",
        "Horror",
        "MMO",
        "Battle Royale",
        "Platformer",
        "Shooter",
        "Survival",
        "Sandbox",
        // Platforms
        "PC",
        "Console",
        "Mobile",
        "VR",
        "AR",
        "Web",
        // Specialties
        "Game Engine Development",
        "Middleware",
        "Tools",
        "Services",
        "Porting",
        "Localization",
        "QA",
        "Art Services",
        "Audio",
      ],
    },
    clean: (array) => cleanSpecializations(array),
  },

  // Technology stack
  technologies: {
    required: false,
    type: "object",
    schema: {
      engines: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "Unity",
            "Unreal Engine",
            "Godot",
            "Custom Engine",
            "GameMaker",
            "Construct",
            "CryEngine",
            "Source",
            "id Tech",
          ],
        },
      },
      languages: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "C++",
            "JavaScript",
            "Python",
            "Java",
            "Swift",
            "Kotlin",
            "Lua",
            "HLSL",
            "GLSL",
          ],
        },
      },
      platforms: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "Windows",
            "macOS",
            "Linux",
            "PlayStation",
            "Xbox",
            "Nintendo Switch",
            "iOS",
            "Android",
            "Steam",
            "Epic Games Store",
          ],
        },
      },
    },
  },

  // Notable games/projects
  portfolio: {
    required: false,
    type: "array",
    items: {
      type: "object",
      schema: {
        name: { type: "string", required: true },
        platforms: { type: "array", items: { type: "string" } },
        genre: { type: "string" },
        role: {
          type: "string",
          enum: ["Developer", "Publisher", "Co-Developer", "Porter", "Support"],
        },
      },
    },
  },

  // Job opportunities and hiring info
  hiring: {
    required: false,
    type: "object",
    schema: {
      isHiring: { type: "boolean", default: false },
      remotePolicy: {
        type: "string",
        enum: [
          "No Remote",
          "Hybrid",
          "Remote Friendly",
          "Remote First",
          "Fully Remote",
        ],
      },
      visaSponsorship: { type: "boolean", default: false },
      internships: { type: "boolean", default: false },
      commonRoles: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "Game Designer",
            "Programmer",
            "Artist",
            "Animator",
            "Technical Artist",
            "UI/UX Designer",
            "Producer",
            "QA Tester",
            "Audio Designer",
            "Writer",
            "Community Manager",
            "Marketing",
            "Business Development",
            "DevOps",
            "Data Analyst",
          ],
        },
      },
    },
  },

  // Social and reputation data
  reputation: {
    required: false,
    type: "object",
    schema: {
      awards: {
        type: "array",
        items: {
          type: "object",
          schema: {
            name: { type: "string" },
            year: { type: "number" },
            category: { type: "string" },
          },
        },
      },
    },
  },

  // Metadata
  metadata: {
    required: false,
    type: "object",
    schema: {
      dataSource: { type: "string" },
      lastUpdated: { type: "string", format: "date-iso" },
      tags: { type: "array", items: { type: "string" } },
    },
  },
};

  try {
    // Starting studio data cleaning process

    const {
      strict = false,
      fillMissing = true,
      validateRequired = true,
      enrichData = true,
    } = options;

    const studios = Array.isArray(rawData) ? rawData : [rawData];
    const results = {
      cleaned: [],
      errors: [],
      warnings: [],
      statistics: {
        total: studios.length,
      },
    };

    for (const [index, rawStudio] of studios.entries()) {
      try {
        // Processing studio data

        const cleaned = await basicDataCleaning(rawStudio);

        const normalized = await validateAndNormalize(
          cleaned,
          STUDIO_DATA_SCHEMA,
          { strict, validateRequired },
        );

        if (enrichData) {
          const enriched = await enrichStudioData(normalized);
          normalized.metadata = {
            ...normalized.metadata,
            ...enriched.metadata,
          };
          results.statistics.enriched++;
        }

        const final = await generateDerivedFields(normalized);

        results.cleaned.push(final);
        results.statistics.successful++;
      } catch (_error) {
        // Log processing failures for debugging
        logger.error(
          _error,
          "StudioDataCleaner",
        );
        results.errors.push({
          index,
          error: error.message,
          data: rawStudio,
        });
        results.statistics.failed++;
      }
    }

    // Studio cleaning completed successfully

    return results;
  } catch (_error) {
    // Log critical failures
    logger.error("Studio data cleaning failed:", error, "StudioDataCleaner");
    throw new Error(`Studio data cleaning failed: ${error.message}`);
  }
}

  const cleaned = { ...rawStudio };

  // Clean studio name
  if (cleaned.name) {
    cleaned.name = cleaned.name
      .trim()
      .replace(/\s+/g, " ")
      .replace(
        /\b(inc|llc|ltd|corp|corporation|games|studio|entertainment)\b\.?$/gi,
        "",
      )
      .trim();
  }

  // Normalize location data
  if (typeof cleaned.location === "string") {
    cleaned.location = parseLocationString(cleaned.location);
  }

  // Clean and normalize URLs
  const urlFields = ["website", "careers", "linkedin", "twitter"];
  urlFields.forEach((field) => {
    if (cleaned[field]) {
      cleaned[field] = normalizeURL(cleaned[field]);
    }
  });

  // Parse employee count from various formats
  if (cleaned.employees || cleaned.size || cleaned.companySize) {
    cleaned.employees = normalizeEmployeeCount(
      cleaned.employees || cleaned.size || cleaned.companySize,
    );
  }

  // Clean specializations array
  if (cleaned.specializations) {
    cleaned.specializations = cleanSpecializations(cleaned.specializations);
  }

  // Parse founding year
  if (cleaned.founded) {
    const year = parseInt(cleaned.founded);
      cleaned.founded = year;
    }
  }

  return cleaned;
}

  const result = {};
  const errors = [];

  for (const [field, fieldSchema] of Object.entries(schema)) {
    try {
      const value = data[field];

      // Check required fields
      if (
        fieldSchema.required &&
        (value === undefined || value === null || value === "")
      ) {
        if (options.validateRequired) {
          throw new Error(`Required field '${field}' is missing`);
        }
        continue;
      }

      // Skip if no value and not required
      if (value === undefined || value === null) {
        if (fieldSchema.default !== undefined) {
          result[field] = fieldSchema.default;
        }
        continue;
      }

      let cleanedValue = value;
        cleanedValue = fieldSchema.clean(value);
      }

      // Type validation and conversion
      cleanedValue = await validateFieldType(cleanedValue, fieldSchema, field);

        cleanedValue = fieldSchema.derive(_data);
      }

      result[field] = cleanedValue;
    } catch (_error) {
      errors.push(`Field '${field}': ${error.message}`);
      if (options.strict) {
        throw new Error(
          `Validation failed for field '${field}': ${error.message}`,
        );
      }
    }
  }

    throw new Error(`Schema validation failed: ${errors.join(", ")}`);
  }

  return result;
}

  const enrichments = {
    metadata: {
      enrichedAt: new Date().toISOString(),
      enrichments: [],
    },
  };

  try {
    // Add gaming industry tags
    if (studioData.specializations) {
      enrichments.industryTags = generateIndustryTags(
        studioData.specializations,
      );
      enrichments.metadata.enrichments.push("industry_tags");
    }

    // Calculate studio score based on various factors
    enrichments.studioScore = calculateStudioScore(studioData);
    enrichments.metadata.enrichments.push("studio_score");

    // Generate search keywords
    enrichments.searchKeywords = generateSearchKeywords(studioData);
    enrichments.metadata.enrichments.push("search_keywords");

    // Add market tier classification
    enrichments.marketTier = classifyMarketTier(studioData);
    enrichments.metadata.enrichments.push("market_tier");
  } catch (_error) {
    console.warn("Data enrichment partially failed:", error);
  }

  return enrichments;
}

  const result = { ...studioData };

  // Generate unique ID if not present
  if (!result.id) {
    result.id = generateStudioId(result.name, result.location?.country);
  }

  // Generate display name
  result.displayName = result.name;

  // Generate slug for URLs
  result.slug = result.name
    ?.toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")

  // Set import metadata
  result.metadata = {
    ...result.metadata,
    importedAt: new Date().toISOString(),
  };

  return result;
}


  if (!url) {
    return null;
  }

  let normalized = url.trim();
  if (!/^https?:\/\//.test(normalized)) {
    normalized = "https://" + normalized;
  }

  try {
    const urlObj = new URL(normalized);
    return urlObj.toString();
  } catch {
    return null;
  }
}

  if (!value) {
    return null;
  }

  const str = String(value).toLowerCase();

  // Extract numbers
  const numbers = str.match(/\d+/g)?.map(Number) || [];

    return null;
  }

  const max = Math.max(...numbers);

  }
  }
  }
  }
  }
}

  if (!value) {
    return null;
  }

  const str = String(value).toLowerCase();

  if (str.includes("indie") || str.includes("independent")) {
    return "Indie";
  }
  if (str.includes("aaa") || str.includes("triple-a")) {
    return "AAA";
  }
  if (str.includes("mobile")) {
    return "Mobile";
  }
  if (
    str.includes("vr") ||
    str.includes("ar") ||
    str.includes("virtual") ||
    str.includes("augmented")
  ) {
    return "VR/AR";
  }
  if (str.includes("publisher") || str.includes("publishing")) {
    return "Publisher";
  }
  if (str.includes("serious")) {
    return "Serious Games";
  }

  return "AA"; // Default fallback
}

  const parts = locationStr.split(",").map((s) => s.trim());

    return {
    };
    return {
    };
  } else {
    return {
    };
  }
}

  const regionMap = {
    "United States": "North America",
    Canada: "North America",
    Mexico: "North America",
    "United Kingdom": "Europe",
    Germany: "Europe",
    France: "Europe",
    Sweden: "Europe",
    Poland: "Europe",
    Japan: "Asia",
    China: "Asia",
    "South Korea": "Asia",
    Singapore: "Asia",
    Australia: "Oceania",
    "New Zealand": "Oceania",
    Brazil: "South America",
    Argentina: "South America",
  };

  return regionMap[country] || "Unknown";
}

  if (!Array.isArray(specs)) {
    return [];
  }

  return specs
    .map((s) => String(s).trim())
    .map((s) => {
      // Normalize common variations
      const normalized = s.toLowerCase();
      if (normalized.includes("rpg") || normalized.includes("role")) {
        return "RPG";
      }
      if (normalized.includes("fps") || normalized.includes("shooter")) {
        return "Shooter";
      }
      if (normalized.includes("rts") || normalized.includes("strategy")) {
        return "Strategy";
      }
      return s;
    })
}

  const tags = new Set();

  specializations.forEach((spec) => {
    const lower = spec.toLowerCase();

    if (["action", "shooter", "fighting"].includes(lower)) {
      tags.add("Action Games");
    }
    if (["rpg", "adventure"].includes(lower)) {
      tags.add("Story-Driven");
    }
    if (["strategy", "simulation"].includes(lower)) {
      tags.add("Strategy Games");
    }
    if (["mobile", "casual"].includes(lower)) {
      tags.add("Mobile Gaming");
    }
    if (["vr", "ar"].includes(lower)) {
      tags.add("Emerging Tech");
    }
    if (["mmo", "multiplayer"].includes(lower)) {
      tags.add("Online Gaming");
    }
  });

  return Array.from(tags);
}


  // Size bonus
  }

  // Portfolio bonus
  }

  // Technology stack bonus
  }
  }

  // Hiring status bonus
  if (studio.hiring?.isHiring) {
  }
  if (
    studio.hiring?.remotePolicy === "Remote Friendly" ||
    studio.hiring?.remotePolicy === "Fully Remote"
  ) {
  }

}

  const keywords = new Set();

  if (studio.name) {
    keywords.add(studio.name.toLowerCase());
  }
  if (studio.location?.city) {
    keywords.add(studio.location.city.toLowerCase());
  }
  if (studio.location?.country) {
    keywords.add(studio.location.country.toLowerCase());
  }

  studio.specializations?.forEach((spec) => keywords.add(spec.toLowerCase()));
  studio.technologies?.engines?.forEach((engine) =>
    keywords.add(engine.toLowerCase()),
  );

}

  const employeeCount = studio.employees;

    return "AAA";
  }
  if (
  ) {
    return "AA";
  }
    return "Mid-Tier";
  }
  return "Indie";
}

  const nameSlug =

  return `${nameSlug}-${countryCode}-${timestamp}`;
}

  const {
    type,
    pattern,
    min,
    max,
    minLength,
    maxLength,
    enum: enumValues,
  } = fieldSchema;

  switch (type) {
    case "string":
      if (typeof value !== "string") {
        value = String(value);
      }
      if (minLength && value.length < minLength) {
        throw new Error(`String too short (min: ${minLength})`);
      }
      if (maxLength && value.length > maxLength) {
      }
      if (pattern && !pattern.test(value)) {
        throw new Error(`String doesn't match required pattern`);
      }
      if (enumValues && !enumValues.includes(value)) {
        // Try to find closest match
        const closest = enumValues.find(
          (_e) => e.toLowerCase() === value.toLowerCase(),
        );
        if (closest) {
          value = closest;
        } else {
          throw new Error(
            `Value not in allowed enum: ${enumValues.join(", ")}`,
          );
        }
      }
      break;

    case "number":
      value = Number(value);
      if (isNaN(value)) {
        throw new Error("Invalid number");
      }
      if (min !== undefined && value < min) {
        throw new Error(`Number too small (min: ${min})`);
      }
      if (max !== undefined && value > max) {
        throw new Error(`Number too large (max: ${max})`);
      }
      break;

    case "boolean":
      if (typeof value === "string") {
      } else {
        value = Boolean(value);
      }
      break;

    case "array":
      if (!Array.isArray(value)) {
        if (typeof value === "string") {
          value = value
            .split(",")
            .map((s) => s.trim())
        } else {
          throw new Error("Expected array");
        }
      }
      break;

    case "object":
      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        throw new Error("Expected object");
      }

      // Recursively validate nested objects
      if (fieldSchema.schema) {
        value = await validateAndNormalize(value, fieldSchema.schema);
      }
      break;
  }

  return value;
}

  const errors = [];
  const warnings = [];

  try {
    // Validate required fields
    if (!data || typeof data !== "object") {
      errors.push("Data must be a valid object");
      return { isValid: false, errors, warnings };
    }

    // Validate studio name
    if (
      !data.name ||
      typeof data.name !== "string" ||
    ) {
      errors.push(
      );
    }

    // Validate location data
    if (data.location) {
      if (typeof data.location !== "object") {
        errors.push("Location must be an object");
      } else {
        if (
          data.location.country &&
          typeof data.location.country !== "string"
        ) {
          errors.push("Location country must be a string");
        }
        if (data.location.coordinates) {
          const { lat, lng } = data.location.coordinates;
          }
          }
        }
      }
    }

    // Validate company info
    if (data.companyInfo) {
      if (typeof data.companyInfo !== "object") {
        errors.push("Company info must be an object");
      } else {
        if (data.companyInfo.founded) {
          const founded = parseInt(data.companyInfo.founded);
          const currentYear = new Date().getFullYear();
          }
        }
        if (
          data.companyInfo.size &&
          !["indie", "small", "medium", "large", "enterprise"].includes(
            data.companyInfo.size,
          )
        ) {
          warnings.push(
            "Company size should be one of: indie, small, medium, large, enterprise",
          );
        }
      }
    }

    // Validate games array
    if (data.games && !Array.isArray(data.games)) {
      errors.push("Games must be an array");
    } else if (data.games) {
      data.games.forEach((game, index) => {
        if (!game || typeof game !== "object") {
          errors.push(`Game at index ${index} must be an object`);
        } else {
          if (!game.name || typeof game.name !== "string") {
            errors.push(`Game at index ${index} must have a name`);
          }
          if (game.releaseDate && isNaN(Date.parse(game.releaseDate))) {
            warnings.push(`Game "${game.name}" has invalid release date`);
          }
        }
      });
    }

    // Validate technologies array
    if (data.technologies && !Array.isArray(data.technologies)) {
      errors.push("Technologies must be an array");
    } else if (data.technologies) {
      data.technologies.forEach((tech, index) => {
        if (typeof tech !== "string") {
          errors.push(`Technology at index ${index} must be a string`);
        }
      });
    }

    // Validate job postings
    if (data.jobPostings && !Array.isArray(data.jobPostings)) {
      errors.push("Job postings must be an array");
    } else if (data.jobPostings) {
      data.jobPostings.forEach((job, index) => {
        if (!job || typeof job !== "object") {
          errors.push(`Job posting at index ${index} must be an object`);
        } else {
          if (!job.title || typeof job.title !== "string") {
            errors.push(`Job posting at index ${index} must have a title`);
          }
          if (
            !job.type ||
            ![
              "full-time",
              "part-time",
              "contract",
              "internship",
              "freelance",
            ].includes(job.type)
          ) {
            warnings.push(
              `Job posting "${job.title || index}" should have a valid type`,
            );
          }
        }
      });
    }

    // Validate URLs with better error handling
    const urlFields = ["website", "careers", "linkedin", "twitter"];
    urlFields.forEach((field) => {
      if (data[field] && typeof data[field] === "string") {
        try {
          const url = new URL(data[field]);
          // Additional validation for suspicious URLs
            warnings.push(`${field} URL appears to be a local development URL`);
          }
          if (url.protocol !== "https:" && url.protocol !== "http:") {
            warnings.push(
              `${field} URL has an unusual protocol: ${url.protocol}`,
            );
          }
        } catch {
          // Try to fix common URL issues
          let fixedUrl = data[field];
          if (
            !fixedUrl.startsWith("http://") &&
            !fixedUrl.startsWith("https://")
          ) {
            fixedUrl = "https://" + fixedUrl;
            try {
              new URL(fixedUrl);
              warnings.push(
                `${field} URL was missing protocol, suggesting: ${fixedUrl}`,
              );
            } catch {
              warnings.push(`${field} appears to be an invalid URL`);
            }
          } else {
            warnings.push(`${field} appears to be an invalid URL`);
          }
        }
      }
    });

    // Enhanced data quality checks
    if (data.name && data.name.toLowerCase().includes("untitled")) {
      warnings.push("Studio name appears to be a placeholder");
    }

    // Check for common name formatting issues
      warnings.push(
        "Studio name is unusually long and may contain extra information",
      );
    }

    if (data.name && /[<>]/.test(data.name)) {
      warnings.push(
        "Studio name contains HTML-like characters that may need cleaning",
      );
    }

      warnings.push(
        "Studio description is very short and may need more detail",
      );
    }

    // Check for potential data corruption
    if (
      (data.description && data.description.includes("undefined")) ||
      data.description.includes("null")
    ) {
      warnings.push(
        "Studio description contains placeholder values that should be cleaned",
      );
    }

    // Validate employee count ranges
    if (data.employees && typeof data.employees === "number") {
        errors.push("Employee count cannot be negative");
      }
        warnings.push(
          "Employee count seems unusually high for a gaming studio",
        );
      }
    }

    // Check for missing critical gaming industry fields
    if (
      !data.specializations ||
      !Array.isArray(data.specializations) ||
    ) {
      warnings.push(
        "Studio has no specializations listed - this is important for gaming industry classification",
      );
    }

    return {
      errors,
      warnings,
    };
  } catch (_error) {
    return {
      isValid: false,
      errors: [`Validation failed with error: ${error.message}`],
      warnings,
    };
  }
}

export {
  normalizeURL,
  normalizeEmployeeCount,
  normalizeStudioType,
  parseLocationString,
  cleanSpecializations,
  generateStudioId,
};
