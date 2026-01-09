/**
 * MCP Server for Chasse aux Renards
 * Deployed as a Firebase Cloud Function (HTTPS Trigger)
 * 
 * Uses stateless HTTP-only transport (no SSE) to avoid constant reconnection costs.
 */

import { onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";

import express from "express";
import cors from "cors";
import { createMcpServer } from "./mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { auth } from "./auth.js";

// Initialize Firebase Admin (Default Credentials)
initializeApp();

const app = express();
app.use(cors({ origin: true }));
app.use(auth);

app.all("/", async (req, res) => {
    // Reject GET requests - SSE not supported for serverless cost optimization
    if (req.method === 'GET') {
        return res.status(405).json({ 
            error: "SSE not supported. Use POST for JSON-RPC requests." 
        });
    }

    // Initialize stateless transport with JSON responses (no SSE)
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,  // Stateless mode
        enableJsonResponse: true,       // JSON responses instead of SSE
    });
    
    const mcpServer = createMcpServer(req.user);
    await mcpServer.connect(transport);

    // Handle POST (JSON-RPC tool calls)
    try {
        await transport.handleRequest(req, res);
    } catch (err) {
        console.error("Error handling MCP request:", err);
        if (!res.headersSent) {
            res.status(500).json({ error: err.message });
        }
    }
});

export const mcp = onRequest({ region: 'europe-west9', maxInstances: 1 }, app);

