/**
 * MCP Server Configurations
 *
 * Predefined MCP server configurations for common integrations:
 * - Exa: AI-powered web search
 * - Context7: Official documentation lookup
 * - Playwright: Browser automation
 * - Filesystem: Sandboxed file system access
 * - Memory: Persistent knowledge graph
 * - Context-Engine: Semantic code search and memory (SaaS, remote HTTP)
 */
/**
 * Exa MCP Server - AI-powered web search
 * Requires: EXA_API_KEY environment variable
 */
export function createExaServer(apiKey) {
    return {
        command: 'npx',
        args: ['-y', 'exa-mcp-server'],
        env: apiKey ? { EXA_API_KEY: apiKey } : undefined
    };
}
/**
 * Context7 MCP Server - Official documentation lookup
 * Provides access to official docs for popular libraries
 */
export function createContext7Server() {
    return {
        command: 'npx',
        args: ['-y', '@upstash/context7-mcp']
    };
}
/**
 * Playwright MCP Server - Browser automation
 * Enables agents to interact with web pages
 */
export function createPlaywrightServer() {
    return {
        command: 'npx',
        args: ['-y', '@playwright/mcp@latest']
    };
}
/**
 * Filesystem MCP Server - Extended file operations
 * Provides additional file system capabilities
 */
export function createFilesystemServer(allowedPaths) {
    return {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem', ...allowedPaths]
    };
}
/**
 * Memory MCP Server - Persistent memory
 * Allows agents to store and retrieve information across sessions
 */
export function createMemoryServer() {
    return {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-memory']
    };
}
/**
 * Context-Engine MCP Server - Semantic code search and memory (SaaS)
 *
 * Two endpoints:
 * - Indexer: Code indexing, symbol graphs, semantic search, graph queries
 * - Memory: Persistent memory store, context search, memory find
 *
 * Environment variables:
 * - CONTEXT_ENGINE_API_TOKEN: Bearer token for SaaS auth (e.g. ctxce_xxx)
 * - CONTEXT_ENGINE_BASE_URL: SaaS base URL (default: https://dev.context-engine.ai)
 * - CONTEXT_ENGINE_INDEXER_URL: Full indexer URL override
 * - CONTEXT_ENGINE_MEMORY_URL: Full memory URL override
 * - CONTEXT_ENGINE_DISABLED: Set to "true" to disable both MCPs
 */
function getContextEngineConfig() {
    if (process.env.CONTEXT_ENGINE_DISABLED === 'true')
        return null;
    const baseUrl = (process.env.CONTEXT_ENGINE_BASE_URL ?? 'https://dev.context-engine.ai').replace(/\/$/, '');
    const apiToken = process.env.CONTEXT_ENGINE_API_TOKEN ?? '';
    const indexerUrl = process.env.CONTEXT_ENGINE_INDEXER_URL ?? `${baseUrl}/indexer/mcp`;
    const memoryUrl = process.env.CONTEXT_ENGINE_MEMORY_URL ?? `${baseUrl}/memory/mcp`;
    const headers = apiToken
        ? { Authorization: `Bearer ${apiToken}` }
        : {};
    return {
        indexer: { url: indexerUrl, ...(apiToken ? { headers } : {}) },
        memory: { url: memoryUrl, ...(apiToken ? { headers } : {}) },
    };
}
export function createContextEngineIndexerServer() {
    return getContextEngineConfig()?.indexer ?? null;
}
export function createContextEngineMemoryServer() {
    return getContextEngineConfig()?.memory ?? null;
}
export function getDefaultMcpServers(options) {
    const servers = {};
    if (options?.enableExa !== false) {
        servers.exa = createExaServer(options?.exaApiKey);
    }
    if (options?.enableContext7 !== false) {
        servers.context7 = createContext7Server();
    }
    if (options?.enablePlaywright) {
        servers.playwright = createPlaywrightServer();
    }
    if (options?.enableMemory) {
        servers.memory = createMemoryServer();
    }
    if (options?.enableContextEngine !== false) {
        const ceIndexer = createContextEngineIndexerServer();
        const ceMemory = createContextEngineMemoryServer();
        if (ceIndexer)
            servers['context-engine-indexer'] = ceIndexer;
        if (ceMemory)
            servers['context-engine-memory'] = ceMemory;
    }
    return servers;
}
/**
 * Convert MCP servers config to SDK format
 * Supports both stdio (McpServerConfig) and remote (RemoteMcpServerConfig) servers.
 */
export function toSdkMcpFormat(servers) {
    const result = {};
    for (const [name, config] of Object.entries(servers)) {
        if (config) {
            result[name] = config;
        }
    }
    return result;
}
//# sourceMappingURL=servers.js.map