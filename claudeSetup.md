# Claude Desktop Setup Guide for Capacities MCP Server

This guide shows you how to connect Claude Desktop to your Capacities knowledge base using the MCP server in File mode (for free users without API access).

---

## Prerequisites

- [x] Claude Desktop installed ([download here](https://claude.ai/download))
- [x] Capacities export ZIP file (e.g., `Capacities (2026-02-11 13-03-27).zip`)
- [x] Capacities MCP Server built at `C:\Users\mahmu\IdeaProjects\capacities-mcp`
- [x] Bun installed

---

## Step 1: Configure the MCP Server

Edit `config.json` in the project root:

**Location:** `C:\Users\mahmu\IdeaProjects\capacities-mcp\config.json`

```json
{
  "mode": "file",
  "exportPath": "C:\\Users\\mahmu\\Downloads\\Capacities (2026-02-11 13-03-27).zip",
  "apiKey": "",
  "http": {
    "port": 3000,
    "authToken": ""
  }
}
```

> **Important:** Update `exportPath` to point to your actual Capacities export ZIP file.

---

## Step 2: Locate Claude Desktop Config File

Claude Desktop stores its MCP configuration in a JSON file:

| Platform | Config File Location |
|----------|---------------------|
| **Windows** | `%APPDATA%\Claude\claude_desktop_config.json` |
| **macOS** | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| **Linux** | `~/.config/Claude/claude_desktop_config.json` |

**On Windows, the full path is:**
```
C:\Users\mahmu\AppData\Roaming\Claude\claude_desktop_config.json
```

---

## Step 3: Create/Edit the Claude Config File

### Option A: Using File Explorer

1. Press `Win + R` to open Run dialog
2. Type `%APPDATA%\Claude` and press Enter
3. If `claude_desktop_config.json` doesn't exist, create it
4. Open it with Notepad or any text editor

### Option B: Using PowerShell

```powershell
# Create directory if it doesn't exist
New-Item -ItemType Directory -Force -Path "$env:APPDATA\Claude"

# Create or open the config file
notepad "$env:APPDATA\Claude\claude_desktop_config.json"
```

---

## Step 4: Add Capacities MCP Server Configuration

Copy this configuration into the file:

```json
{
  "mcpServers": {
    "capacities": {
      "command": "bun",
      "args": ["C:\\Users\\mahmu\\IdeaProjects\\capacities-mcp\\dist\\index.js"]
    }
  }
}
```

> **Note:** No environment variables needed! The server reads all configuration from `config.json` in the project root.

### If you already have other MCP servers configured:

```json
{
  "mcpServers": {
    "existing-server": {
      "command": "...",
      "args": ["..."]
    },
    "capacities": {
      "command": "bun",
      "args": ["C:\\Users\\mahmu\\IdeaProjects\\capacities-mcp\\dist\\index.js"]
    }
  }
}
```

---

## Step 5: Restart Claude Desktop

1. Close Claude Desktop completely (check system tray too)
2. Reopen Claude Desktop

---

## Step 6: Verify the Connection

### Check for MCP Tools

In Claude Desktop, try these prompts:

1. **List spaces:**
   ```
   Show me all my Capacities spaces
   ```

2. **Search content:**
   ```
   Search my Capacities for "China"
   ```

3. **Get object details:**
   ```
   Get the object "Three Treasures of Guangdong" from my Capacities
   ```

### If the tools appear, the connection is successful!

---

## Configuration Summary

| Config File | Location | Purpose |
|-------------|----------|---------|
| `config.json` | `C:\Users\mahmu\IdeaProjects\capacities-mcp\config.json` | Server settings (mode, export path, API key) |
| `claude_desktop_config.json` | `%APPDATA%\Claude\claude_desktop_config.json` | Claude Desktop MCP server registration |

---

## Troubleshooting

### Issue: "MCP server failed to start"

**Check 1: Verify Bun is in PATH**
```powershell
bun --version
```
If not found, use the full path to bun:
```json
{
  "mcpServers": {
    "capacities": {
      "command": "C:\\Users\\mahmu\\.bun\\bin\\bun.exe",
      "args": ["C:\\Users\\mahmu\\IdeaProjects\\capacities-mcp\\dist\\index.js"]
    }
  }
}
```

**Check 2: Verify config.json exists and is valid**
```powershell
# Check config.json exists
Test-Path "C:\Users\mahmu\IdeaProjects\capacities-mcp\config.json"

# View config.json content
Get-Content "C:\Users\mahmu\IdeaProjects\capacities-mcp\config.json"
```

**Check 3: Verify export path in config.json**
```powershell
# Check export ZIP exists
Test-Path "C:\Users\mahmu\Downloads\Capacities (2026-02-11 13-03-27).zip"
```

**Check 4: Test server manually**
```powershell
cd C:\Users\mahmu\IdeaProjects\capacities-mcp
bun dist\index.js --help
```

---

### Issue: Claude doesn't see the tools

1. Ensure the JSON config is valid (use a JSON validator)
2. Check for trailing commas (not allowed in JSON)
3. Make sure you restarted Claude Desktop after config changes
4. Check Claude Desktop logs:
   - Windows: `%APPDATA%\Claude\logs\`
   - Look for MCP-related errors

---

### Issue: "config.json not found"

The server auto-creates `config.json` on first run. If you see this error:

1. Run the server once manually to create the file:
   ```powershell
   cd C:\Users\mahmu\IdeaProjects\capacities-mcp
   bun dist\index.js --help
   ```

2. Edit the created `config.json` with your export path

3. Run again

---

### Issue: "exportPath does not exist"

Update `exportPath` in `config.json` to point to your actual Capacities export ZIP file.

---

## Available Tools in Claude Desktop

Once connected, you can use these tools through natural language:

| Tool | Example Prompt |
|------|----------------|
| `capacities_list_spaces` | "List all my Capacities spaces" |
| `capacities_get_space_info` | "Tell me about my Notes space" |
| `capacities_search` | "Search for 'Wikipedia' in my Capacities" |
| `capacities_get_object` | "Get the full content of 'Mellon Family Saga'" |
| `capacities_list_by_type` | "Show me all People in my Notes space" |
| `capacities_get_tags` | "What tags do I have in Capacities?" |
| `capacities_get_backlinks` | "What links to 'Ronald Lockley'?" |
| `capacities_get_context` | "Get related context for 'China'" |
| `capacities_load_export` | "Reload my Capacities export" |

---

## Available Prompts

| Prompt | Usage |
|--------|-------|
| `capacities-daily-summary` | Create a daily summary for notes |
| `capacities-meeting-notes` | Format meeting notes |
| `capacities-research-note` | Format research findings |

---

## Updating the Export

When you export a new ZIP from Capacities:

1. Save the new ZIP file
2. Edit `config.json` and update `exportPath`
3. Restart Claude Desktop, or ask Claude to run `capacities_load_export`

---

## Quick Test Commands

After setup, test with these prompts in Claude Desktop:

```
1. "What Capacities spaces do I have?"
2. "Search my Capacities for something related to movies"
3. "Get the object titled 'Rockefeller' from my Capacities"
4. "Show me all the tags I use in Capacities"
```

If all work, your RAG knowledge base connector is ready!

---

## Summary

| Step | Action |
|------|--------|
| 1 | Edit `config.json` with your export path |
| 2 | Open Claude config at `%APPDATA%\Claude\claude_desktop_config.json` |
| 3 | Add MCP server configuration (see above) |
| 4 | Restart Claude Desktop |
| 5 | Test with "Show me all my Capacities spaces" |
