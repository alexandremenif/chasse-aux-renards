/**
 * MCP Server for Chasse aux Renards
 * Deployed as a Firebase Cloud Function (HTTPS Trigger)
 */

import { onRequest } from "firebase-functions/v2/https";
console.log("Loading functions/index.js...");
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import express from "express";
import cors from "cors";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// Initialize Firebase Admin (Default Credentials)
initializeApp();
export const db = getFirestore();

// Stateless Transport Implementation
class StatelessTransport {
    constructor(res) {
        this.res = res;
        this.responsePromise = new Promise((resolve) => {
            this.startedResponse = resolve;
        });
    }
    async start() {}
    async close() {}
    async send(message) {
        if (!this.res.headersSent) {
            this.res.json(message);
        } else {
            console.warn("Headers already sent, could not send message");
        }
        this.startedResponse();
    }
}

// Authentication Middleware
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error("Missing or invalid Authorization header");
        return res.status(401).json({ error: "Unauthorized: Missing Bearer token" });
    }

    const token = authHeader.split(' ')[1];

    try {
        const snapshot = await db.collection("api_keys")
            .where("key", "==", token)
            .limit(1)
            .get();

        if (snapshot.empty) {
            console.error("Invalid API Key");
            return res.status(401).json({ error: "Unauthorized: Invalid token" });
        }

        const keyDoc = snapshot.docs[0].data();
        const uid = keyDoc.uid;

        const userDoc = await db.collection("users").doc(uid).get();
        if (!userDoc.exists) {
            console.error("User not found for this key");
            return res.status(403).json({ error: "Forbidden: User not found" });
        }

        const userData = userDoc.data();
        
        req.user = {
            uid: uid,
            isParent: userData.isParent || false,
            boardIds: userData.boardIds || [] 
        };
        
        next();
    } catch (error) {
        console.error("Auth Error:", error);
        return res.status(500).json({ error: "Internal Server Error during Auth" });
    }
};

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());
app.use(authMiddleware);

// -- Tools & Business Logic --

