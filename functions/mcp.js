import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { BoardService } from "./board-service.js";

export const createMcpServer = (user) => {
    const server = new McpServer({
        name: "Chasse aux Renards MCP",
        version: "1.0.0"
    });

    server.registerTool(
        "list_boards",
        {
            description: "List available reward boards.",
            inputSchema: {} // Empty schema
        },
        async () => {
             const results = await BoardService.listBoards(user);
             return {
                 content: [{
                     type: "text",
                     text: JSON.stringify(results, null, 2)
                 }]
             };
        }
    );

    server.registerTool(
        "list_rewards",
        {
            description: "List rewards for a specific board.",
            inputSchema: {
                boardId: z.string().describe("The ID of the board")
            }
        },
        async ({ boardId }) => {
            const results = await BoardService.listRewards(user, boardId);
            return {
                content: [{ type: "text", text: JSON.stringify(results, null, 2) }]
            };
        }
    );

    server.registerTool(
        "add_reward",
        {
            description: "Add a new reward to a board.",
            inputSchema: {
                boardId: z.string(),
                name: z.string(),
                cost: z.number().int(),
                icon: z.string().max(10).regex(/^[\p{Emoji}]+$/u, "Must be emoji characters only").optional()
            }
        },
        async ({ boardId, name, cost, icon }) => {
            const id = await BoardService.addReward(user, boardId, { name, cost, icon });
            return {
                content: [{ type: "text", text: `Reward added with ID: ${id}` }]
            };
        }
    );

    server.registerTool(
        "delete_reward",
        {
            description: "Delete a reward.",
            inputSchema: {
                boardId: z.string(),
                rewardId: z.string()
            }
        },
        async ({ boardId, rewardId }) => {
            await BoardService.deleteReward(user, boardId, rewardId);
            return { content: [{ type: "text", text: "Reward deleted successfully" }] };
        }
    );

    server.registerTool(
        "update_reward",
        {
            description: "Update an existing reward.",
            inputSchema: {
                boardId: z.string(),
                rewardId: z.string(),
                name: z.string().optional(),
                cost: z.number().int().optional(),
                icon: z.string().max(10).regex(/^[\p{Emoji}]+$/u, "Must be emoji characters only").optional()
            }
        },
        async ({ boardId, rewardId, name, cost, icon }) => {
            await BoardService.updateReward(user, boardId, rewardId, { name, cost, icon });
            return { content: [{ type: "text", text: "Reward updated successfully" }] };
        }
    );

    return server;
};
