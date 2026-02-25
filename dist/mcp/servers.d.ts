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
export interface McpServerConfig {
    command: string;
    args: string[];
    env?: Record<string, string>;
}
/**
 * Remote MCP server config for HTTP/SSE-based MCP servers.
 * Used by Context-Engine SaaS and other remote MCP endpoints.
 */
export interface RemoteMcpServerConfig {
    url: string;
    headers?: Record<string, string>;
}
/**
 * Exa MCP Server - AI-powered web search
 * Requires: EXA_API_KEY environment variable
 */
export declare function createExaServer(apiKey?: string): McpServerConfig;
/**
 * Context7 MCP Server - Official documentation lookup
 * Provides access to official docs for popular libraries
 */
export declare function createContext7Server(): McpServerConfig;
/**
 * Playwright MCP Server - Browser automation
 * Enables agents to interact with web pages
 */
export declare function createPlaywrightServer(): McpServerConfig;
/**
 * Filesystem MCP Server - Extended file operations
 * Provides additional file system capabilities
 */
export declare function createFilesystemServer(allowedPaths: string[]): McpServerConfig;
/**
 * Memory MCP Server - Persistent memory
 * Allows agents to store and retrieve information across sessions
 */
export declare function createMemoryServer(): McpServerConfig;
export declare function createContextEngineIndexerServer(): RemoteMcpServerConfig | null;
export declare function createContextEngineMemoryServer(): RemoteMcpServerConfig | null;
/**
 * Get all default MCP servers for the OMC system
 */
export interface McpServersConfig {
    exa?: McpServerConfig;
    context7?: McpServerConfig;
    playwright?: McpServerConfig;
    memory?: McpServerConfig;
    'context-engine-indexer'?: RemoteMcpServerConfig;
    'context-engine-memory'?: RemoteMcpServerConfig;
}
export declare function getDefaultMcpServers(options?: {
    exaApiKey?: string;
    enableExa?: boolean;
    enableContext7?: boolean;
    enablePlaywright?: boolean;
    enableMemory?: boolean;
    enableContextEngine?: boolean;
}): McpServersConfig;
/**
 * Convert MCP servers config to SDK format
 * Supports both stdio (McpServerConfig) and remote (RemoteMcpServerConfig) servers.
 */
export declare function toSdkMcpFormat(servers: McpServersConfig): Record<string, McpServerConfig | RemoteMcpServerConfig>;
//# sourceMappingURL=servers.d.ts.map