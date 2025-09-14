
interface NodeRedConfig {
  baseUrl: string;
  adminAuth?: {
    username: string;
    password: string;
  };
  enableWebSockets: boolean;
  customNodePath?: string;
}

interface NodeRedFlow {
  id: string;
  label: string;
  type: string;
  nodes: NodeRedNode[];
  disabled?: boolean;
}

interface NodeRedNode {
  id: string;
  type: string;
  name?: string;
  x: number;
  y: number;
  z: string; // flow id
  wires: string[][];
  properties?: Record<string, any>;
}

interface CustomNode {
  name: string;
  category: "ai" | "career" | "gaming" | "data";
  inputs: number;
  outputs: number;
  icon: string;
  color: string;
  paletteLabel: string;
  defaults: Record<string, any>;
  oneditsave?: string;
  oneditdelete?: string;
}

import { logger } from "@/shared/utils/logger";

class NodeRedService {
  private config: NodeRedConfig | null = null;
  private ws: WebSocket | null = null;
  private flows: Map<string, NodeRedFlow> = new Map();
  private customNodes: Map<string, CustomNode> = new Map();

  async initialize(config?: NodeRedConfig): Promise<void> {
    // Provide default configuration if none supplied
    const envBase = (
      typeof import.meta !== "undefined"
        ? (import.meta as any)?.env?.VITE_NODE_RED_BASE_URL
        : undefined
    ) as string | undefined;
    this.config = config || {
      enableWebSockets: false,
    };

    try {
      // Test connection
      const response = await fetch(`${this.config.baseUrl}/flows`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Node-RED connection failed: ${response.statusText}`);
      }

      // Initialize WebSocket if enabled
      if (this.config.enableWebSockets) {
        await this.initializeWebSocket();
      }

      // Register custom nodes
      await this.registerCustomNodes();

    } catch (error: any) {
      // Check for CSP violations specifically
      if (
        error.message &&
        (error.message.includes("Content Security Policy") ||
          error.message.includes(
            "violates the following Content Security Policy directive",
          ))
      ) {
        logger.warn(
          {
            url: this.config?.baseUrl,
            error: error.message,
          },
        );
        // Don't throw for CSP errors - graceful degradation
        return;
      } else if (
        error.message &&
        (error.message.includes("Failed to fetch") ||
          error.message.includes("ERR_CONNECTION_REFUSED") ||
          error.name === "TypeError")
      ) {
        logger.info(
          {
            url: this.config?.baseUrl,
            suggestion: "Run: npm install -g node-red && node-red",
          },
        );
        // Don't throw for connection errors - graceful degradation
        return;
      } else {
        logger.error("[✗] Node-RED initialization failed:", error);
        // Only throw for unexpected errors
        throw error;
      }
    }
  }

  private async initializeWebSocket(): Promise<void> {
    if (!this.config) return;

    const wsUrl = this.config.baseUrl.replace("http", "ws") + "/comms";

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {

        // Subscribe to flow events
        this.ws?.send(
          JSON.stringify({
            subscribe: "flows",
          }),
        );

        resolve();
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleWebSocketMessage(_data);
      };

      this.ws.onerror = (_error) => {
        logger.error("Node-RED WebSocket error:", error);
        reject(_error);
      };

      this.ws.onclose = () => {
        logger.warn("Node-RED WebSocket disconnected");
      };
    });
  }

  private handleWebSocketMessage(data: any): void {
    switch (data.topic) {
      case "flows":
        this.handleFlowUpdate(data.data);
        break;
      case "debug":
        this.handleDebugMessage(data.data);
        break;
      default:
        console.log("Node-RED message:", data);
    }
  }

  private handleFlowUpdate(flowData: any): void {
    if (flowData.id) {
      this.flows.set(flowData.id, flowData);
    }
  }

  private handleDebugMessage(debugData: any): void {
    // Forward debug messages to app logger
    console.debug("Node-RED Debug:", debugData);
  }

  async getFlows(): Promise<NodeRedFlow[]> {
    if (!this.config) throw new Error("Service not initialized");

    try {
      const response = await fetch(`${this.config.baseUrl}/flows`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch flows: ${response.statusText}`);
      }

      const flows = await response.json();

      // Update local cache
      flows.forEach((flow: NodeRedFlow) => {
        this.flows.set(flow.id, flow);
      });

      return flows;
    } catch (error: any) {
      // Handle CSP violations and connection errors gracefully
      if (
        error.message &&
        (error.message.includes("Content Security Policy") ||
          error.message.includes(
            "violates the following Content Security Policy directive",
          ) ||
          error.message.includes("Failed to fetch"))
      ) {
        logger.warn(
          "Node-RED connection blocked. Returning empty flows list.",
          {
            url: this.config?.baseUrl,
            error: error.message,
          },
        );
        return []; // Return empty array instead of throwing
      }

      // Re-throw unexpected errors
      throw error;
    }
  }

  async createFlow(flow: Omit<NodeRedFlow, "id">): Promise<string> {
    if (!this.config) throw new Error("Service not initialized");

    const flowWithId = {
      ...flow,
      id: this.generateId(),
    };

    const response = await fetch(`${this.config.baseUrl}/flow`, {
      method: "POST",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(flowWithId),
    });

    if (!response.ok) {
      throw new Error(`Failed to create flow: ${response.statusText}`);
    }

    const __result = await response.json();
    this.flows.set(flowWithId.id, flowWithId);

    return flowWithId.id;
  }

  async updateFlow(
    flowId: string,
    updates: Partial<NodeRedFlow>,
  ): Promise<void> {
    if (!this.config) throw new Error("Service not initialized");

    const existingFlow = this.flows.get(flowId);
    if (!existingFlow) {
      throw new Error(`Flow ${flowId} not found`);
    }

    const updatedFlow = { ...existingFlow, ...updates };

    const response = await fetch(`${this.config.baseUrl}/flow/${flowId}`, {
      method: "PUT",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedFlow),
    });

    if (!response.ok) {
      throw new Error(`Failed to update flow: ${response.statusText}`);
    }

    this.flows.set(flowId, updatedFlow);
  }

  async deleteFlow(flowId: string): Promise<void> {
    if (!this.config) throw new Error("Service not initialized");

    const response = await fetch(`${this.config.baseUrl}/flow/${flowId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete flow: ${response.statusText}`);
    }

    this.flows.delete(flowId);
  }

  async deployFlows(): Promise<void> {
    if (!this.config) throw new Error("Service not initialized");

    const response = await fetch(`${this.config.baseUrl}/flows`, {
      method: "POST",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        flows: Array.from(this.flows.values()),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to deploy flows: ${response.statusText}`);
    }

    console.log("[✓] Node-RED flows deployed");
  }

  async triggerFlow(flowId: string, payload?: any): Promise<any> {
    if (!this.config) throw new Error("Service not initialized");

    const response = await fetch(`${this.config.baseUrl}/inject/${flowId}`, {
      method: "POST",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload || {}),
    });

    if (!response.ok) {
      throw new Error(`Failed to trigger flow: ${response.statusText}`);
    }

    return response.json();
  }

    return this.triggerFlow(flowId, payload);
  }

  async startFlow(flowId: string): Promise<void> {
    const flow = await this.getFlow(flowId);
    if (!flow) throw new Error(`Flow ${flowId} not found`);
    const updated: NodeRedFlow = { ...flow, disabled: false };
    await this.updateFlow(flowId, updated);
  }

  async stopFlow(flowId: string): Promise<void> {
    const flow = await this.getFlow(flowId);
    if (!flow) throw new Error(`Flow ${flowId} not found`);
    const updated: NodeRedFlow = { ...flow, disabled: true };
    await this.updateFlow(flowId, updated);
  }

  private async getFlow(flowId: string): Promise<NodeRedFlow | null> {
    if (this.flows.has(flowId)) return this.flows.get(flowId) as NodeRedFlow;
    try {
      const all = await this.getFlows();
      const found = all.find((f: any) => f.id === flowId) as
        | NodeRedFlow
        | undefined;
      return found || null;
    } catch {
      return null;
    }
  }

  private async registerCustomNodes(): Promise<void> {
    const careerNodes: CustomNode[] = [
      {
        name: "ai-resume-analyzer",
        category: "ai",
        icon: "file.png",
        paletteLabel: "AI Resume",
        defaults: {
          name: { value: "" },
          analysis_type: { value: "skills" },
        },
      },
      {
        name: "job-matcher",
        category: "career",
        icon: "bridge.png",
        paletteLabel: "Job Match",
        defaults: {
          name: { value: "" },
        },
      },
      {
        name: "gaming-skill-mapper",
        category: "gaming",
        icon: "gamepad.png",
        paletteLabel: "Skill Map",
        defaults: {
          name: { value: "" },
          game_genres: { value: [] },
          skill_categories: { value: ["technical", "soft"] },
        },
      },
    ];

    for (const node of careerNodes) {
      await this.registerCustomNode(node);
    }
  }

  private async registerCustomNode(node: CustomNode): Promise<void> {
    if (!this.config) return;

    const nodeDefinition = {
      ...node,
    };

    try {
      const response = await fetch(`${this.config.baseUrl}/nodes`, {
        method: "POST",
        headers: {
          ...this.getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nodeDefinition),
      });

      if (response.ok) {
        this.customNodes.set(node.name, node);
        console.log(`[✓] Custom node registered: ${node.name}`);
      }
    } catch (_error) {
      console.warn(
        `[WARNING] Failed to register custom node ${node.name}:`,
        error,
      );
    }
  }

    switch (node.category) {
      case "ai":
        return `
          const { canonicalAI } = require('./modules/ai/CanonicalAIService');
          
            try {
              const __result = await canonicalAI.generateText(msg.payload, {
                model: node.model,
                systemPrompt: 'You are an AI career assistant.'
              });
              
              if (result.success) {
                msg.payload = result.content;
                node.send([msg, null]);
              } else {
                msg.payload = result.error;
                node.send([null, msg]);
              }
            } catch (_error) {
              msg.payload = error.message;
              node.send([null, msg]);
            }
          });
        `;

      case "career":
        return `
          const { searchJobsUnified } = require('./services/JobAPIService');
          
            try {
              const profile = msg.payload.profile || {};
              const jobs = msg.payload.jobs || [];
              
              // Perform job matching logic
              const matches = jobs.filter(job => {
                // Simple matching algorithm
                const skillMatch = job.requiredSkills?.some(skill => 
                  profile.skills?.includes(skill)
                ) || false;
                
                return skillMatch;
              });
              
              msg.payload = {
                matches,
                count: matches.length,
                threshold: node.threshold
              };
              
              node.send(msg);
            } catch (_error) {
              msg.payload = error.message;
              node.error(error.message, msg);
            }
          });
        `;

      default:
        return `
            // Default pass-through
            node.send(msg);
          });
        `;
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (this.config?.adminAuth) {
      const credentials = btoa(
        `${this.config.adminAuth.username}:${this.config.adminAuth.password}`,
      );
      headers["Authorization"] = `Basic ${credentials}`;
    }

    return headers;
  }

  private generateId(): string {
  }

  // Flow templates for common career workflows
  getCareerFlowTemplates(): Record<string, Partial<NodeRedFlow>> {
    return {
      "resume-optimization": {
        label: "Resume Optimization Pipeline",
        type: "tab",
        nodes: [
          {
            type: "inject",
            name: "Trigger Resume Analysis",
            properties: {
              topic: "resume",
              payload: "{}",
            },
          },
          {
            type: "ai-resume-analyzer",
            name: "AI Analysis",
          },
        ],
      },

      "job-application-tracker": {
        label: "Job Application Tracking",
        type: "tab",
        nodes: [
          {
            type: "http in",
            name: "Job Application Webhook",
            properties: {
              method: "post",
              url: "/job-applied",
            },
          },
        ],
      },
    };
  }

  isHealthy(): boolean {
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const nodeRedService = new NodeRedService();
export default nodeRedService;
