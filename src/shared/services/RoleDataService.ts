import roleData from "@/shared/data/rolesData.json";

export interface RoleDetail {
  description: string;
  requiredSkills: string[];
  demandLevel: "low" | "medium" | "high";
}

class RoleDataService {
  private cache: Record<string, RoleDetail> | null = null;

  private async load(): Promise<Record<string, RoleDetail>> {
    if (this.cache) return this.cache;
    try {
      const parsed = roleData as unknown as Record<string, RoleDetail>;
      // normalize keys to lowercase for consistent lookups
      this.cache = Object.fromEntries(
        Object.entries(parsed).map(([key, value]) => [
          key.toLowerCase(),
          value,
        ]),
      );
    } catch (error) {
      console.warn("Failed to load role data:", error);
      this.cache = {};
    }
    return this.cache;
  }

  async getRole(roleName: string): Promise<RoleDetail | null> {
    const data = await this.load();
    return data[roleName.toLowerCase()] ?? null;
  }
}

export const roleDataService = new RoleDataService();
export type { RoleDetail };
