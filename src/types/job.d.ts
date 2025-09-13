
declare module "@/types/job" {
  export interface JobSearchResult {
    jobs: any[];
    total: number;
    page: number;
    limit: number;
    filters: any;
    aggregations: {
      companies: Array<{ name: string; count: number }>;
      technologies: Array<{ name: string; count: number }>;
      locations: Array<{ name: string; count: number }>;
      experienceLevels: Array<{ level: string; count: number }>;
      studioTypes: Array<{ type: string; count: number }>;
    };
  }

  export const ExperienceLevel = {
    ENTRY: "entry",
    JUNIOR: "junior",
    MID: "mid",
    SENIOR: "senior",
    PRINCIPAL: "principal",
    DIRECTOR: "director",
  } as const;

  export type ExperienceLevelType =
    (typeof ExperienceLevel)[keyof typeof ExperienceLevel];
}
