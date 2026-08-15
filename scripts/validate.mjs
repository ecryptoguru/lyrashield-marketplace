import { access, readFile, readdir, stat } from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

async function readJson(relative) {
  return JSON.parse(await readFile(path.join(root, relative), "utf8"))
}

async function exists(relative) {
  try {
    await access(path.join(root, relative))
    return true
  } catch {
    return false
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const manifest = await readJson("manifest.json")
assert(Array.isArray(manifest.generatedFiles), "manifest.generatedFiles must be an array")
for (const relative of manifest.generatedFiles) {
  assert(await exists(relative), `missing generated artifact: ${relative}`)
}

assert(!(await exists("plugin")), "portable plugin artifacts must live at the repository root")

// Enforce manifest.forbidden: none of the listed paths may be present in the
// marketplace export (e.g. .env, credentials.json, private app sources).
assert(Array.isArray(manifest.forbidden), "manifest.forbidden must be an array")
for (const forbidden of manifest.forbidden) {
  assert(!existsSync(path.join(root, forbidden)), `forbidden path present in export: ${forbidden}`)
}

// Scan tracked text files for real LyraShield API keys (lsk_…), but allow the
// documented placeholder forms (lsk_…, <YOUR_…>) that appear in install guides.
const KEY_PATTERN = /lsk_[A-Za-z0-9]{8,}/
const PLACEHOLDER_PATTERN = /lsk_[….]|<YOUR_/
async function scanDir(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await scanDir(full)
    } else {
      const ext = path.extname(entry.name).toLowerCase()
      const textish = [".md", ".json", ".ts", ".js", ".mjs", ".yml", ".yaml", ".toml", ".txt", ""].includes(ext)
      if (!textish) continue
      const content = await readFile(full, "utf8")
      for (const line of content.split("\n")) {
        if (PLACEHOLDER_PATTERN.test(line)) continue
        assert(!KEY_PATTERN.test(line), `real API key leaked in ${path.relative(root, full)}: ${line.trim()}`)
      }
    }
  }
}
await scanDir(root)

const portableMcp = await readJson("mcp.json")
const claudeMcp = await readJson(".mcp.json")
for (const [name, config] of Object.entries({ portableMcp, claudeMcp })) {
  const server = config.mcpServers?.lyrashield
  assert(server?.type === "streamable-http", `${name} must use Streamable HTTP`)
  assert(server?.url === "https://app.lyrashieldai.com/api/mcp", `${name} has the wrong MCP URL`)
  assert(!("headers" in server), `${name} must allow the hosted OAuth flow to authenticate`)
}

// The Cursor shim inlines the MCP server declaration directly in its plugin.json
// rather than referencing mcp.json. Apply the same URL/transport/no-headers
// invariants as the root portable and Claude configs.
const cursorPlugin = await readJson(".cursor-plugin/plugin.json")
const cursorServer = cursorPlugin.mcpServers?.lyrashield
assert(cursorServer, ".cursor-plugin/plugin.json must declare the lyrashield MCP server")
assert(
  cursorServer.type === "streamable-http",
  ".cursor-plugin/plugin.json lyrashield server must use Streamable HTTP"
)
assert(
  cursorServer.url === "https://app.lyrashieldai.com/api/mcp",
  ".cursor-plugin/plugin.json lyrashield server has the wrong MCP URL"
)
assert(
  !("headers" in cursorServer),
  ".cursor-plugin/plugin.json must allow the hosted OAuth flow to authenticate"
)

const license = await readFile(path.join(root, "LICENSE"), "utf8")
assert(
  license.includes("TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION"),
  "LICENSE must contain the complete Apache-2.0 terms"
)

const openclaw = await readFile(path.join(root, "openclaw", "SKILL.md"), "utf8")
assert(openclaw.includes("license: MIT-0"), "OpenClaw skill must declare MIT-0")
assert(
  (await readFile(path.join(root, "openclaw", "LICENSE"), "utf8")).includes("MIT No Attribution"),
  "OpenClaw MIT-0 license is missing"
)

const rootEntries = await readdir(root)
assert(rootEntries.includes("plugin.json"), "root plugin.json is missing")
assert(rootEntries.includes("skills"), "root skills directory is missing")

// The marketplace catalog is what makes this repository installable rather than merely
// readable: `/plugin marketplace add` and VS Code's "Install Plugin From Source" both
// resolve plugins through it. Keep it consistent with the root plugin manifest.
const marketplace = await readJson(".claude-plugin/marketplace.json")
const rootPlugin = await readJson("plugin.json")
assert(
  typeof marketplace.name === "string" && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(marketplace.name),
  "marketplace.name must be a non-empty kebab-case identifier"
)
assert(typeof marketplace.owner?.name === "string", "marketplace.owner.name is required")
assert(
  Array.isArray(marketplace.plugins) && marketplace.plugins.length > 0,
  "marketplace.plugins must list at least one plugin"
)
const rootEntry = marketplace.plugins.find((entry) => entry.name === rootPlugin.name)
assert(rootEntry, `marketplace.plugins must list the root plugin (${rootPlugin.name})`)
assert(
  rootEntry.source === "./",
  'the root plugin entry must use source "./" so it resolves to the marketplace root'
)
assert(
  marketplace.version === rootPlugin.version && rootEntry.version === rootPlugin.version,
  "marketplace catalog versions must track plugin.json"
)

// Enforce per-artifact version pins so silent drift between client exports and
// the marketplace manifest is caught on the next export. The artifacts are NOT
// bumped here — the assertions merely fail when their versions no longer match
// what manifest.json expects.
assert(
  manifest.artifactVersions && typeof manifest.artifactVersions === "object",
  "manifest.artifactVersions must be a map of artifact → expected version"
)
async function readTomlVersion(relative, key) {
  const text = await readFile(path.join(root, relative), "utf8")
  const match = text.match(new RegExp(`^${key}\\s*=\\s*"([^"]+)"`, "m"))
  return match ? match[1] : null
}
async function readJsonVersion(relative) {
  return (await readJson(relative)).version
}
async function readTsVersion(relative) {
  const text = await readFile(path.join(root, relative), "utf8")
  const match = text.match(/version:\s*"([^"]+)"/)
  return match ? match[1] : null
}
async function readMdVersion(relative) {
  const text = await readFile(path.join(root, relative), "utf8")
  const match = text.match(/^version:\s*(\S+)/m)
  return match ? match[1] : null
}
const versionReaders = {
  "zed-extension": () => readTomlVersion("zed-extension/extension.toml", "version"),
  "gemini-extension": () => readJsonVersion("gemini-extension.json"),
  "codebuff": () => readTsVersion("codebuff/lyrashield-review.ts"),
  "openclaw": () => readMdVersion("openclaw/SKILL.md"),
}
for (const [artifact, expected] of Object.entries(manifest.artifactVersions)) {
  const actual = await versionReaders[artifact]()
  assert(actual !== null, `could not read version for artifact ${artifact}`)
  assert(
    actual === expected,
    `version drift: ${artifact} is ${actual} but manifest.artifactVersions expects ${expected}`
  )
}

console.log(`Marketplace validation passed (${manifest.generatedFiles.length} generated artifacts).`)
