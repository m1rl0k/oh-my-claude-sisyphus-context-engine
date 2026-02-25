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
export function createExaServer(apiKey?: string): McpServerConfig {
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
export function createContext7Server(): McpServerConfig {
  return {
    command: 'npx',
    args: ['-y', '@upstash/context7-mcp']
  };
}

/**
 * Playwright MCP Server - Browser automation
 * Enables agents to interact with web pages
 */
export function createPlaywrightServer(): McpServerConfig {
  return {
    command: 'npx',
    args: ['-y', '@playwright/mcp@latest']
  };
}

/**
 * Filesystem MCP Server - Extended file operations
 * Provides additional file system capabilities
 */
export function createFilesystemServer(allowedPaths: string[]): McpServerConfig {
  return {
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', ...allowedPaths]
  };
}

/**
 * Memory MCP Server - Persistent memory
 * Allows agents to store and retrieve information across sessions
 */
export function createMemoryServer(): McpServerConfig {
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
 * - CONTEXT_ENGINE_BASE_URL: Base URL override (default: http://localhost)
 * - CONTEXT_ENGINE_INDEXER_URL: Full indexer URL override
 * - CONTEXT_ENGINE_MEMORY_URL: Full memory URL override
 * - CONTEXT_ENGINE_DISABLED: Set to "true" to disable both MCPs
 */
function getContextEngineConfig(): { indexer: RemoteMcpServerConfig; memory: RemoteMcpServerConfig } | null {
  if (process.env.CONTEXT_ENGINE_DISABLED === 'true') return null;

  const baseUrl = process.env.CONTEXT_ENGINE_BASE_URL ?? 'http://localhost';
  const apiToken = process.env.CONTEXT_ENGINE_API_TOKEN ?? '';

  const indexerUrl =
    process.env.CONTEXT_ENGINE_INDEXER_URL ??
    (baseUrl.startsWith('http://localhost')
      ? `${baseUrl}:8003/mcp`
      : `${baseUrl}/indexer/mcp`);

  const memoryUrl =
    process.env.CONTEXT_ENGINE_MEMORY_URL ??
    (baseUrl.startsWith('http://localhost')
      ? `${baseUrl}:8002/mcp`
      : `${baseUrl}/memory/mcp`);

  const headers: Record<string, string> = apiToken
    ? { Authorization: `Bearer ${apiToken}` }
    : {};

  return {
    indexer: { url: indexerUrl, ...(apiToken ? { headers } : {}) },
    memory: { url: memoryUrl, ...(apiToken ? { headers } : {}) },
  };
}

export function createContextEngineIndexerServer(): RemoteMcpServerConfig | null {
  return getContextEngineConfig()?.indexer ?? null;
}

export function createContextEngineMemoryServer(): RemoteMcpServerConfig | null {
  return getContextEngineConfig()?.memory ?? null;
}

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

export function getDefaultMcpServers(options?: {
  exaApiKey?: string;
  enableExa?: boolean;
  enableContext7?: boolean;
  enablePlaywright?: boolean;
  enableMemory?: boolean;
  enableContextEngine?: boolean;
}): McpServersConfig {
  const servers: McpServersConfig = {};

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
    if (ceIndexer) servers['context-engine-indexer'] = ceIndexer;
    if (ceMemory) servers['context-engine-memory'] = ceMemory;
  }

  return servers;
}

/**
 * Convert MCP servers config to SDK format
 * Supports both stdio (McpServerConfig) and remote (RemoteMcpServerConfig) servers.
 */
export function toSdkMcpFormat(servers: McpServersConfig): Record<string, McpServerConfig | RemoteMcpServerConfig> {
  const result: Record<string, McpServerConfig | RemoteMcpServerConfig> = {};

  for (const [name, config] of Object.entries(servers)) {
    if (config) {
      result[name] = config;
    }
  }

  return result;
}
