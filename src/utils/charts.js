import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
);

import { getCssVar, colorToken, toRgba } from '@/shared/utils/designTokens'

export function getChartTheme(themeName = "light") {
  const primary = colorToken('primary-500', '#667eea');
  const secondary = getCssVar('--color-primary-alt', '#764ba2');
  const success = colorToken('success-500', '#20c997');
  const warning = colorToken('warning-500', '#f9c74f');
  const info = colorToken('info-500', '#17a2b8');
  const danger = colorToken('danger-500', '#dc3545');
  const text = colorToken('text-primary', themeName === 'dark' ? '#ffffff' : '#333333');
  const grid = themeName === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";

  const palette = [primary, secondary, success, warning, info, danger];
  return {
    backgroundColor: palette.slice(0, 5).map((c) => toRgba(c, 0.8)),
    borderColor: palette.slice(0, 5).map((c) => toRgba(c, 1)),
    textColor: text,
    gridColor: grid,
  };
}

// Precomputed reusable theme cache (light/dark) to reduce repeated token lookups
export const CHART_THEMES = {
  light: getChartTheme('light'),
  dark: getChartTheme('dark')
};

// Chart configuration generator
export class ChartConfigGenerator {
  static getSkillsRadarConfig(skillsData, theme = "light") {
    const themeColors = getChartTheme(theme);

    return {
      type: "radar",
      data: {
        labels: skillsData.map((skill) => skill.name),
        datasets: [
          {
            label: "Skill Level",
            data: skillsData.map((skill) => skill.level || 0),
            backgroundColor: toRgba(getCssVar("--color-info-500", colorToken('info-500')), 0.2),
            borderColor: toRgba(getCssVar("--color-info-500", colorToken('info-500')), 1),
            pointBackgroundColor: toRgba(getCssVar("--color-info-500", colorToken('info-500')), 1),
            pointBorderColor: toRgba(colorToken('bg-primary', '#ffffff'), 1),
            pointHoverBackgroundColor: toRgba(colorToken('bg-primary', '#ffffff'), 1),
            pointHoverBorderColor: toRgba(getCssVar("--color-info-500", colorToken('info-500')), 1),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          line: {
            borderWidth: 3,
          },
        },
        scales: {
          r: {
            angleLines: {
              display: false,
            },
            suggestedMin: 0,
            suggestedMax: 5,
            ticks: {
              color: themeColors.textColor,
            },
            grid: {
              color: themeColors.gridColor,
            },
          },
        },
        plugins: {
          legend: {
            position: "top",
            labels: {
              color: themeColors.textColor,
            },
          },
        },
      },
    };
  }

  static getSkillCategoryPieConfig(skillsData, theme = "light") {
    const themeColors = getChartTheme(theme);
    const categories = skillsData.reduce((acc, skill) => {
      acc[skill.category] = (acc[skill.category] || 0) + 1;
      return acc;
    }, {});

    return {
      type: "pie",
      data: {
        labels: Object.keys(categories),
        datasets: [
          {
            data: Object.values(categories),
            backgroundColor: themeColors.backgroundColor,
            borderColor: themeColors.borderColor,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: {
              color: themeColors.textColor,
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || "";
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              },
            },
          },
        },
      },
    };
  }