export const createMcpServer = (user) => {
    const server = new Server({
        name: "Chasse aux Renards MCP",
        version: "1.0.0"
    }, {
        capabilities: {
            tools: {}
        }
    });

    const verifyBoardAccess = (boardId) => {
        if (!user.boardIds.includes(boardId)) {
            throw new Error(`Access denied: User does not have access to board ${boardId}`);
        }
    };

    // Tools Definitions
    const tools = {
        "list_boards": {
            description: "List available reward boards.",
            inputSchema: { type: "object", properties: {} },
            handler: async () => {
                if (user.boardIds.length === 0) return { content: [{ type: "text", text: "[]" }] };
                
                const refs = user.boardIds.map(id => db.collection("boards").doc(id));
                const boards = await db.getAll(...refs);
                
                const results = boards
                    .filter(doc => doc.exists)
                    .map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            owner: data.owner,
                            totalToken: data.totalToken
                        };
                    });

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(results, null, 2)
                    }]
                };
            }
        },
        "list_rewards": {
            description: "List rewards for a specific board.",
            inputSchema: {
                type: "object",
                properties: {
                    boardId: { type: "string", description: "The ID of the board" }
                },
                required: ["boardId"]
            },
            handler: async ({ boardId }) => {
                verifyBoardAccess(boardId);
                const rewardsSnap = await db.collection("boards").doc(boardId).collection("rewards").get();
                const rewards = [];
                rewardsSnap.forEach(doc => {
                     rewards.push({ id: doc.id, ...doc.data() });
                });
                return {
                    content: [{ type: "text", text: JSON.stringify(rewards, null, 2) }]
                };
            }
        },
        "add_reward": {
            description: "Add a new reward to a board.",
            inputSchema: {
                type: "object",
                properties: {
                    boardId: { type: "string" },
                    name: { type: "string" },
                    cost: { type: "integer" },
                    icon: { type: "string" }
                },
                required: ["boardId", "name", "cost"]
            },
            handler: async ({ boardId, name, cost, icon }) => {
                verifyBoardAccess(boardId);
                const newReward = {
                    name,
                    cost,
                    icon: icon || "🎁",
                    pending: false,
                    createdAt: new Date()
                };
                const docRef = await db.collection("boards").doc(boardId).collection("rewards").add(newReward);
                return {
                    content: [{ type: "text", text: `Reward added with ID: ${docRef.id}` }]
                };
            }
        },
        "delete_reward": {
            description: "Delete a reward.",
            inputSchema: {
                type: "object",
                properties: {
                    boardId: { type: "string" },
                    rewardId: { type: "string" }
                },
                required: ["boardId", "rewardId"]
            },
            handler: async ({ boardId, rewardId }) => {
                verifyBoardAccess(boardId);
                await db.collection("boards").doc(boardId).collection("rewards").doc(rewardId).delete();
                return { content: [{ type: "text", text: "Reward deleted successfully" }] };
            }
        },
        "update_reward": {
            description: "Update an existing reward.",
            inputSchema: {
                type: "object",
                properties: {
                    boardId: { type: "string" },
                    rewardId: { type: "string" },
                    name: { type: "string" },
                    cost: { type: "integer" },
                    icon: { type: "string" }
                },
                required: ["boardId", "rewardId"]
            },
            handler: async ({ boardId, rewardId, name, cost, icon }) => {
                verifyBoardAccess(boardId);
                const boardRef = db.collection("boards").doc(boardId);
                const rewardRef = boardRef.collection("rewards").doc(rewardId);

                await db.runTransaction(async (transaction) => {
                    const boardDoc = await transaction.get(boardRef);
                    const rewardDoc = await transaction.get(rewardRef);

                    if (!boardDoc.exists || !rewardDoc.exists) throw new Error("Board or Reward not found");

                    const boardData = boardDoc.data();
                    const rewardData = rewardDoc.data();
                    const updates = {};

                    if (name) updates.name = name;
                    if (icon) updates.icon = icon;
                    if (cost !== undefined) {
                        updates.cost = cost;
                        if (cost > rewardData.cost && rewardData.pending) {
                             const allRewards = await transaction.get(boardRef.collection("rewards").where("pending", "==", true));
                             let pendingSum = 0;
                             allRewards.forEach(doc => {
                                 if (doc.id === rewardId) return; 
                                 pendingSum += doc.data().cost;
                             });
                             const newRequirement = pendingSum + cost;
                             if (boardData.totalToken < newRequirement) {
                                 updates.pending = false; 
                             }
                        }
                    }
                    transaction.update(rewardRef, updates);
                });

                return { content: [{ type: "text", text: "Reward updated successfully" }] };
            }
        }
    };

    // Register Call Tool Handler
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const toolName = request.params.name;
        const tool = tools[toolName];
        if (!tool) {
            throw new Error(`Tool not found: ${toolName}`);
        }
        
        try {
            return await tool.handler(request.params.arguments);
        } catch (e) {
            return {
                content: [{ type: "text", text: `Error: ${e.message}` }],
                isError: true
            };
        }
    });

    // Register List Tools Handler
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
            tools: Object.entries(tools).map(([name, def]) => ({
                name,
                description: def.description,
                inputSchema: def.inputSchema
            }))
        };
    });

    return server;
};

app.post("/messages", async (req, res) => {
    
    const transport = new StatelessTransport(res);
    const mcpServer = createMcpServer(req.user);

    await mcpServer.connect(transport);
    
    // Process the incoming JSON-RPC message
    // The transport.onmessage call feeds the message into the MCP server
    if (transport.onmessage) {
        try {
            
            // Allow the processing to start
            const processingPromise = transport.onmessage(req.body);

            // If it's a request (has 'id'), we MUST wait for the response (transport.send)
            if (req.body.id !== undefined && req.body.id !== null) {
                // Race the response against a safety timeout (e.g., 55s for Firebase)
                // Or just await responsePromise. To be safe, let's just await the response.
                await transport.responsePromise;
            } else {
                // It's a notification, just wait for processing to finish then 202
                await processingPromise;
                if (!res.headersSent) {
                    res.status(202).end();
                }
            }
            
        } catch (err) {
            console.error("Error during transport.onmessage:", err);
            if (!res.headersSent) {
                res.status(500).json({ error: err.message });
            }
        }
    } else {
        console.error("transport.onmessage is NOT defined after connect()");
    }
});

export const mcp = onRequest({ region: 'europe-west9', maxInstances: 1 }, app);
