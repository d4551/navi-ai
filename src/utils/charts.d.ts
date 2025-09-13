export interface ChartTheme {
  backgroundColor: string[];
  borderColor: string[];
  textColor: string;
  gridColor: string;
}

export function getChartTheme(themeName?: string): ChartTheme;