  static getExperienceTimelineConfig(experienceData, theme = "light") {
    const themeColors = getChartTheme(theme);

    // Convert experience data to timeline format
    const timelineData = experienceData.map((exp) => ({
      company: exp.company,
      startYear: new Date(exp.startDate).getFullYear(),
      endYear: exp.current
        ? new Date().getFullYear()
        : new Date(exp.endDate).getFullYear(),
      duration: exp.current
        ? new Date().getFullYear() - new Date(exp.startDate).getFullYear()
        : new Date(exp.endDate).getFullYear() -
          new Date(exp.startDate).getFullYear(),
    }));

    return {
      type: "bar",
      data: {
        labels: timelineData.map((exp) => exp.company),
        datasets: [
          {
            label: "Years of Experience",
            data: timelineData.map((exp) => exp.duration),
            backgroundColor: themeColors.backgroundColor[0],
            borderColor: themeColors.borderColor[0],
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              color: themeColors.textColor,
            },
            grid: {
              color: themeColors.gridColor,
            },
          },
          y: {
            ticks: {
              color: themeColors.textColor,
            },
            grid: {
              color: themeColors.gridColor,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const exp = timelineData[context.dataIndex];
                return `${exp.startYear} - ${exp.endYear}: ${context.parsed.x} years`;
              },
            },
          },
        },
      },
    };
  }

  static getJobSearchProgressConfig(searchData, theme = "light") {
  const themeColors = CHART_THEMES[theme] || getChartTheme(theme);

    return {
      type: "line",
      data: {
        labels: searchData.map((d) => new Date(d.date).toLocaleDateString()),
        datasets: [
          {
            label: "Applications Sent",
            data: searchData.map((d) => d.applications || 0),
            borderColor: themeColors.borderColor[0],
            backgroundColor: themeColors.backgroundColor[0],
            fill: false,
          },
          {
            label: "Interviews",
            data: searchData.map((d) => d.interviews || 0),
            borderColor: themeColors.borderColor[1],
            backgroundColor: themeColors.backgroundColor[1],
            fill: false,
          },
          {
            label: "Offers",
            data: searchData.map((d) => d.offers || 0),
            borderColor: themeColors.borderColor[2],
            backgroundColor: themeColors.backgroundColor[2],
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: {
              color: themeColors.textColor,
            },
            grid: {
              color: themeColors.gridColor,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: themeColors.textColor,
            },
            grid: {
              color: themeColors.gridColor,
            },
          },
        },
        plugins: {
          legend: {
            position: "top",
            labels: {
              color: themeColors.textColor,
            },
          },
        },
      },
    };
  }

  static getSkillDemandConfig(skillDemandData, theme = "light") {
  const themeColors = CHART_THEMES[theme] || getChartTheme(theme);

    return {
      type: "bar",
      data: {
        labels: skillDemandData.map((skill) => skill.name),
        datasets: [
          {
            label: "Market Demand",
            data: skillDemandData.map((skill) => skill.demand || 0),
            backgroundColor: themeColors.backgroundColor,
            borderColor: themeColors.borderColor,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: {
              color: themeColors.textColor,
            },
            grid: {
              color: themeColors.gridColor,
            },
          },
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              color: themeColors.textColor,
              callback: function (value) {
                return value + "%";
              },
            },
            grid: {
              color: themeColors.gridColor,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `Market Demand: ${context.parsed.y}%`;
              },
            },
          },
        },
      },
    };
  }

  static getResumeScoreConfig(scoreData, theme = "light") {
  const themeColors = CHART_THEMES[theme] || getChartTheme(theme);

    return {
      type: "doughnut",
      data: {
        labels: ["Score", "Remaining"],
        datasets: [
          {
            data: [scoreData.score, 100 - scoreData.score],
            backgroundColor: [
              scoreData.score >= 80
                ? colorToken('success-500')
                : scoreData.score >= 60
                  ? colorToken('warning-500')
                  : colorToken('danger-500'),
              (theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
            ],
            borderColor: [
              scoreData.score >= 80
                ? colorToken('success-500')
                : scoreData.score >= 60
                  ? colorToken('warning-500')
                  : colorToken('danger-500'),
              (theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
            ],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                if (context.dataIndex === 0) {
                  return `Resume Score: ${context.parsed}%`;
                }
                return null;
              },
            },
          },
        },
      },
    };
  }
}

// Utility functions for chart data processing
export const chartUtils = {
  // Group skills by category
  groupSkillsByCategory(skills) {
    return skills.reduce((acc, skill) => {
      const category = skill.category || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(skill);
      return acc;
    }, {});
  },

  // Calculate skill level averages
  calculateSkillAverages(skills) {
    const grouped = this.groupSkillsByCategory(skills);
    const averages = {};

    for (const [category, categorySkills] of Object.entries(grouped)) {
      const total = categorySkills.reduce(
        (sum, skill) => sum + (skill.level || 0),
        0,
      );
      averages[category] = total / categorySkills.length;
    }

    return averages;
  },

  // Generate color palette
  generateColors(count, alpha = 0.8) {
    const colors = [];
    const hueStep = 360 / count;

    for (let i = 0; i < count; i++) {
      const hue = i * hueStep;
      colors.push(`hsla(${hue}, 70%, 60%, ${alpha})`);
    }

    return colors;
  },

  // Format dates for timeline charts
  formatTimelineData(data, dateField, valueField) {
    return data
      .sort((a, b) => new Date(a[dateField]) - new Date(b[dateField]))
      .map((item) => ({
        x: new Date(item[dateField]).toLocaleDateString(),
        y: item[valueField] || 0,
      }));
  },

  // Calculate moving average
  calculateMovingAverage(data, windowSize = 3) {
    const result = [];

    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const window = data.slice(start, i + 1);
      const average = window.reduce((sum, val) => sum + val, 0) / window.length;
      result.push(average);
    }

    return result;
  },
};

export default ChartConfigGenerator;
