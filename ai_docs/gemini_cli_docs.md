--- Start of index.md ---
# Welcome to Gemini CLI documentation

This documentation provides a comprehensive guide to installing, using, and developing Gemini CLI. This tool lets you interact with Gemini models through a command-line interface.

## Overview

Gemini CLI brings the capabilities of Gemini models to your terminal in an interactive Read-Eval-Print Loop (REPL) environment. Gemini CLI consists of a client-side application (`packages/cli`) that communicates with a local server (`packages/core`), which in turn manages requests to the Gemini API and its AI models. Gemini CLI also contains a variety of tools for tasks such as performing file system operations, running shells, and web fetching, which are managed by `packages/core`.

## Navigating the documentation

This documentation is organized into the following sections:

- **[Execution and Deployment](./deployment.md):** Information for running Gemini CLI.
- **[Architecture Overview](./architecture.md):** Understand the high-level design of Gemini CLI, including its components and how they interact.
- **CLI Usage:** Documentation for `packages/cli`.
  - **[CLI Introduction](./cli/index.md):** Overview of the command-line interface.
  - **[Commands](./cli/commands.md):** Description of available CLI commands.
  - **[Configuration](./cli/configuration.md):** Information on configuring the CLI.
  - **[Checkpointing](./checkpointing.md):** Documentation for the checkpointing feature.
  - **[Extensions](./extension.md):** How to extend the CLI with new functionality.
  - **[Telemetry](./telemetry.md):** Overview of telemetry in the CLI.
- **Core Details:** Documentation for `packages/core`.
  - **[Core Introduction](./core/index.md):** Overview of the core component.
  - **[Tools API](./core/tools-api.md):** Information on how the core manages and exposes tools.
- **Tools:**
  - **[Tools Overview](./tools/index.md):** Overview of the available tools.
  - **[File System Tools](./tools/file-system.md):** Documentation for the `read_file` and `write_file` tools.
  - **[Multi-File Read Tool](./tools/multi-file.md):** Documentation for the `read_many_files` tool.
  - **[Shell Tool](./tools/shell.md):** Documentation for the `run_shell_command` tool.
  - **[Web Fetch Tool](./tools/web-fetch.md):** Documentation for the `web_fetch` tool.
  - **[Web Search Tool](./tools/web-search.md):** Documentation for the `google_web_search` tool.
  - **[Memory Tool](./tools/memory.md):** Documentation for the `save_memory` tool.
- **[Contributing & Development Guide](../CONTRIBUTING.md):** Information for contributors and developers, including setup, building, testing, and coding conventions.
- **[Troubleshooting Guide](./troubleshooting.md):** Find solutions to common problems and FAQs.
- **[Terms of Service and Privacy Notice](./tos-privacy.md):** Information on the terms of service and privacy notices applicable to your use of Gemini CLI.

We hope this documentation helps you make the most of the Gemini CLI!
--- End of index.md ---

--- Start of ./deployment.md ---
# Gemini CLI Execution and Deployment

This document describes how to run Gemini CLI and explains the deployment architecture that Gemini CLI uses.

## Running Gemini CLI

There are several ways to run Gemini CLI. The option you choose depends on how you intend to use Gemini CLI.

---

### 1. Standard installation (Recommended for typical users)

This is the recommended way for end-users to install Gemini CLI. It involves downloading the Gemini CLI package from the NPM registry.

- **Global install:**

  ```bash
  # Install the CLI globally
  npm install -g @google/gemini-cli

  # Now you can run the CLI from anywhere
  gemini
  ```

- **NPX execution:**
  ```bash
  # Execute the latest version from NPM without a global install
  npx @google/gemini-cli
  ```

---

### 2. Running in a sandbox (Docker/Podman)

For security and isolation, Gemini CLI can be run inside a container. This is the default way that the CLI executes tools that might have side effects.

- **Directly from the Registry:**
  You can run the published sandbox image directly. This is useful for environments where you only have Docker and want to run the CLI.
  ```bash
  # Run the published sandbox image
  docker run --rm -it us-docker.pkg.dev/gemini-code-dev/gemini-cli/sandbox:0.1.1
  ```
- **Using the `--sandbox` flag:**
  If you have Gemini CLI installed locally (using the standard installation described above), you can instruct it to run inside the sandbox container.
  ```bash
  gemini --sandbox "your prompt here"
  ```

---

### 3. Running from source (Recommended for Gemini CLI contributors)

Contributors to the project will want to run the CLI directly from the source code.

- **Development Mode:**
  This method provides hot-reloading and is useful for active development.
  ```bash
  # From the root of the repository
  npm run start
  ```
- **Production-like mode (Linked package):**
  This method simulates a global installation by linking your local package. It's useful for testing a local build in a production workflow.

  ```bash
  # Link the local cli package to your global node_modules
  npm link packages/cli

  # Now you can run your local version using the `gemini` command
  gemini
  ```

---

### 4. Running the latest Gemini CLI commit from GitHub

You can run the most recently committed version of Gemini CLI directly from the GitHub repository. This is useful for testing features still in development.

```bash
# Execute the CLI directly from the main branch on GitHub
npx https://github.com/google-gemini/gemini-cli
```

## Deployment architecture

The execution methods described above are made possible by the following architectural components and processes:

**NPM packages**

Gemini CLI project is a monorepo that publishes two core packages to the NPM registry:

- `@google/gemini-cli-core`: The backend, handling logic and tool execution.
- `@google/gemini-cli`: The user-facing frontend.

These packages are used when performing the standard installation and when running Gemini CLI from the source.

**Build and packaging processes**

There are two distinct build processes used, depending on the distribution channel:

- **NPM publication:** For publishing to the NPM registry, the TypeScript source code in `@google/gemini-cli-core` and `@google/gemini-cli` is transpiled into standard JavaScript using the TypeScript Compiler (`tsc`). The resulting `dist/` directory is what gets published in the NPM package. This is a standard approach for TypeScript libraries.

- **GitHub `npx` execution:** When running the latest version of Gemini CLI directly from GitHub, a different process is triggered by the `prepare` script in `package.json`. This script uses `esbuild` to bundle the entire application and its dependencies into a single, self-contained JavaScript file. This bundle is created on-the-fly on the user's machine and is not checked into the repository.

**Docker sandbox image**

The Docker-based execution method is supported by the `gemini-cli-sandbox` container image. This image is published to a container registry and contains a pre-installed, global version of Gemini CLI. The `scripts/prepare-cli-packagejson.js` script dynamically injects the URI of this image into the CLI's `package.json` before publishing, so the CLI knows which image to pull when the `--sandbox` flag is used.

## Release process

A unified script, `npm run publish:release`, orchestrates the release process. The script performs the following actions:

1.  Build the NPM packages using `tsc`.
2.  Update the CLI's `package.json` with the Docker image URI.
3.  Build and tag the `gemini-cli-sandbox` Docker image.
4.  Push the Docker image to the container registry.
5.  Publish the NPM packages to the artifact registry.
--- End of ./deployment.md ---

--- Start of ./architecture.md ---
# Gemini CLI Architecture Overview

This document provides a high-level overview of the Gemini CLI's architecture.

## Core components

The Gemini CLI is primarily composed of two main packages, along with a suite of tools that can be used by the system in the course of handling command-line input:

1.  **CLI package (`packages/cli`):**
    - **Purpose:** This contains the user-facing portion of the Gemini CLI, such as handling the initial user input, presenting the final output, and managing the overall user experience.
    - **Key functions contained in the package:**
      - [Input processing](./cli/commands.md)
      - History management
      - Display rendering
      - [Theme and UI customization](./cli/themes.md)
      - [CLI configuration settings](./cli/configuration.md)

2.  **Core package (`packages/core`):**
    - **Purpose:** This acts as the backend for the Gemini CLI. It receives requests sent from `packages/cli`, orchestrates interactions with the Gemini API, and manages the execution of available tools.
    - **Key functions contained in the package:**
      - API client for communicating with the Google Gemini API
      - Prompt construction and management
      - Tool registration and execution logic
      - State management for conversations or sessions
      - Server-side configuration

3.  **Tools (`packages/core/src/tools/`):**
    - **Purpose:** These are individual modules that extend the capabilities of the Gemini model, allowing it to interact with the local environment (e.g., file system, shell commands, web fetching).
    - **Interaction:** `packages/core` invokes these tools based on requests from the Gemini model.

## Interaction Flow

A typical interaction with the Gemini CLI follows this flow:

1.  **User input:** The user types a prompt or command into the terminal, which is managed by `packages/cli`.
2.  **Request to core:** `packages/cli` sends the user's input to `packages/core`.
3.  **Request processed:** The core package:
    - Constructs an appropriate prompt for the Gemini API, possibly including conversation history and available tool definitions.
    - Sends the prompt to the Gemini API.
4.  **Gemini API response:** The Gemini API processes the prompt and returns a response. This response might be a direct answer or a request to use one of the available tools.
5.  **Tool execution (if applicable):**
    - When the Gemini API requests a tool, the core package prepares to execute it.
    - If the requested tool can modify the file system or execute shell commands, the user is first given details of the tool and its arguments, and the user must approve the execution.
    - Read-only operations, such as reading files, might not require explicit user confirmation to proceed.
    - Once confirmed, or if confirmation is not required, the core package executes the relevant action within the relevant tool, and the result is sent back to the Gemini API by the core package.
    - The Gemini API processes the tool result and generates a final response.
6.  **Response to CLI:** The core package sends the final response back to the CLI package.
7.  **Display to user:** The CLI package formats and displays the response to the user in the terminal.

## Key Design Principles

- **Modularity:** Separating the CLI (frontend) from the Core (backend) allows for independent development and potential future extensions (e.g., different frontends for the same backend).
- **Extensibility:** The tool system is designed to be extensible, allowing new capabilities to be added.
- **User experience:** The CLI focuses on providing a rich and interactive terminal experience.
--- End of ./architecture.md ---

--- Start of ./cli/commands.md ---
# CLI Commands

Gemini CLI supports several built-in commands to help you manage your session, customize the interface, and control its behavior. These commands are prefixed with a forward slash (`/`), an at symbol (`@`), or an exclamation mark (`!`).

## Slash commands (`/`)

Slash commands provide meta-level control over the CLI itself.

- **`/bug`**
  - **Description:** File an issue about Gemini CLI. By default, the issue is filed within the GitHub repository for Gemini CLI. The string you enter after `/bug` will become the headline for the bug being filed. The default `/bug` behavior can be modified using the `bugCommand` setting in your `.gemini/settings.json` files.

- **`/chat`**
  - **Description:** Save and resume conversation history for branching conversation state interactively, or resuming a previous state from a later session.
  - **Sub-commands:**
    - **`save`**
      - **Description:** Saves the current conversation history. You must add a `<tag>` for identifying the conversation state.
      - **Usage:** `/chat save <tag>`
    - **`resume`**
      - **Description:** Resumes a conversation from a previous save.
      - **Usage:** `/chat resume <tag>`
    - **`list`**
      - **Description:** Lists available tags for chat state resumption.

- **`/clear`**
  - **Description:** Clear the terminal screen, including the visible session history and scrollback within the CLI. The underlying session data (for history recall) might be preserved depending on the exact implementation, but the visual display is cleared.
  - **Keyboard shortcut:** Press **Ctrl+L** at any time to perform a clear action.

- **`/compress`**
  - **Description:** Replace the entire chat context with a summary. This saves on tokens used for future tasks while retaining a high level summary of what has happened.

- **`/editor`**
  - **Description:** Open a dialog for selecting supported editors.

- **`/help`** (or **`/?`**)
  - **Description:** Display help information about the Gemini CLI, including available commands and their usage.

- **`/mcp`**
  - **Description:** List configured Model Context Protocol (MCP) servers, their connection status, server details, and available tools.
  - **Sub-commands:**
    - **`desc`** or **`descriptions`**:
      - **Description:** Show detailed descriptions for MCP servers and tools.
    - **`nodesc`** or **`nodescriptions`**:
      - **Description:** Hide tool descriptions, showing only the tool names.
    - **`schema`**:
      - **Description:** Show the full JSON schema for the tool's configured parameters.
  - **Keyboard Shortcut:** Press **Ctrl+T** at any time to toggle between showing and hiding tool descriptions.

- **`/memory`**
  - **Description:** Manage the AI's instructional context (hierarchical memory loaded from `GEMINI.md` files).
  - **Sub-commands:**
    - **`add`**:
      - **Description:** Adds the following text to the AI's memory. Usage: `/memory add <text to remember>`
    - **`show`**:
      - **Description:** Display the full, concatenated content of the current hierarchical memory that has been loaded from all `GEMINI.md` files. This lets you inspect the instructional context being provided to the Gemini model.
    - **`refresh`**:
      - **Description:** Reload the hierarchical instructional memory from all `GEMINI.md` files found in the configured locations (global, project/ancestors, and sub-directories). This command updates the model with the latest `GEMINI.md` content.
    - **Note:** For more details on how `GEMINI.md` files contribute to hierarchical memory, see the [CLI Configuration documentation](./configuration.md#4-geminimd-files-hierarchical-instructional-context).

- **`/restore`**
  - **Description:** Restores the project files to the state they were in just before a tool was executed. This is particularly useful for undoing file edits made by a tool. If run without a tool call ID, it will list available checkpoints to restore from.
  - **Usage:** `/restore [tool_call_id]`
  - **Note:** Only available if the CLI is invoked with the `--checkpointing` option or configured via [settings](./configuration.md). See [Checkpointing documentation](../checkpointing.md) for more details.

- **`/stats`**
  - **Description:** Display detailed statistics for the current Gemini CLI session, including token usage, cached token savings (when available), and session duration. Note: Cached token information is only displayed when cached tokens are being used, which occurs with API key authentication but not with OAuth authentication at this time.

- [**`/theme`**](./themes.md)
  - **Description:** Open a dialog that lets you change the visual theme of Gemini CLI.

- **`/auth`**
  - **Description:** Open a dialog that lets you change the authentication method.

- **`/about`**
  - **Description:** Show version info. Please share this information when filing issues.

- [**`/tools`**](../tools/index.md)
  - **Description:** Display a list of tools that are currently available within Gemini CLI.
  - **Sub-commands:**
    - **`desc`** or **`descriptions`**:
      - **Description:** Show detailed descriptions of each tool, including each tool's name with its full description as provided to the model.
    - **`nodesc`** or **`nodescriptions`**:
      - **Description:** Hide tool descriptions, showing only the tool names.

- **`/quit`** (or **`/exit`**)
  - **Description:** Exit Gemini CLI.

## At commands (`@`)

At commands are used to include the content of files or directories as part of your prompt to Gemini. These commands include git-aware filtering.

- **`@<path_to_file_or_directory>`**
  - **Description:** Inject the content of the specified file or files into your current prompt. This is useful for asking questions about specific code, text, or collections of files.
  - **Examples:**
    - `@path/to/your/file.txt Explain this text.`
    - `@src/my_project/ Summarize the code in this directory.`
    - `What is this file about? @README.md`
  - **Details:**
    - If a path to a single file is provided, the content of that file is read.
    - If a path to a directory is provided, the command attempts to read the content of files within that directory and any subdirectories.
    - Spaces in paths should be escaped with a backslash (e.g., `@My\ Documents/file.txt`).
    - The command uses the `read_many_files` tool internally. The content is fetched and then inserted into your query before being sent to the Gemini model.
    - **Git-aware filtering:** By default, git-ignored files (like `node_modules/`, `dist/`, `.env`, `.git/`) are excluded. This behavior can be changed via the `fileFiltering` settings.
    - **File types:** The command is intended for text-based files. While it might attempt to read any file, binary files or very large files might be skipped or truncated by the underlying `read_many_files` tool to ensure performance and relevance. The tool indicates if files were skipped.
  - **Output:** The CLI will show a tool call message indicating that `read_many_files` was used, along with a message detailing the status and the path(s) that were processed.

- **`@` (Lone at symbol)**
  - **Description:** If you type a lone `@` symbol without a path, the query is passed as-is to the Gemini model. This might be useful if you are specifically talking _about_ the `@` symbol in your prompt.

### Error handling for `@` commands

- If the path specified after `@` is not found or is invalid, an error message will be displayed, and the query might not be sent to the Gemini model, or it will be sent without the file content.
- If the `read_many_files` tool encounters an error (e.g., permission issues), this will also be reported.

## Shell mode & passthrough commands (`!`)

The `!` prefix lets you interact with your system's shell directly from within Gemini CLI.

- **`!<shell_command>`**
  - **Description:** Execute the given `<shell_command>` in your system's default shell. Any output or errors from the command are displayed in the terminal.
  - **Examples:**
    - `!ls -la` (executes `ls -la` and returns to Gemini CLI)
    - `!git status` (executes `git status` and returns to Gemini CLI)

- **`!` (Toggle shell mode)**
  - **Description:** Typing `!` on its own toggles shell mode.
    - **Entering shell mode:**
      - When active, shell mode uses a different coloring and a "Shell Mode Indicator".
      - While in shell mode, text you type is interpreted directly as a shell command.
    - **Exiting shell mode:**
      - When exited, the UI reverts to its standard appearance and normal Gemini CLI behavior resumes.

- **Caution for all `!` usage:** Commands you execute in shell mode have the same permissions and impact as if you ran them directly in your terminal.
--- End of ./cli/commands.md ---

--- Start of ./cli/configuration.md ---
# Gemini CLI Configuration

Gemini CLI offers several ways to configure its behavior, including environment variables, command-line arguments, and settings files. This document outlines the different configuration methods and available settings.

## Configuration layers

Configuration is applied in the following order of precedence (lower numbers are overridden by higher numbers):

1.  **Default values:** Hardcoded defaults within the application.
2.  **User settings file:** Global settings for the current user.
3.  **Project settings file:** Project-specific settings.
4.  **Environment variables:** System-wide or session-specific variables, potentially loaded from `.env` files.
5.  **Command-line arguments:** Values passed when launching the CLI.

## The user settings file and project settings file

Gemini CLI uses `settings.json` files for persistent configuration. There are two locations for these files:

- **User settings file:**
  - **Location:** `~/.gemini/settings.json` (where `~` is your home directory).
  - **Scope:** Applies to all Gemini CLI sessions for the current user.
- **Project settings file:**
  - **Location:** `.gemini/settings.json` within your project's root directory.
  - **Scope:** Applies only when running Gemini CLI from that specific project. Project settings override user settings.

**Note on environment variables in settings:** String values within your `settings.json` files can reference environment variables using either `$VAR_NAME` or `${VAR_NAME}` syntax. These variables will be automatically resolved when the settings are loaded. For example, if you have an environment variable `MY_API_TOKEN`, you could use it in `settings.json` like this: `"apiKey": "$MY_API_TOKEN"`.

### The `.gemini` directory in your project

In addition to a project settings file, a project's `.gemini` directory can contain other project-specific files related to Gemini CLI's operation, such as:

- [Custom sandbox profiles](#sandboxing) (e.g., `.gemini/sandbox-macos-custom.sb`, `.gemini/sandbox.Dockerfile`).

### Available settings in `settings.json`:

- **`contextFileName`** (string or array of strings):
  - **Description:** Specifies the filename for context files (e.g., `GEMINI.md`, `AGENTS.md`). Can be a single filename or a list of accepted filenames.
  - **Default:** `GEMINI.md`
  - **Example:** `"contextFileName": "AGENTS.md"`

- **`bugCommand`** (object):
  - **Description:** Overrides the default URL for the `/bug` command.
  - **Default:** `"urlTemplate": "https://github.com/google-gemini/gemini-cli/issues/new?template=bug_report.yml&title={title}&info={info}"`
  - **Properties:**
    - **`urlTemplate`** (string): A URL that can contain `{title}` and `{info}` placeholders.
  - **Example:**
    ```json
    "bugCommand": {
      "urlTemplate": "https://bug.example.com/new?title={title}&info={info}"
    }
    ```

- **`fileFiltering`** (object):
  - **Description:** Controls git-aware file filtering behavior for @ commands and file discovery tools.
  - **Default:** `"respectGitIgnore": true, "enableRecursiveFileSearch": true`
  - **Properties:**
    - **`respectGitIgnore`** (boolean): Whether to respect .gitignore patterns when discovering files. When set to `true`, git-ignored files (like `node_modules/`, `dist/`, `.env`) are automatically excluded from @ commands and file listing operations.
    - **`enableRecursiveFileSearch`** (boolean): Whether to enable searching recursively for filenames under the current tree when completing @ prefixes in the prompt.
  - **Example:**
    ```json
    "fileFiltering": {
      "respectGitIgnore": true,
      "enableRecursiveFileSearch": false
    }
    ```

- **`coreTools`** (array of strings):
  - **Description:** Allows you to specify a list of core tool names that should be made available to the model. This can be used to restrict the set of built-in tools. See [Built-in Tools](../core/tools-api.md#built-in-tools) for a list of core tools. You can also specify command-specific restrictions for tools that support it, like the `ShellTool`. For example, `"coreTools": ["ShellTool(ls -l)"]` will only allow the `ls -l` command to be executed.
  - **Default:** All tools available for use by the Gemini model.
  - **Example:** `"coreTools": ["ReadFileTool", "GlobTool", "ShellTool(ls)"]`.

- **`excludeTools`** (array of strings):
  - **Description:** Allows you to specify a list of core tool names that should be excluded from the model. A tool listed in both `excludeTools` and `coreTools` is excluded. You can also specify command-specific restrictions for tools that support it, like the `ShellTool`. For example, `"excludeTools": ["ShellTool(rm -rf)"]` will block the `rm -rf` command.
  - **Default**: No tools excluded.
  - **Example:** `"excludeTools": ["run_shell_command", "findFiles"]`.
  - **Security Note:** Command-specific restrictions in
    `excludeTools` for `run_shell_command` are based on simple string matching and can be easily bypassed. This feature is **not a security mechanism** and should not be relied upon to safely execute untrusted code. It is recommended to use `coreTools` to explicitly select commands
    that can be executed.

- **`autoAccept`** (boolean):
  - **Description:** Controls whether the CLI automatically accepts and executes tool calls that are considered safe (e.g., read-only operations) without explicit user confirmation. If set to `true`, the CLI will bypass the confirmation prompt for tools deemed safe.
  - **Default:** `false`
  - **Example:** `"autoAccept": true`

- **`theme`** (string):
  - **Description:** Sets the visual [theme](./themes.md) for Gemini CLI.
  - **Default:** `"Default"`
  - **Example:** `"theme": "GitHub"`

- **`sandbox`** (boolean or string):
  - **Description:** Controls whether and how to use sandboxing for tool execution. If set to `true`, Gemini CLI uses a pre-built `gemini-cli-sandbox` Docker image. For more information, see [Sandboxing](#sandboxing).
  - **Default:** `false`
  - **Example:** `"sandbox": "docker"`

- **`toolDiscoveryCommand`** (string):
  - **Description:** Defines a custom shell command for discovering tools from your project. The shell command must return on `stdout` a JSON array of [function declarations](https://ai.google.dev/gemini-api/docs/function-calling#function-declarations). Tool wrappers are optional.
  - **Default:** Empty
  - **Example:** `"toolDiscoveryCommand": "bin/get_tools"`

- **`toolCallCommand`** (string):
  - **Description:** Defines a custom shell command for calling a specific tool that was discovered using `toolDiscoveryCommand`. The shell command must meet the following criteria:
    - It must take function `name` (exactly as in [function declaration](https://ai.google.dev/gemini-api/docs/function-calling#function-declarations)) as first command line argument.
    - It must read function arguments as JSON on `stdin`, analogous to [`functionCall.args`](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/inference#functioncall).
    - It must return function output as JSON on `stdout`, analogous to [`functionResponse.response.content`](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/inference#functionresponse).
  - **Default:** Empty
  - **Example:** `"toolCallCommand": "bin/call_tool"`

- **`mcpServers`** (object):
  - **Description:** Configures connections to one or more Model-Context Protocol (MCP) servers for discovering and using custom tools. Gemini CLI attempts to connect to each configured MCP server to discover available tools. If multiple MCP servers expose a tool with the same name, the tool names will be prefixed with the server alias you defined in the configuration (e.g., `serverAlias__actualToolName`) to avoid conflicts. Note that the system might strip certain schema properties from MCP tool definitions for compatibility.
  - **Default:** Empty
  - **Properties:**
    - **`<SERVER_NAME>`** (object): The server parameters for the named server.
      - `command` (string, required): The command to execute to start the MCP server.
      - `args` (array of strings, optional): Arguments to pass to the command.
      - `env` (object, optional): Environment variables to set for the server process.
      - `cwd` (string, optional): The working directory in which to start the server.
      - `timeout` (number, optional): Timeout in milliseconds for requests to this MCP server.
      - `trust` (boolean, optional): Trust this server and bypass all tool call confirmations.
  - **Example:**
    ```json
    "mcpServers": {
      "myPythonServer": {
        "command": "python",
        "args": ["mcp_server.py", "--port", "8080"],
        "cwd": "./mcp_tools/python",
        "timeout": 5000
      },
      "myNodeServer": {
        "command": "node",
        "args": ["mcp_server.js"],
        "cwd": "./mcp_tools/node"
      },
      "myDockerServer": {
        "command": "docker",
        "args": ["run", "i", "--rm", "-e", "API_KEY", "ghcr.io/foo/bar"],
        "env": {
          "API_KEY": "$MY_API_TOKEN"
        }
      },
    }
    ```

- **`checkpointing`** (object):
  - **Description:** Configures the checkpointing feature, which allows you to save and restore conversation and file states. See the [Checkpointing documentation](../checkpointing.md) for more details.
  - **Default:** `{"enabled": false}`
  - **Properties:**
    - **`enabled`** (boolean): When `true`, the `/restore` command is available.

- **`preferredEditor`** (string):
  - **Description:** Specifies the preferred editor to use for viewing diffs.
  - **Default:** `vscode`
  - **Example:** `"preferredEditor": "vscode"`

- **`telemetry`** (object)
  - **Description:** Configures logging and metrics collection for Gemini CLI. For more information, see [Telemetry](../telemetry.md).
  - **Default:** `{"enabled": false, "target": "local", "otlpEndpoint": "http://localhost:4317", "logPrompts": true}`
  - **Properties:**
    - **`enabled`** (boolean): Whether or not telemetry is enabled.
    - **`target`** (string): The destination for collected telemetry. Supported values are `local` and `gcp`.
    - **`otlpEndpoint`** (string): The endpoint for the OTLP Exporter.
    - **`logPrompts`** (boolean): Whether or not to include the content of user prompts in the logs.
  - **Example:**
    ```json
    "telemetry": {
      "enabled": true,
      "target": "local",
      "otlpEndpoint": "http://localhost:16686",
      "logPrompts": false
    }
    ```
- **`usageStatisticsEnabled`** (boolean):
  - **Description:** Enables or disables the collection of usage statistics. See [Usage Statistics](#usage-statistics) for more information.
  - **Default:** `true`
  - **Example:**
    ```json
    "usageStatisticsEnabled": false
    ```

- **`hideTips`** (boolean):
  - **Description:** Enables or disables helpful tips in the CLI interface.
  - **Default:** `false`
  - **Example:**

    ```json
    "hideTips": true
    ```

### Example `settings.json`:

```json
{
  "theme": "GitHub",
  "sandbox": "docker",
  "toolDiscoveryCommand": "bin/get_tools",
  "toolCallCommand": "bin/call_tool",
  "mcpServers": {
    "mainServer": {
      "command": "bin/mcp_server.py"
    },
    "anotherServer": {
      "command": "node",
      "args": ["mcp_server.js", "--verbose"]
    }
  },
  "telemetry": {
    "enabled": true,
    "target": "local",
    "otlpEndpoint": "http://localhost:4317",
    "logPrompts": true
  },
  "usageStatisticsEnabled": true,
  "hideTips": false
}
```

## Shell History

The CLI keeps a history of shell commands you run. To avoid conflicts between different projects, this history is stored in a project-specific directory within your user's home folder.

- **Location:** `~/.gemini/tmp/<project_hash>/shell_history`
  - `<project_hash>` is a unique identifier generated from your project's root path.
  - The history is stored in a file named `shell_history`.

## Environment Variables & `.env` Files

Environment variables are a common way to configure applications, especially for sensitive information like API keys or for settings that might change between environments.

The CLI automatically loads environment variables from an `.env` file. The loading order is:

1.  `.env` file in the current working directory.
2.  If not found, it searches upwards in parent directories until it finds an `.env` file or reaches the project root (identified by a `.git` folder) or the home directory.
3.  If still not found, it looks for `~/.env` (in the user's home directory).

- **`GEMINI_API_KEY`** (Required):
  - Your API key for the Gemini API.
  - **Crucial for operation.** The CLI will not function without it.
  - Set this in your shell profile (e.g., `~/.bashrc`, `~/.zshrc`) or an `.env` file.
- **`GEMINI_MODEL`**:
  - Specifies the default Gemini model to use.
  - Overrides the hardcoded default
  - Example: `export GEMINI_MODEL="gemini-2.5-flash"`
- **`GOOGLE_API_KEY`**:
  - Your Google Cloud API key.
  - Required for using Vertex AI in express mode.
  - Ensure you have the necessary permissions and set the `GOOGLE_GENAI_USE_VERTEXAI=true` environment variable.
  - Example: `export GOOGLE_API_KEY="YOUR_GOOGLE_API_KEY"`.
- **`GOOGLE_CLOUD_PROJECT`**:
  - Your Google Cloud Project ID.
  - Required for using Code Assist or Vertex AI.
  - If using Vertex AI, ensure you have the necessary permissions and set the `GOOGLE_GENAI_USE_VERTEXAI=true` environment variable.
  - Example: `export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"`.
- **`GOOGLE_APPLICATION_CREDENTIALS`** (string):
  - **Description:** The path to your Google Application Credentials JSON file.
  - **Example:** `export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/credentials.json"`
- **`OTLP_GOOGLE_CLOUD_PROJECT`**:
  - Your Google Cloud Project ID for Telemetry in Google Cloud
  - Example: `export OTLP_GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"`.
- **`GOOGLE_CLOUD_LOCATION`**:
  - Your Google Cloud Project Location (e.g., us-central1).
  - Required for using Vertex AI in non express mode.
  - If using Vertex AI, ensure you have the necessary permissions and set the `GOOGLE_GENAI_USE_VERTEXAI=true` environment variable.
  - Example: `export GOOGLE_CLOUD_LOCATION="YOUR_PROJECT_LOCATION"`.
- **`GEMINI_SANDBOX`**:
  - Alternative to the `sandbox` setting in `settings.json`.
  - Accepts `true`, `false`, `docker`, `podman`, or a custom command string.
- **`SEATBELT_PROFILE`** (macOS specific):
  - Switches the Seatbelt (`sandbox-exec`) profile on macOS.
  - `permissive-open`: (Default) Restricts writes to the project folder (and a few other folders, see `packages/cli/src/utils/sandbox-macos-permissive-open.sb`) but allows other operations.
  - `strict`: Uses a strict profile that declines operations by default.
  - `<profile_name>`: Uses a custom profile. To define a custom profile, create a file named `sandbox-macos-<profile_name>.sb` in your project's `.gemini/` directory (e.g., `my-project/.gemini/sandbox-macos-custom.sb`).
- **`DEBUG` or `DEBUG_MODE`** (often used by underlying libraries or the CLI itself):
  - Set to `true` or `1` to enable verbose debug logging, which can be helpful for troubleshooting.
- **`NO_COLOR`**:
  - Set to any value to disable all color output in the CLI.
- **`CLI_TITLE`**:
  - Set to a string to customize the title of the CLI.
- **`CODE_ASSIST_ENDPOINT`**:
  - Specifies the endpoint for the code assist server.
  - This is useful for development and testing.

## Command-Line Arguments

Arguments passed directly when running the CLI can override other configurations for that specific session.

- **`--model <model_name>`** (**`-m <model_name>`**):
  - Specifies the Gemini model to use for this session.
  - Example: `npm start -- --model gemini-1.5-pro-latest`
- **`--prompt <your_prompt>`** (**`-p <your_prompt>`**):
  - Used to pass a prompt directly to the command. This invokes Gemini CLI in a non-interactive mode.
- **`--sandbox`** (**`-s`**):
  - Enables sandbox mode for this session.
- **`--sandbox-image`**:
  - Sets the sandbox image URI.
- **`--debug_mode`** (**`-d`**):
  - Enables debug mode for this session, providing more verbose output.
- **`--all_files`** (**`-a`**):
  - If set, recursively includes all files within the current directory as context for the prompt.
- **`--help`** (or **`-h`**):
  - Displays help information about command-line arguments.
- **`--show_memory_usage`**:
  - Displays the current memory usage.
- **`--yolo`**:
  - Enables YOLO mode, which automatically approves all tool calls.
- **`--telemetry`**:
  - Enables [telemetry](../telemetry.md).
- **`--telemetry-target`**:
  - Sets the telemetry target. See [telemetry](../telemetry.md) for more information.
- **`--telemetry-otlp-endpoint`**:
  - Sets the OTLP endpoint for telemetry. See [telemetry](../telemetry.md) for more information.
- **`--telemetry-log-prompts`**:
  - Enables logging of prompts for telemetry. See [telemetry](../telemetry.md) for more information.
- **`--checkpointing`**:
  - Enables [checkpointing](./commands.md#checkpointing-commands).
- **`--version`**:
  - Displays the version of the CLI.

## Context Files (Hierarchical Instructional Context)

While not strictly configuration for the CLI's _behavior_, context files (defaulting to `GEMINI.md` but configurable via the `contextFileName` setting) are crucial for configuring the _instructional context_ (also referred to as "memory") provided to the Gemini model. This powerful feature allows you to give project-specific instructions, coding style guides, or any relevant background information to the AI, making its responses more tailored and accurate to your needs. The CLI includes UI elements, such as an indicator in the footer showing the number of loaded context files, to keep you informed about the active context.

- **Purpose:** These Markdown files contain instructions, guidelines, or context that you want the Gemini model to be aware of during your interactions. The system is designed to manage this instructional context hierarchically.

### Example Context File Content (e.g., `GEMINI.md`)

Here's a conceptual example of what a context file at the root of a TypeScript project might contain:

```markdown
# Project: My Awesome TypeScript Library

## General Instructions:

- When generating new TypeScript code, please follow the existing coding style.
- Ensure all new functions and classes have JSDoc comments.
- Prefer functional programming paradigms where appropriate.
- All code should be compatible with TypeScript 5.0 and Node.js 18+.

## Coding Style:

- Use 2 spaces for indentation.
- Interface names should be prefixed with `I` (e.g., `IUserService`).
- Private class members should be prefixed with an underscore (`_`).
- Always use strict equality (`===` and `!==`).

## Specific Component: `src/api/client.ts`

- This file handles all outbound API requests.
- When adding new API call functions, ensure they include robust error handling and logging.
- Use the existing `fetchWithRetry` utility for all GET requests.

## Regarding Dependencies:

- Avoid introducing new external dependencies unless absolutely necessary.
- If a new dependency is required, please state the reason.
```

This example demonstrates how you can provide general project context, specific coding conventions, and even notes about particular files or components. The more relevant and precise your context files are, the better the AI can assist you. Project-specific context files are highly encouraged to establish conventions and context.

- **Hierarchical Loading and Precedence:** The CLI implements a sophisticated hierarchical memory system by loading context files (e.g., `GEMINI.md`) from several locations. Content from files lower in this list (more specific) typically overrides or supplements content from files higher up (more general). The exact concatenation order and final context can be inspected using the `/memory show` command. The typical loading order is:
  1.  **Global Context File:**
      - Location: `~/.gemini/<contextFileName>` (e.g., `~/.gemini/GEMINI.md` in your user home directory).
      - Scope: Provides default instructions for all your projects.
  2.  **Project Root & Ancestors Context Files:**
      - Location: The CLI searches for the configured context file in the current working directory and then in each parent directory up to either the project root (identified by a `.git` folder) or your home directory.
      - Scope: Provides context relevant to the entire project or a significant portion of it.
  3.  **Sub-directory Context Files (Contextual/Local):**
      - Location: The CLI also scans for the configured context file in subdirectories _below_ the current working directory (respecting common ignore patterns like `node_modules`, `.git`, etc.).
      - Scope: Allows for highly specific instructions relevant to a particular component, module, or sub-section of your project.
- **Concatenation & UI Indication:** The contents of all found context files are concatenated (with separators indicating their origin and path) and provided as part of the system prompt to the Gemini model. The CLI footer displays the count of loaded context files, giving you a quick visual cue about the active instructional context.
- **Commands for Memory Management:**
  - Use `/memory refresh` to force a re-scan and reload of all context files from all configured locations. This updates the AI's instructional context.
  - Use `/memory show` to display the combined instructional context currently loaded, allowing you to verify the hierarchy and content being used by the AI.
  - See the [Commands documentation](./commands.md#memory) for full details on the `/memory` command and its sub-commands (`show` and `refresh`).

By understanding and utilizing these configuration layers and the hierarchical nature of context files, you can effectively manage the AI's memory and tailor the Gemini CLI's responses to your specific needs and projects.

## Sandboxing

The Gemini CLI can execute potentially unsafe operations (like shell commands and file modifications) within a sandboxed environment to protect your system.

Sandboxing is disabled by default, but you can enable it in a few ways:

- Using `--sandbox` or `-s` flag.
- Setting `GEMINI_SANDBOX` environment variable.
- Sandbox is enabled in `--yolo` mode by default.

By default, it uses a pre-built `gemini-cli-sandbox` Docker image.

For project-specific sandboxing needs, you can create a custom Dockerfile at `.gemini/sandbox.Dockerfile` in your project's root directory. This Dockerfile can be based on the base sandbox image:

```dockerfile
FROM gemini-cli-sandbox

# Add your custom dependencies or configurations here
# For example:
# RUN apt-get update && apt-get install -y some-package
# COPY ./my-config /app/my-config
```

When `.gemini/sandbox.Dockerfile` exists, you can use `BUILD_SANDBOX` environment variable when running Gemini CLI to automatically build the custom sandbox image:

```bash
BUILD_SANDBOX=1 gemini -s
```

## Usage Statistics

To help us improve the Gemini CLI, we collect anonymized usage statistics. This data helps us understand how the CLI is used, identify common issues, and prioritize new features.

**What we collect:**

- **Tool Calls:** We log the names of the tools that are called, whether they succeed or fail, and how long they take to execute. We do not collect the arguments passed to the tools or any data returned by them.
- **API Requests:** We log the Gemini model used for each request, the duration of the request, and whether it was successful. We do not collect the content of the prompts or responses.
- **Session Information:** We collect information about the configuration of the CLI, such as the enabled tools and the approval mode.

**What we DON'T collect:**

- **Personally Identifiable Information (PII):** We do not collect any personal information, such as your name, email address, or API keys.
- **Prompt and Response Content:** We do not log the content of your prompts or the responses from the Gemini model.
- **File Content:** We do not log the content of any files that are read or written by the CLI.

**How to opt out:**

You can opt out of usage statistics collection at any time by setting the `usageStatisticsEnabled` property to `false` in your `settings.json` file:

```json
{
  "usageStatisticsEnabled": false
}
```
--- End of ./cli/configuration.md ---

--- Start of ./checkpointing.md ---
# Checkpointing

The Gemini CLI includes a Checkpointing feature that automatically saves a snapshot of your project's state before any file modifications are made by AI-powered tools. This allows you to safely experiment with and apply code changes, knowing you can instantly revert back to the state before the tool was run.

## How It Works

When you approve a tool that modifies the file system (like `write_file` or `replace`), the CLI automatically creates a "checkpoint." This checkpoint includes:

1.  **A Git Snapshot:** A commit is made in a special, shadow Git repository located in your home directory (`~/.gemini/history/<project_hash>`). This snapshot captures the complete state of your project files at that moment. It does **not** interfere with your own project's Git repository.
2.  **Conversation History:** The entire conversation you've had with the agent up to that point is saved.
3.  **The Tool Call:** The specific tool call that was about to be executed is also stored.

If you want to undo the change or simply go back, you can use the `/restore` command. Restoring a checkpoint will:

- Revert all files in your project to the state captured in the snapshot.
- Restore the conversation history in the CLI.
- Re-propose the original tool call, allowing you to run it again, modify it, or simply ignore it.

All checkpoint data, including the Git snapshot and conversation history, is stored locally on your machine. The Git snapshot is stored in the shadow repository while the conversation history and tool calls are saved in a JSON file in your project's temporary directory, typically located at `~/.gemini/tmp/<project_hash>/checkpoints`.

## Enabling the Feature

The Checkpointing feature is disabled by default. To enable it, you can either use a command-line flag or edit your `settings.json` file.

### Using the Command-Line Flag

You can enable checkpointing for the current session by using the `--checkpointing` flag when starting the Gemini CLI:

```bash
gemini --checkpointing
```

### Using the `settings.json` File

To enable checkpointing by default for all sessions, you need to edit your `settings.json` file.

Add the following key to your `settings.json`:

```json
{
  "checkpointing": {
    "enabled": true
  }
}
```

## Using the `/restore` Command

Once enabled, checkpoints are created automatically. To manage them, you use the `/restore` command.

### List Available Checkpoints

To see a list of all saved checkpoints for the current project, simply run:

```
/restore
```

The CLI will display a list of available checkpoint files. These file names are typically composed of a timestamp, the name of the file being modified, and the name of the tool that was about to be run (e.g., `2025-06-22T10-00-00_000Z-my-file.txt-write_file`).

### Restore a Specific Checkpoint

To restore your project to a specific checkpoint, use the checkpoint file from the list:

```
/restore <checkpoint_file>
```

For example:

```
/restore 2025-06-22T10-00-00_000Z-my-file.txt-write_file
```

After running the command, your files and conversation will be immediately restored to the state they were in when the checkpoint was created, and the original tool prompt will reappear.
--- End of ./checkpointing.md ---

--- Start of ./extension.md ---
# Gemini CLI Extensions

Gemini CLI supports extensions that can be used to configure and extend its functionality.

## How it works

On startup, Gemini CLI looks for extensions in two locations:

1.  `<workspace>/.gemini/extensions`
2.  `<home>/.gemini/extensions`

Gemini CLI loads all extensions from both locations. If an extension with the same name exists in both locations, the extension in the workspace directory takes precedence.

Within each location, individual extensions exist as a directory that contains a `gemini-extension.json` file. For example:

`<workspace>/.gemini/extensions/my-extension/gemini-extension.json`

### `gemini-extension.json`

The `gemini-extension.json` file contains the configuration for the extension. The file has the following structure:

```json
{
  "name": "my-extension",
  "version": "1.0.0",
  "mcpServers": {
    "my-server": {
      "command": "node my-server.js"
    }
  },
  "contextFileName": "GEMINI.md",
  "excludeTools": ["run_shell_command"]
}
```

- `name`: The name of the extension. This is used to uniquely identify the extension. This should match the name of your extension directory.
- `version`: The version of the extension.
- `mcpServers`: A map of MCP servers to configure. The key is the name of the server, and the value is the server configuration. These servers will be loaded on startup just like MCP servers configured in a [`settings.json` file](./cli/configuration.md). If both an extension and a `settings.json` file configure an MCP server with the same name, the server defined in the `settings.json` file takes precedence.
- `contextFileName`: The name of the file that contains the context for the extension. This will be used to load the context from the workspace. If this property is not used but a `GEMINI.md` file is present in your extension directory, then that file will be loaded.
- `excludeTools`: An array of tool names to exclude from the model. You can also specify command-specific restrictions for tools that support it, like the `run_shell_command` tool. For example, `"excludeTools": ["run_shell_command(rm -rf)"]` will block the `rm -rf` command.

When Gemini CLI starts, it loads all the extensions and merges their configurations. If there are any conflicts, the workspace configuration takes precedence.
--- End of ./extension.md ---

--- Start of ./telemetry.md ---
# Gemini CLI Observability Guide

Telemetry provides data about Gemini CLI's performance, health, and usage. By enabling it, you can monitor operations, debug issues, and optimize tool usage through traces, metrics, and structured logs.

Gemini CLI's telemetry system is built on the **[OpenTelemetry] (OTEL)** standard, allowing you to send data to any compatible backend.

[OpenTelemetry]: https://opentelemetry.io/

## Enabling telemetry

You can enable telemetry in multiple ways. Configuration is primarily managed via the [`.gemini/settings.json` file](./cli/configuration.md) and environment variables, but CLI flags can override these settings for a specific session.

### Order of precedence

The following lists the precedence for applying telemetry settings, with items listed higher having greater precedence:

1.  **CLI flags (for `gemini` command):**
    - `--telemetry` / `--no-telemetry`: Overrides `telemetry.enabled`.
    - `--telemetry-target <local|gcp>`: Overrides `telemetry.target`.
    - `--telemetry-otlp-endpoint <URL>`: Overrides `telemetry.otlpEndpoint`.
    - `--telemetry-log-prompts` / `--no-telemetry-log-prompts`: Overrides `telemetry.logPrompts`.

1.  **Environment variables:**
    - `OTEL_EXPORTER_OTLP_ENDPOINT`: Overrides `telemetry.otlpEndpoint`.

1.  **Workspace settings file (`.gemini/settings.json`):** Values from the `telemetry` object in this project-specific file.

1.  **User settings file (`~/.gemini/settings.json`):** Values from the `telemetry` object in this global user file.

1.  **Defaults:** applied if not set by any of the above.
    - `telemetry.enabled`: `false`
    - `telemetry.target`: `local`
    - `telemetry.otlpEndpoint`: `http://localhost:4317`
    - `telemetry.logPrompts`: `true`

**For the `npm run telemetry -- --target=<gcp|local>` script:**
The `--target` argument to this script _only_ overrides the `telemetry.target` for the duration and purpose of that script (i.e., choosing which collector to start). It does not permanently change your `settings.json`. The script will first look at `settings.json` for a `telemetry.target` to use as its default.

### Example settings

The following code can be added to your workspace (`.gemini/settings.json`) or user (`~/.gemini/settings.json`) settings to enable telemetry and send the output to Google Cloud:

```json
{
  "telemetry": {
    "enabled": true,
    "target": "gcp"
  },
  "sandbox": false
}
```

## Running an OTEL Collector

An OTEL Collector is a service that receives, processes, and exports telemetry data.
The CLI sends data using the OTLP/gRPC protocol.

Learn more about OTEL exporter standard configuration in [documentation][otel-config-docs].

[otel-config-docs]: https://opentelemetry.io/docs/languages/sdk-configuration/otlp-exporter/

### Local

Use the `npm run telemetry -- --target=local` command to automate the process of setting up a local telemetry pipeline, including configuring the necessary settings in your `.gemini/settings.json` file. The underlying script installs `otelcol-contrib` (the OpenTelemetry Collector) and `jaeger` (The Jaeger UI for viewing traces). To use it:

1.  **Run the command**:
    Execute the command from the root of the repository:

    ```bash
    npm run telemetry -- --target=local
    ```

    The script will:
    - Download Jaeger and OTEL if needed.
    - Start a local Jaeger instance.
    - Start an OTEL collector configured to receive data from Gemini CLI.
    - Automatically enable telemetry in your workspace settings.
    - On exit, disable telemetry.

1.  **View traces**:
    Open your web browser and navigate to **http://localhost:16686** to access the Jaeger UI. Here you can inspect detailed traces of Gemini CLI operations.

1.  **Inspect logs and metrics**:
    The script redirects the OTEL collector output (which includes logs and metrics) to `~/.gemini/tmp/<projectHash>/otel/collector.log`. The script will provide links to view and a command to tail your telemetry data (traces, metrics, logs) locally.

1.  **Stop the services**:
    Press `Ctrl+C` in the terminal where the script is running to stop the OTEL Collector and Jaeger services.

### Google Cloud

Use the `npm run telemetry -- --target=gcp` command to automate setting up a local OpenTelemetry collector that forwards data to your Google Cloud project, including configuring the necessary settings in your `.gemini/settings.json` file. The underlying script installs `otelcol-contrib`. To use it:

1.  **Prerequisites**:
    - Have a Google Cloud project ID.
    - Export the `GOOGLE_CLOUD_PROJECT` environment variable to make it available to the OTEL collector.
      ```bash
      export OTLP_GOOGLE_CLOUD_PROJECT="your-project-id"
      ```
    - Authenticate with Google Cloud (e.g., run `gcloud auth application-default login` or ensure `GOOGLE_APPLICATION_CREDENTIALS` is set).
    - Ensure your Google Cloud account/service account has the necessary IAM roles: "Cloud Trace Agent", "Monitoring Metric Writer", and "Logs Writer".

1.  **Run the command**:
    Execute the command from the root of the repository:

    ```bash
    npm run telemetry -- --target=gcp
    ```

    The script will:
    - Download the `otelcol-contrib` binary if needed.
    - Start an OTEL collector configured to receive data from Gemini CLI and export it to your specified Google Cloud project.
    - Automatically enable telemetry and disable sandbox mode in your workspace settings (`.gemini/settings.json`).
    - Provide direct links to view traces, metrics, and logs in your Google Cloud Console.
    - On exit (Ctrl+C), it will attempt to restore your original telemetry and sandbox settings.

1.  **Run Gemini CLI:**
    In a separate terminal, run your Gemini CLI commands. This generates telemetry data that the collector captures.

1.  **View telemetry in Google Cloud**:
    Use the links provided by the script to navigate to the Google Cloud Console and view your traces, metrics, and logs.

1.  **Inspect local collector logs**:
    The script redirects the local OTEL collector output to `~/.gemini/tmp/<projectHash>/otel/collector-gcp.log`. The script provides links to view and command to tail your collector logs locally.

1.  **Stop the service**:
    Press `Ctrl+C` in the terminal where the script is running to stop the OTEL Collector.

## Logs and metric reference

The following section describes the structure of logs and metrics generated for Gemini CLI.

- A `sessionId` is included as a common attribute on all logs and metrics.

### Logs

Logs are timestamped records of specific events. The following events are logged for Gemini CLI:

- `gemini_cli.config`: This event occurs once at startup with the CLI's configuration.
  - **Attributes**:
    - `model` (string)
    - `embedding_model` (string)
    - `sandbox_enabled` (boolean)
    - `core_tools_enabled` (string)
    - `approval_mode` (string)
    - `api_key_enabled` (boolean)
    - `vertex_ai_enabled` (boolean)
    - `code_assist_enabled` (boolean)
    - `log_prompts_enabled` (boolean)
    - `file_filtering_respect_git_ignore` (boolean)
    - `debug_mode` (boolean)
    - `mcp_servers` (string)

- `gemini_cli.user_prompt`: This event occurs when a user submits a prompt.
  - **Attributes**:
    - `prompt_length`
    - `prompt` (this attribute is excluded if `log_prompts_enabled` is configured to be `false`)

- `gemini_cli.tool_call`: This event occurs for each function call.
  - **Attributes**:
    - `function_name`
    - `function_args`
    - `duration_ms`
    - `success` (boolean)
    - `decision` (string: "accept", "reject", or "modify", if applicable)
    - `error` (if applicable)
    - `error_type` (if applicable)

- `gemini_cli.api_request`: This event occurs when making a request to Gemini API.
  - **Attributes**:
    - `model`
    - `request_text` (if applicable)

- `gemini_cli.api_error`: This event occurs if the API request fails.
  - **Attributes**:
    - `model`
    - `error`
    - `error_type`
    - `status_code`
    - `duration_ms`

- `gemini_cli.api_response`: This event occurs upon receiving a response from Gemini API.
  - **Attributes**:
    - `model`
    - `status_code`
    - `duration_ms`
    - `error` (optional)
    - `input_token_count`
    - `output_token_count`
    - `cached_content_token_count`
    - `thoughts_token_count`
    - `tool_token_count`
    - `response_text` (if applicable)

### Metrics

Metrics are numerical measurements of behavior over time. The following metrics are collected for Gemini CLI:

- `gemini_cli.session.count` (Counter, Int): Incremented once per CLI startup.

- `gemini_cli.tool.call.count` (Counter, Int): Counts tool calls.
  - **Attributes**:
    - `function_name`
    - `success` (boolean)
    - `decision` (string: "accept", "reject", or "modify", if applicable)

- `gemini_cli.tool.call.latency` (Histogram, ms): Measures tool call latency.
  - **Attributes**:
    - `function_name`
    - `decision` (string: "accept", "reject", or "modify", if applicable)

- `gemini_cli.api.request.count` (Counter, Int): Counts all API requests.
  - **Attributes**:
    - `model`
    - `status_code`
    - `error_type` (if applicable)

- `gemini_cli.api.request.latency` (Histogram, ms): Measures API request latency.
  - **Attributes**:
    - `model`

- `gemini_cli.token.usage` (Counter, Int): Counts the number of tokens used.
  - **Attributes**:
    - `model`
    - `type` (string: "input", "output", "thought", "cache", or "tool")

- `gemini_cli.file.operation.count` (Counter, Int): Counts file operations.
  - **Attributes**:
    - `operation` (string: "create", "read", "update"): The type of file operation.
    - `lines` (Int, if applicable): Number of lines in the file.
    - `mimetype` (string, if applicable): Mimetype of the file.
    - `extension` (string, if applicable): File extension of the file.
--- End of ./telemetry.md ---

--- Start of ./core/tools-api.md ---
# Gemini CLI Core: Tools API

The Gemini CLI core (`packages/core`) features a robust system for defining, registering, and executing tools. These tools extend the capabilities of the Gemini model, allowing it to interact with the local environment, fetch web content, and perform various actions beyond simple text generation.

## Core Concepts

- **Tool (`tools.ts`):** An interface and base class (`BaseTool`) that defines the contract for all tools. Each tool must have:
  - `name`: A unique internal name (used in API calls to Gemini).
  - `displayName`: A user-friendly name.
  - `description`: A clear explanation of what the tool does, which is provided to the Gemini model.
  - `parameterSchema`: A JSON schema defining the parameters the tool accepts. This is crucial for the Gemini model to understand how to call the tool correctly.
  - `validateToolParams()`: A method to validate incoming parameters.
  - `getDescription()`: A method to provide a human-readable description of what the tool will do with specific parameters before execution.
  - `shouldConfirmExecute()`: A method to determine if user confirmation is required before execution (e.g., for potentially destructive operations).
  - `execute()`: The core method that performs the tool's action and returns a `ToolResult`.

- **`ToolResult` (`tools.ts`):** An interface defining the structure of a tool's execution outcome:
  - `llmContent`: The factual string content to be included in the history sent back to the LLM for context.
  - `returnDisplay`: A user-friendly string (often Markdown) or a special object (like `FileDiff`) for display in the CLI.

- **Tool Registry (`tool-registry.ts`):** A class (`ToolRegistry`) responsible for:
  - **Registering Tools:** Holding a collection of all available built-in tools (e.g., `ReadFileTool`, `ShellTool`).
  - **Discovering Tools:** It can also discover tools dynamically:
    - **Command-based Discovery:** If `toolDiscoveryCommand` is configured in settings, this command is executed. It's expected to output JSON describing custom tools, which are then registered as `DiscoveredTool` instances.
    - **MCP-based Discovery:** If `mcpServerCommand` is configured, the registry can connect to a Model Context Protocol (MCP) server to list and register tools (`DiscoveredMCPTool`).
  - **Providing Schemas:** Exposing the `FunctionDeclaration` schemas of all registered tools to the Gemini model, so it knows what tools are available and how to use them.
  - **Retrieving Tools:** Allowing the core to get a specific tool by name for execution.

## Built-in Tools

The core comes with a suite of pre-defined tools, typically found in `packages/core/src/tools/`. These include:

- **File System Tools:**
  - `LSTool` (`ls.ts`): Lists directory contents.
  - `ReadFileTool` (`read-file.ts`): Reads the content of a single file. It takes an `absolute_path` parameter, which must be an absolute path.
  - `WriteFileTool` (`write-file.ts`): Writes content to a file.
  - `GrepTool` (`grep.ts`): Searches for patterns in files.
  - `GlobTool` (`glob.ts`): Finds files matching glob patterns.
  - `EditTool` (`edit.ts`): Performs in-place modifications to files (often requiring confirmation).
  - `ReadManyFilesTool` (`read-many-files.ts`): Reads and concatenates content from multiple files or glob patterns (used by the `@` command in CLI).
- **Execution Tools:**
  - `ShellTool` (`shell.ts`): Executes arbitrary shell commands (requires careful sandboxing and user confirmation).
- **Web Tools:**
  - `WebFetchTool` (`web-fetch.ts`): Fetches content from a URL.
  - `WebSearchTool` (`web-search.ts`): Performs a web search.
- **Memory Tools:**
  - `MemoryTool` (`memoryTool.ts`): Interacts with the AI's memory.

Each of these tools extends `BaseTool` and implements the required methods for its specific functionality.

## Tool Execution Flow

1.  **Model Request:** The Gemini model, based on the user's prompt and the provided tool schemas, decides to use a tool and returns a `FunctionCall` part in its response, specifying the tool name and arguments.
2.  **Core Receives Request:** The core parses this `FunctionCall`.
3.  **Tool Retrieval:** It looks up the requested tool in the `ToolRegistry`.
4.  **Parameter Validation:** The tool's `validateToolParams()` method is called.
5.  **Confirmation (if needed):**
    - The tool's `shouldConfirmExecute()` method is called.
    - If it returns details for confirmation, the core communicates this back to the CLI, which prompts the user.
    - The user's decision (e.g., proceed, cancel) is sent back to the core.
6.  **Execution:** If validated and confirmed (or if no confirmation is needed), the core calls the tool's `execute()` method with the provided arguments and an `AbortSignal` (for potential cancellation).
7.  **Result Processing:** The `ToolResult` from `execute()` is received by the core.
8.  **Response to Model:** The `llmContent` from the `ToolResult` is packaged as a `FunctionResponse` and sent back to the Gemini model so it can continue generating a user-facing response.
9.  **Display to User:** The `returnDisplay` from the `ToolResult` is sent to the CLI to show the user what the tool did.

## Extending with Custom Tools

While direct programmatic registration of new tools by users isn't explicitly detailed as a primary workflow in the provided files for typical end-users, the architecture supports extension through:

- **Command-based Discovery:** Advanced users or project administrators can define a `toolDiscoveryCommand` in `settings.json`. This command, when run by the Gemini CLI core, should output a JSON array of `FunctionDeclaration` objects. The core will then make these available as `DiscoveredTool` instances. The corresponding `toolCallCommand` would then be responsible for actually executing these custom tools.
- **MCP Server(s):** For more complex scenarios, one or more MCP servers can be set up and configured via the `mcpServers` setting in `settings.json`. The Gemini CLI core can then discover and use tools exposed by these servers. As mentioned, if you have multiple MCP servers, the tool names will be prefixed with the server name from your configuration (e.g., `serverAlias__actualToolName`).

This tool system provides a flexible and powerful way to augment the Gemini model's capabilities, making the Gemini CLI a versatile assistant for a wide range of tasks.
--- End of ./core/tools-api.md ---

--- Start of ./tools/file-system.md ---
# Gemini CLI file system tools

The Gemini CLI provides a comprehensive suite of tools for interacting with the local file system. These tools allow the Gemini model to read from, write to, list, search, and modify files and directories, all under your control and typically with confirmation for sensitive operations.

**Note:** All file system tools operate within a `rootDirectory` (usually the current working directory where you launched the CLI) for security. Paths that you provide to these tools are generally expected to be absolute or are resolved relative to this root directory.

## 1. `list_directory` (ReadFolder)

`list_directory` lists the names of files and subdirectories directly within a specified directory path. It can optionally ignore entries matching provided glob patterns.

- **Tool name:** `list_directory`
- **Display name:** ReadFolder
- **File:** `ls.ts`
- **Parameters:**
  - `path` (string, required): The absolute path to the directory to list.
  - `ignore` (array of strings, optional): A list of glob patterns to exclude from the listing (e.g., `["*.log", ".git"]`).
  - `respect_git_ignore` (boolean, optional): Whether to respect `.gitignore` patterns when listing files. Defaults to `true`.
- **Behavior:**
  - Returns a list of file and directory names.
  - Indicates whether each entry is a directory.
  - Sorts entries with directories first, then alphabetically.
- **Output (`llmContent`):** A string like: `Directory listing for /path/to/your/folder:\n[DIR] subfolder1\nfile1.txt\nfile2.png`
- **Confirmation:** No.

## 2. `read_file` (ReadFile)

`read_file` reads and returns the content of a specified file. This tool handles text, images (PNG, JPG, GIF, WEBP, SVG, BMP), and PDF files. For text files, it can read specific line ranges. Other binary file types are generally skipped.

- **Tool name:** `read_file`
- **Display name:** ReadFile
- **File:** `read-file.ts`
- **Parameters:**
  - `path` (string, required): The absolute path to the file to read.
  - `offset` (number, optional): For text files, the 0-based line number to start reading from. Requires `limit` to be set.
  - `limit` (number, optional): For text files, the maximum number of lines to read. If omitted, reads a default maximum (e.g., 2000 lines) or the entire file if feasible.
- **Behavior:**
  - For text files: Returns the content. If `offset` and `limit` are used, returns only that slice of lines. Indicates if content was truncated due to line limits or line length limits.
  - For image and PDF files: Returns the file content as a base64-encoded data structure suitable for model consumption.
  - For other binary files: Attempts to identify and skip them, returning a message indicating it's a generic binary file.
- **Output:** (`llmContent`):
  - For text files: The file content, potentially prefixed with a truncation message (e.g., `[File content truncated: showing lines 1-100 of 500 total lines...]\nActual file content...`).
  - For image/PDF files: An object containing `inlineData` with `mimeType` and base64 `data` (e.g., `{ inlineData: { mimeType: 'image/png', data: 'base64encodedstring' } }`).
  - For other binary files: A message like `Cannot display content of binary file: /path/to/data.bin`.
- **Confirmation:** No.

## 3. `write_file` (WriteFile)

`write_file` writes content to a specified file. If the file exists, it will be overwritten. If the file doesn't exist, it (and any necessary parent directories) will be created.

- **Tool name:** `write_file`
- **Display name:** WriteFile
- **File:** `write-file.ts`
- **Parameters:**
  - `file_path` (string, required): The absolute path to the file to write to.
  - `content` (string, required): The content to write into the file.
- **Behavior:**
  - Writes the provided `content` to the `file_path`.
  - Creates parent directories if they don't exist.
- **Output (`llmContent`):** A success message, e.g., `Successfully overwrote file: /path/to/your/file.txt` or `Successfully created and wrote to new file: /path/to/new/file.txt`.
- **Confirmation:** Yes. Shows a diff of changes and asks for user approval before writing.

## 4. `glob` (FindFiles)

`glob` finds files matching specific glob patterns (e.g., `src/**/*.ts`, `*.md`), returning absolute paths sorted by modification time (newest first).

- **Tool name:** `glob`
- **Display name:** FindFiles
- **File:** `glob.ts`
- **Parameters:**
  - `pattern` (string, required): The glob pattern to match against (e.g., `"*.py"`, `"src/**/*.js"`).
  - `path` (string, optional): The absolute path to the directory to search within. If omitted, searches the tool's root directory.
  - `case_sensitive` (boolean, optional): Whether the search should be case-sensitive. Defaults to `false`.
  - `respect_git_ignore` (boolean, optional): Whether to respect .gitignore patterns when finding files. Defaults to `true`.
- **Behavior:**
  - Searches for files matching the glob pattern within the specified directory.
  - Returns a list of absolute paths, sorted with the most recently modified files first.
  - Ignores common nuisance directories like `node_modules` and `.git` by default.
- **Output (`llmContent`):** A message like: `Found 5 file(s) matching "*.ts" within src, sorted by modification time (newest first):\nsrc/file1.ts\nsrc/subdir/file2.ts...`
- **Confirmation:** No.

## 5. `search_file_content` (SearchText)

`search_file_content` searches for a regular expression pattern within the content of files in a specified directory. Can filter files by a glob pattern. Returns the lines containing matches, along with their file paths and line numbers.

- **Tool name:** `search_file_content`
- **Display name:** SearchText
- **File:** `grep.ts`
- **Parameters:**
  - `pattern` (string, required): The regular expression (regex) to search for (e.g., `"function\s+myFunction"`).
  - `path` (string, optional): The absolute path to the directory to search within. Defaults to the current working directory.
  - `include` (string, optional): A glob pattern to filter which files are searched (e.g., `"*.js"`, `"src/**/*.{ts,tsx}"`). If omitted, searches most files (respecting common ignores).
- **Behavior:**
  - Uses `git grep` if available in a Git repository for speed, otherwise falls back to system `grep` or a JavaScript-based search.
  - Returns a list of matching lines, each prefixed with its file path (relative to the search directory) and line number.
- **Output (`llmContent`):** A formatted string of matches, e.g.:
  ```
  Found 3 matches for pattern "myFunction" in path "." (filter: "*.ts"):
  ---
  File: src/utils.ts
  L15: export function myFunction() {
  L22:   myFunction.call();
  ---
  File: src/index.ts
  L5: import { myFunction } from './utils';
  ---
  ```
- **Confirmation:** No.

## 6. `replace` (Edit)

`replace` replaces text within a file. By default, replaces a single occurrence, but can replace multiple occurrences when `expected_replacements` is specified. This tool is designed for precise, targeted changes and requires significant context around the `old_string` to ensure it modifies the correct location.

- **Tool name:** `replace`
- **Display name:** Edit
- **File:** `edit.ts`
- **Parameters:**
  - `file_path` (string, required): The absolute path to the file to modify.
  - `old_string` (string, required): The exact literal text to replace.

    **CRITICAL:** This string must uniquely identify the single instance to change. It should include at least 3 lines of context _before_ and _after_ the target text, matching whitespace and indentation precisely. If `old_string` is empty, the tool attempts to create a new file at `file_path` with `new_string` as content.

  - `new_string` (string, required): The exact literal text to replace `old_string` with.
  - `expected_replacements` (number, optional): The number of occurrences to replace. Defaults to `1`.

- **Behavior:**
  - If `old_string` is empty and `file_path` does not exist, creates a new file with `new_string` as content.
  - If `old_string` is provided, it reads the `file_path` and attempts to find exactly one occurrence of `old_string`.
  - If one occurrence is found, it replaces it with `new_string`.
  - **Enhanced Reliability (Multi-Stage Edit Correction):** To significantly improve the success rate of edits, especially when the model-provided `old_string` might not be perfectly precise, the tool incorporates a multi-stage edit correction mechanism.
    - If the initial `old_string` isn't found or matches multiple locations, the tool can leverage the Gemini model to iteratively refine `old_string` (and potentially `new_string`).
    - This self-correction process attempts to identify the unique segment the model intended to modify, making the `replace` operation more robust even with slightly imperfect initial context.
- **Failure conditions:** Despite the correction mechanism, the tool will fail if:
  - `file_path` is not absolute or is outside the root directory.
  - `old_string` is not empty, but the `file_path` does not exist.
  - `old_string` is empty, but the `file_path` already exists.
  - `old_string` is not found in the file after attempts to correct it.
  - `old_string` is found multiple times, and the self-correction mechanism cannot resolve it to a single, unambiguous match.
- **Output (`llmContent`):**
  - On success: `Successfully modified file: /path/to/file.txt (1 replacements).` or `Created new file: /path/to/new_file.txt with provided content.`
  - On failure: An error message explaining the reason (e.g., `Failed to edit, 0 occurrences found...`, `Failed to edit, expected 1 occurrences but found 2...`).
- **Confirmation:** Yes. Shows a diff of the proposed changes and asks for user approval before writing to the file.

These file system tools provide a foundation for the Gemini CLI to understand and interact with your local project context.
--- End of ./tools/file-system.md ---

--- Start of ./tools/multi-file.md ---
# Multi File Read Tool (`read_many_files`)

This document describes the `read_many_files` tool for the Gemini CLI.

## Description

Use `read_many_files` to read content from multiple files specified by paths or glob patterns. The behavior of this tool depends on the provided files:

- For text files, this tool concatenates their content into a single string.
- For image (e.g., PNG, JPEG) and PDF files, it reads and returns them as base64-encoded data, provided they are explicitly requested by name or extension.

`read_many_files` can be used to perform tasks such as getting an overview of a codebase, finding where specific functionality is implemented, reviewing documentation, or gathering context from multiple configuration files.

### Arguments

`read_many_files` takes the following arguments:

- `paths` (list[string], required): An array of glob patterns or paths relative to the tool's target directory (e.g., `["src/**/*.ts"]`, `["README.md", "docs/", "assets/logo.png"]`).
- `exclude` (list[string], optional): Glob patterns for files/directories to exclude (e.g., `["**/*.log", "temp/"]`). These are added to default excludes if `useDefaultExcludes` is true.
- `include` (list[string], optional): Additional glob patterns to include. These are merged with `paths` (e.g., `["*.test.ts"]` to specifically add test files if they were broadly excluded, or `["images/*.jpg"]` to include specific image types).
- `recursive` (boolean, optional): Whether to search recursively. This is primarily controlled by `**` in glob patterns. Defaults to `true`.
- `useDefaultExcludes` (boolean, optional): Whether to apply a list of default exclusion patterns (e.g., `node_modules`, `.git`, non image/pdf binary files). Defaults to `true`.
- `respect_git_ignore` (boolean, optional): Whether to respect .gitignore patterns when finding files. Defaults to true.

## How to use `read_many_files` with the Gemini CLI

`read_many_files` searches for files matching the provided `paths` and `include` patterns, while respecting `exclude` patterns and default excludes (if enabled).

- For text files: it reads the content of each matched file (attempting to skip binary files not explicitly requested as image/PDF) and concatenates it into a single string, with a separator `--- {filePath} ---` between the content of each file. Uses UTF-8 encoding by default.
- For image and PDF files: if explicitly requested by name or extension (e.g., `paths: ["logo.png"]` or `include: ["*.pdf"]`), the tool reads the file and returns its content as a base64 encoded string.
- The tool attempts to detect and skip other binary files (those not matching common image/PDF types or not explicitly requested) by checking for null bytes in their initial content.

Usage:

```
read_many_files(paths=["Your files or paths here."], include=["Additional files to include."], exclude=["Files to exclude."], recursive=False, useDefaultExcludes=false, respect_git_ignore=true)
```

## `read_many_files` examples

Read all TypeScript files in the `src` directory:

```
read_many_files(paths=["src/**/*.ts"])
```

Read the main README, all Markdown files in the `docs` directory, and a specific logo image, excluding a specific file:

```
read_many_files(paths=["README.md", "docs/**/*.md", "assets/logo.png"], exclude=["docs/OLD_README.md"])
```

Read all JavaScript files but explicitly including test files and all JPEGs in an `images` folder:

```
read_many_files(paths=["**/*.js"], include=["**/*.test.js", "images/**/*.jpg"], useDefaultExcludes=False)
```

## Important notes

- **Binary file handling:**
  - **Image/PDF files:** The tool can read common image types (PNG, JPEG, etc.) and PDF files, returning them as base64 encoded data. These files _must_ be explicitly targeted by the `paths` or `include` patterns (e.g., by specifying the exact filename like `image.png` or a pattern like `*.jpeg`).
  - **Other binary files:** The tool attempts to detect and skip other types of binary files by examining their initial content for null bytes. The tool excludes these files from its output.
- **Performance:** Reading a very large number of files or very large individual files can be resource-intensive.
- **Path specificity:** Ensure paths and glob patterns are correctly specified relative to the tool's target directory. For image/PDF files, ensure the patterns are specific enough to include them.
- **Default excludes:** Be aware of the default exclusion patterns (like `node_modules`, `.git`) and use `useDefaultExcludes=False` if you need to override them, but do so cautiously.
--- End of ./tools/multi-file.md ---

--- Start of ./tools/shell.md ---
# Shell Tool (`run_shell_command`)

This document describes the `run_shell_command` tool for the Gemini CLI.

## Description

Use `run_shell_command` to interact with the underlying system, run scripts, or perform command-line operations. `run_shell_command` executes a given shell command. On Windows, the command will be executed with `cmd.exe /c`. On other platforms, the command will be executed with `bash -c`.

### Arguments

`run_shell_command` takes the following arguments:

- `command` (string, required): The exact shell command to execute.
- `description` (string, optional): A brief description of the command's purpose, which will be shown to the user.
- `directory` (string, optional): The directory (relative to the project root) in which to execute the command. If not provided, the command runs in the project root.

## How to use `run_shell_command` with the Gemini CLI

When using `run_shell_command`, the command is executed as a subprocess. `run_shell_command` can start background processes using `&`. The tool returns detailed information about the execution, including:

- `Command`: The command that was executed.
- `Directory`: The directory where the command was run.
- `Stdout`: Output from the standard output stream.
- `Stderr`: Output from the standard error stream.
- `Error`: Any error message reported by the subprocess.
- `Exit Code`: The exit code of the command.
- `Signal`: The signal number if the command was terminated by a signal.
- `Background PIDs`: A list of PIDs for any background processes started.

Usage:

```
run_shell_command(command="Your commands.", description="Your description of the command.", directory="Your execution directory.")
```

## `run_shell_command` examples

List files in the current directory:

```
run_shell_command(command="ls -la")
```

Run a script in a specific directory:

```
run_shell_command(command="./my_script.sh", directory="scripts", description="Run my custom script")
```

Start a background server:

```
run_shell_command(command="npm run dev &", description="Start development server in background")
```

## Important notes

- **Security:** Be cautious when executing commands, especially those constructed from user input, to prevent security vulnerabilities.
- **Interactive commands:** Avoid commands that require interactive user input, as this can cause the tool to hang. Use non-interactive flags if available (e.g., `npm init -y`).
- **Error handling:** Check the `Stderr`, `Error`, and `Exit Code` fields to determine if a command executed successfully.
- **Background processes:** When a command is run in the background with `&`, the tool will return immediately and the process will continue to run in the background. The `Background PIDs` field will contain the process ID of the background process.

## Command Restrictions

You can restrict the commands that can be executed by the `run_shell_command` tool by using the `coreTools` and `excludeTools` settings in your configuration file.

- `coreTools`: To restrict `run_shell_command` to a specific set of commands, add entries to the `coreTools` list in the format `run_shell_command(<command>)`. For example, `"coreTools": ["run_shell_command(git)"]` will only allow `git` commands. Including the generic `run_shell_command` acts as a wildcard, allowing any command not explicitly blocked.
- `excludeTools`: To block specific commands, add entries to the `excludeTools` list in the format `run_shell_command(<command>)`. For example, `"excludeTools": ["run_shell_command(rm)"]` will block `rm` commands.

The validation logic is designed to be secure and flexible:

1.  **Command Chaining Disabled**: The tool automatically splits commands chained with `&&`, `||`, or `;` and validates each part separately. If any part of the chain is disallowed, the entire command is blocked.
2.  **Prefix Matching**: The tool uses prefix matching. For example, if you allow `git`, you can run `git status` or `git log`.
3.  **Blocklist Precedence**: The `excludeTools` list is always checked first. If a command matches a blocked prefix, it will be denied, even if it also matches an allowed prefix in `coreTools`.

### Command Restriction Examples

**Allow only specific command prefixes**

To allow only `git` and `npm` commands, and block all others:

```json
{
  "coreTools": ["run_shell_command(git)", "run_shell_command(npm)"]
}
```

- `git status`: Allowed
- `npm install`: Allowed
- `ls -l`: Blocked

**Block specific command prefixes**

To block `rm` and allow all other commands:

```json
{
  "coreTools": ["run_shell_command"],
  "excludeTools": ["run_shell_command(rm)"]
}
```

- `rm -rf /`: Blocked
- `git status`: Allowed
- `npm install`: Allowed

**Blocklist takes precedence**

If a command prefix is in both `coreTools` and `excludeTools`, it will be blocked.

```json
{
  "coreTools": ["run_shell_command(git)"],
  "excludeTools": ["run_shell_command(git push)"]
}
```

- `git push origin main`: Blocked
- `git status`: Allowed

**Block all shell commands**

To block all shell commands, add the `run_shell_command` wildcard to `excludeTools`:

```json
{
  "excludeTools": ["run_shell_command"]
}
```

- `ls -l`: Blocked
- `any other command`: Blocked

## Security Note for `excludeTools`

Command-specific restrictions in
`excludeTools` for `run_shell_command` are based on simple string matching and can be easily bypassed. This feature is **not a security mechanism** and should not be relied upon to safely execute untrusted code. It is recommended to use `coreTools` to explicitly select commands
that can be executed.
--- End of ./tools/shell.md ---

--- Start of ./tools/web-fetch.md ---
# Web Fetch Tool (`web_fetch`)

This document describes the `web_fetch` tool for the Gemini CLI.

## Description

Use `web_fetch` to summarize, compare, or extract information from web pages. The `web_fetch` tool processes content from one or more URLs (up to 20) embedded in a prompt. `web_fetch` takes a natural language prompt and returns a generated response.

### Arguments

`web_fetch` takes one argument:

- `prompt` (string, required): A comprehensive prompt that includes the URL(s) (up to 20) to fetch and specific instructions on how to process their content. For example: `"Summarize https://example.com/article and extract key points from https://another.com/data"`. The prompt must contain at least one URL starting with `http://` or `https://`.

## How to use `web_fetch` with the Gemini CLI

To use `web_fetch` with the Gemini CLI, provide a natural language prompt that contains URLs. The tool will ask for confirmation before fetching any URLs. Once confirmed, the tool will process URLs through Gemini API's `urlContext`.

If the Gemini API cannot access the URL, the tool will fall back to fetching content directly from the local machine. The tool will format the response, including source attribution and citations where possible. The tool will then provide the response to the user.

Usage:

```
web_fetch(prompt="Your prompt, including a URL such as https://google.com.")
```

## `web_fetch` examples

Summarize a single article:

```
web_fetch(prompt="Can you summarize the main points of https://example.com/news/latest")
```

Compare two articles:

```
web_fetch(prompt="What are the differences in the conclusions of these two papers: https://arxiv.org/abs/2401.0001 and https://arxiv.org/abs/2401.0002?")
```

## Important notes

- **URL processing:** `web_fetch` relies on the Gemini API's ability to access and process the given URLs.
- **Output quality:** The quality of the output will depend on the clarity of the instructions in the prompt.
--- End of ./tools/web-fetch.md ---

--- Start of ./tools/web-search.md ---
# Web Search Tool (`google_web_search`)

This document describes the `google_web_search` tool.

## Description

Use `google_web_search` to perform a web search using Google Search via the Gemini API. The `google_web_search` tool returns a summary of web results with sources.

### Arguments

`google_web_search` takes one argument:

- `query` (string, required): The search query.

## How to use `google_web_search` with the Gemini CLI

The `google_web_search` tool sends a query to the Gemini API, which then performs a web search. `google_web_search` will return a generated response based on the search results, including citations and sources.

Usage:

```
google_web_search(query="Your query goes here.")
```

## `google_web_search` examples

Get information on a topic:

```
google_web_search(query="latest advancements in AI-powered code generation")
```

## Important notes

- **Response returned:** The `google_web_search` tool returns a processed summary, not a raw list of search results.
- **Citations:** The response includes citations to the sources used to generate the summary.
--- End of ./tools/web-search.md ---

--- Start of ./tools/memory.md ---
# Memory Tool (`save_memory`)

This document describes the `save_memory` tool for the Gemini CLI.

## Description

Use `save_memory` to save and recall information across your Gemini CLI sessions. With `save_memory`, you can direct the CLI to remember key details across sessions, providing personalized and directed assistance.

### Arguments

`save_memory` takes one argument:

- `fact` (string, required): The specific fact or piece of information to remember. This should be a clear, self-contained statement written in natural language.

## How to use `save_memory` with the Gemini CLI

The tool appends the provided `fact` to a special `GEMINI.md` file located in the user's home directory (`~/.gemini/GEMINI.md`). This file can be configured to have a different name.

Once added, the facts are stored under a `## Gemini Added Memories` section. This file is loaded as context in subsequent sessions, allowing the CLI to recall the saved information.

Usage:

```
save_memory(fact="Your fact here.")
```

### `save_memory` examples

Remember a user preference:

```
save_memory(fact="My preferred programming language is Python.")
```

Store a project-specific detail:

```
save_memory(fact="The project I'm currently working on is called 'gemini-cli'.")
```

## Important notes

- **General usage:** This tool should be used for concise, important facts. It is not intended for storing large amounts of data or conversational history.
- **Memory file:** The memory file is a plain text Markdown file, so you can view and edit it manually if needed.
--- End of ./tools/memory.md ---

--- Start of CONTRIBUTING.md ---
# How to Contribute

We would love to accept your patches and contributions to this project.

## Before you begin

### Sign our Contributor License Agreement

Contributions to this project must be accompanied by a
[Contributor License Agreement](https://cla.developers.google.com/about) (CLA).
You (or your employer) retain the copyright to your contribution; this simply
gives us permission to use and redistribute your contributions as part of the
project.

If you or your current employer have already signed the Google CLA (even if it
was for a different project), you probably don't need to do it again.

Visit <https://cla.developers.google.com/> to see your current agreements or to
sign a new one.

### Review our Community Guidelines

This project follows [Google's Open Source Community
Guidelines](https://opensource.google/conduct/).

## Contribution Process

### Code Reviews

All submissions, including submissions by project members, require review. We
use [GitHub pull requests](https://docs.github.com/articles/about-pull-requests)
for this purpose.

### Pull Request Guidelines

To help us review and merge your PRs quickly, please follow these guidelines. PRs that do not meet these standards may be closed.

#### 1. Link to an Existing Issue

All PRs should be linked to an existing issue in our tracker. This ensures that every change has been discussed and is aligned with the project's goals before any code is written.

- **For bug fixes:** The PR should be linked to the bug report issue.
- **For features:** The PR should be linked to the feature request or proposal issue that has been approved by a maintainer.

If an issue for your change doesn't exist, please **open one first** and wait for feedback before you start coding.

#### 2. Keep It Small and Focused

We favor small, atomic PRs that address a single issue or add a single, self-contained feature.

- **Do:** Create a PR that fixes one specific bug or adds one specific feature.
- **Don't:** Bundle multiple unrelated changes (e.g., a bug fix, a new feature, and a refactor) into a single PR.

Large changes should be broken down into a series of smaller, logical PRs that can be reviewed and merged independently.

#### 3. Use Draft PRs for Work in Progress

If you'd like to get early feedback on your work, please use GitHub's **Draft Pull Request** feature. This signals to the maintainers that the PR is not yet ready for a formal review but is open for discussion and initial feedback.

#### 4. Ensure All Checks Pass

Before submitting your PR, ensure that all automated checks are passing by running `npm run preflight`. This command runs all tests, linting, and other style checks.

#### 5. Update Documentation

If your PR introduces a user-facing change (e.g., a new command, a modified flag, or a change in behavior), you must also update the relevant documentation in the `/docs` directory.

#### 6. Write Clear Commit Messages and a Good PR Description

Your PR should have a clear, descriptive title and a detailed description of the changes. Follow the [Conventional Commits](https://www.conventionalcommits.org/) standard for your commit messages.

- **Good PR Title:** `feat(cli): Add --json flag to 'config get' command`
- **Bad PR Title:** `Made some changes`

In the PR description, explain the "why" behind your changes and link to the relevant issue (e.g., `Fixes #123`).

## Forking

If you are forking the repository you will be able to run the Built, Test and Integration test workflows. However in order to make the integration tests run you'll need to add a [GitHub Repository Secret](<[url](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository)>) with a value of `GEMINI_API_KEY` and set that to a valid API key that you have available. Your key and secret are private to your repo; no one without access can see your key and you cannot see any secrets related to this repo.

Additionally you will need to click on the `Actions` tab and enable workflows for your repository, you'll find it's the large blue button in the center of the screen.

## Development Setup and Workflow

This section guides contributors on how to build, modify, and understand the development setup of this project.

### Setting Up the Development Environment

**Prerequisites:**

1. Install [Node 18+](https://nodejs.org/en/download)
2. Git

### Build Process

To clone the repository:

```bash
git clone https://github.com/google-gemini/gemini-cli.git # Or your fork's URL
cd gemini-cli
```

To install dependencies defined in `package.json` as well as root dependencies:

```bash
npm install
```

To build the entire project (all packages):

```bash
npm run build
```

This command typically compiles TypeScript to JavaScript, bundles assets, and prepares the packages for execution. Refer to `scripts/build.js` and `package.json` scripts for more details on what happens during the build.

### Enabling Sandboxing

Container-based [sandboxing](#sandboxing) is highly recommended and requires, at a minimum, setting `GEMINI_SANDBOX=true` in your `~/.env` and ensuring a container engine (e.g. `docker` or `podman`) is available. See [Sandboxing](#sandboxing) for details.

To build both the `gemini` CLI utility and the sandbox container, run `build:all` from the root directory:

```bash
npm run build:all
```

To skip building the sandbox container, you can use `npm run build` instead.

### Running

To start the Gemini CLI from the source code (after building), run the following command from the root directory:

```bash
npm start
```

If you’d like to run the source build outside of the gemini-cli folder you can utilize `npm link path/to/gemini-cli/packages/cli` (see: [docs](https://docs.npmjs.com/cli/v9/commands/npm-link)) or `alias gemini="node path/to/gemini-cli/packages/cli"` to run with `gemini`

### Running Tests

This project contains two types of tests: unit tests and integration tests.

#### Unit Tests

To execute the unit test suite for the project:

```bash
npm run test
```

This will run tests located in the `packages/core` and `packages/cli` directories. Ensure tests pass before submitting any changes. For a more comprehensive check, it is recommended to run `npm run preflight`.

#### Integration Tests

The integration tests are designed to validate the end-to-end functionality of the Gemini CLI. They are not run as part of the default `npm run test` command.

To run the integration tests, use the following command:

```bash
npm run test:e2e
```

For more detailed information on the integration testing framework, please see the [Integration Tests documentation](./docs/integration-tests.md).

### Linting and Preflight Checks

To ensure code quality and formatting consistency, run the preflight check:

```bash
npm run preflight
```

This command will run ESLint, Prettier, all tests, and other checks as defined in the project's `package.json`.

_ProTip_

after cloning create a git precommit hook file to ensure your commits are always clean.

```bash
echo "
# Run npm build and check for errors
if ! npm run preflight; then
  echo "npm build failed. Commit aborted."
  exit 1
fi
" > .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
```

#### Formatting

To separately format the code in this project by running the following command from the root directory:

```bash
npm run format
```

This command uses Prettier to format the code according to the project's style guidelines.

#### Linting

To separately lint the code in this project, run the following command from the root directory:

```bash
npm run lint
```

### Coding Conventions

- Please adhere to the coding style, patterns, and conventions used throughout the existing codebase.
- Consult [GEMINI.md](https://github.com/google-gemini/gemini-cli/blob/main/GEMINI.md) (typically found in the project root) for specific instructions related to AI-assisted development, including conventions for React, comments, and Git usage.
- **Imports:** Pay special attention to import paths. The project uses `eslint-rules/no-relative-cross-package-imports.js` to enforce restrictions on relative imports between packages.

### Project Structure

- `packages/`: Contains the individual sub-packages of the project.
  - `cli/`: The command-line interface.
  - `server/`: The backend server that the CLI interacts with.
- `docs/`: Contains all project documentation.
- `scripts/`: Utility scripts for building, testing, and development tasks.

For more detailed architecture, see `docs/architecture.md`.

## Debugging

### VS Code:

0.  Run the CLI to interactively debug in VS Code with `F5`
1.  Start the CLI in debug mode from the root directory:
    ```bash
    npm run debug
    ```
    This command runs `node --inspect-brk dist/gemini.js` within the `packages/cli` directory, pausing execution until a debugger attaches. You can then open `chrome://inspect` in your Chrome browser to connect to the debugger.
2.  In VS Code, use the "Attach" launch configuration (found in `.vscode/launch.json`).

Alternatively, you can use the "Launch Program" configuration in VS Code if you prefer to launch the currently open file directly, but 'F5' is generally recommended.

To hit a breakpoint inside the sandbox container run:

```bash
DEBUG=1 gemini
```

### React DevTools

To debug the CLI's React-based UI, you can use React DevTools. Ink, the library used for the CLI's interface, is compatible with React DevTools version 4.x.

1.  **Start the Gemini CLI in development mode:**

    ```bash
    DEV=true npm start
    ```

2.  **Install and run React DevTools version 4.28.5 (or the latest compatible 4.x version):**

    You can either install it globally:

    ```bash
    npm install -g react-devtools@4.28.5
    react-devtools
    ```

    Or run it directly using npx:

    ```bash
    npx react-devtools@4.28.5
    ```

    Your running CLI application should then connect to React DevTools.
    ![](/docs/assets/connected_devtools.png)

## Sandboxing

### MacOS Seatbelt

On MacOS, `gemini` uses Seatbelt (`sandbox-exec`) under a `permissive-open` profile (see `packages/cli/src/utils/sandbox-macos-permissive-open.sb`) that restricts writes to the project folder but otherwise allows all other operations and outbound network traffic ("open") by default. You can switch to a `restrictive-closed` profile (see `.../sandbox-macos-strict.sb`) that declines all operations and outbound network traffic ("closed") by default by setting `SEATBELT_PROFILE=restrictive-closed` in your environment or `.env` file. Available built-in profiles are `{permissive,restrictive}-{open,closed,proxied}` (see below for proxied networking). You can also switch to a custom profile `SEATBELT_PROFILE=<profile>` if you also create a file `.gemini/sandbox-macos-<profile>.sb` under your project settings directory `.gemini`.

### Container-based Sandboxing (All Platforms)

For stronger container-based sandboxing on MacOS or other platforms, you can set `GEMINI_SANDBOX=true|docker|podman|<command>` in your environment or `.env` file. The specified command (or if `true` then either `docker` or `podman`) must be installed on the host machine. Once enabled, `npm run build:all` will build a minimal container ("sandbox") image and `npm start` will launch inside a fresh instance of that container. The first build can take 20-30s (mostly due to downloading of the base image) but after that both build and start overhead should be minimal. Default builds (`npm run build`) will not rebuild the sandbox.

Container-based sandboxing mounts the project directory (and system temp directory) with read-write access and is started/stopped/removed automatically as you start/stop Gemini CLI. Files created within the sandbox should be automatically mapped to your user/group on host machine. You can easily specify additional mounts, ports, or environment variables by setting `SANDBOX_{MOUNTS,PORTS,ENV}` as needed. You can also fully customize the sandbox for your projects by creating the files `.gemini/sandbox.Dockerfile` and/or `.gemini/sandbox.bashrc` under your project settings directory (`.gemini`) and running `gemini` with `BUILD_SANDBOX=1` to trigger building of your custom sandbox.

#### Proxied Networking

All sandboxing methods, including MacOS Seatbelt using `*-proxied` profiles, support restricting outbound network traffic through a custom proxy server that can be specified as `GEMINI_SANDBOX_PROXY_COMMAND=<command>`, where `<command>` must start a proxy server that listens on `:::8877` for relevant requests. See `scripts/example-proxy.js` for a minimal proxy that only allows `HTTPS` connections to `example.com:443` (e.g. `curl https://example.com`) and declines all other requests. The proxy is started and stopped automatically alongside the sandbox.

## Manual Publish

We publish an artifact for each commit to our internal registry. But if you need to manually cut a local build, then run the following commands:

```
npm run clean
npm install
npm run auth
npm run prerelease:dev
npm publish --workspaces
```
--- End of CONTRIBUTING.md ---

--- Start of ./troubleshooting.md ---
# Troubleshooting Guide

This guide provides solutions to common issues and debugging tips.

## Authentication

- **Error: `Failed to login. Message: Request contains an invalid argument`**
  - Users with Google Workspace accounts, or users with Google Cloud accounts
    associated with their Gmail accounts may not be able to activate the free
    tier of the Google Code Assist plan.
  - For Google Cloud accounts, you can work around this by setting
    `GOOGLE_CLOUD_PROJECT` to your project ID.
  - You can also grab an API key from [AI
    Studio](https://aistudio.google.com/app/apikey), which also includes a
    separate free tier.

## Frequently asked questions (FAQs)

- **Q: How do I update Gemini CLI to the latest version?**
  - A: If installed globally via npm, update Gemini CLI using the command `npm install -g @google/gemini-cli@latest`. If run from source, pull the latest changes from the repository and rebuild using `npm run build`.

- **Q: Where are Gemini CLI configuration files stored?**
  - A: The CLI configuration is stored within two `settings.json` files: one in your home directory and one in your project's root directory. In both locations, `settings.json` is found in the `.gemini/` folder. Refer to [CLI Configuration](./cli/configuration.md) for more details.

- **Q: Why don't I see cached token counts in my stats output?**
  - A: Cached token information is only displayed when cached tokens are being used. This feature is available for API key users (Gemini API key or Vertex AI) but not for OAuth users (Google Personal/Enterprise accounts) at this time, as the Code Assist API does not support cached content creation. You can still view your total token usage with the `/stats` command.

## Common error messages and solutions

- **Error: `EADDRINUSE` (Address already in use) when starting an MCP server.**
  - **Cause:** Another process is already using the port the MCP server is trying to bind to.
  - **Solution:**
    Either stop the other process that is using the port or configure the MCP server to use a different port.

- **Error: Command not found (when attempting to run Gemini CLI).**
  - **Cause:** Gemini CLI is not correctly installed or not in your system's PATH.
  - **Solution:**
    1.  Ensure Gemini CLI installation was successful.
    2.  If installed globally, check that your npm global binary directory is in your PATH.
    3.  If running from source, ensure you are using the correct command to invoke it (e.g., `node packages/cli/dist/index.js ...`).

- **Error: `MODULE_NOT_FOUND` or import errors.**
  - **Cause:** Dependencies are not installed correctly, or the project hasn't been built.
  - **Solution:**
    1.  Run `npm install` to ensure all dependencies are present.
    2.  Run `npm run build` to compile the project.

- **Error: "Operation not permitted", "Permission denied", or similar.**
  - **Cause:** If sandboxing is enabled, then the application is likely attempting an operation restricted by your sandbox, such as writing outside the project directory or system temp directory.
  - **Solution:** See [Sandboxing](./cli/configuration.md#sandboxing) for more information, including how to customize your sandbox configuration.

- **CLI is not interactive in "CI" environments**
  - **Issue:** The CLI does not enter interactive mode (no prompt appears) if an environment variable starting with `CI_` (e.g., `CI_TOKEN`) is set. This is because the `is-in-ci` package, used by the underlying UI framework, detects these variables and assumes a non-interactive CI environment.
  - **Cause:** The `is-in-ci` package checks for the presence of `CI`, `CONTINUOUS_INTEGRATION`, or any environment variable with a `CI_` prefix. When any of these are found, it signals that the environment is non-interactive, which prevents the CLI from starting in its interactive mode.
  - **Solution:** If the `CI_` prefixed variable is not needed for the CLI to function, you can temporarily unset it for the command. e.g., `env -u CI_TOKEN gemini`

## Debugging Tips

- **CLI debugging:**
  - Use the `--verbose` flag (if available) with CLI commands for more detailed output.
  - Check the CLI logs, often found in a user-specific configuration or cache directory.

- **Core debugging:**
  - Check the server console output for error messages or stack traces.
  - Increase log verbosity if configurable.
  - Use Node.js debugging tools (e.g., `node --inspect`) if you need to step through server-side code.

- **Tool issues:**
  - If a specific tool is failing, try to isolate the issue by running the simplest possible version of the command or operation the tool performs.
  - For `run_shell_command`, check that the command works directly in your shell first.
  - For file system tools, double-check paths and permissions.

- **Pre-flight checks:**
  - Always run `npm run preflight` before committing code. This can catch many common issues related to formatting, linting, and type errors.

If you encounter an issue not covered here, consider searching the project's issue tracker on GitHub or reporting a new issue with detailed information.
--- End of ./troubleshooting.md ---

--- Start of ./tos-privacy.md ---
# Gemini CLI: Terms of Service and Privacy Notice

Gemini CLI is an open-source tool that lets you interact with Google's powerful language models directly from your command-line interface. The Terms of Service and Privacy notices that apply to your usage of Gemini CLI depend on the type of account you use to authenticate with Google. See [quota and pricing](./quota-and-pricing.md) for details on the quota and pricing details that apply to your usage of Gemini CLI.

This article outlines the specific terms and privacy policies applicable for different auth methods.

## 1. Login with Google (Gemini Code Assist for [individuals](https://developers.google.com/gemini-code-assist/docs/overview#supported-features-gca))

For users who authenticate using their Google account to access Gemini Code Assist for individuals:

- Terms of Service: Your use of Gemini CLI is governed by the general [Google Terms of Service](https://policies.google.com/terms?hl=en-US).
- Privacy Notice: The collection and use of your data are described in the [Gemini Code Assist Privacy Notice for Individuals](https://developers.google.com/gemini-code-assist/resources/privacy-notice-gemini-code-assist-individuals).

## 2. Gemini API Key (Using Gemini Developer [API](https://ai.google.dev/gemini-api/docs) a: Unpaid Service, b: Paid Service)

If you are using a Gemini API key for authentication, the following terms apply:

- Terms of Service: Your use is subject to the [Gemini API Terms of Service](https://ai.google.dev/gemini-api/terms). For a. [Unpaid Service](https://ai.google.dev/gemini-api/terms#unpaid-services) or b. [Paid Service](https://ai.google.dev/gemini-api/terms#paid-services)
- Privacy Notice: Information regarding data handling and privacy is detailed in the general [Google Privacy Policy](https://policies.google.com/privacy).

## 3. Login with Google (for Workspace or Licensed Code Assist users)

For users of Standard or Enterprise [edition](https://cloud.google.com/gemini/docs/codeassist/overview#editions-overview) of Gemini Code Assist:

- Terms of Service: The [Google Cloud Platform Terms of Service](https://cloud.google.com/terms) govern your use of the service.
- Privacy Notice: The handling of your data is outlined in the [Gemini Code Assist Privacy Notices](https://developers.google.com/gemini-code-assist/resources/privacy-notices).

## 4. Vertex AI (Using Vertex AI Gen [API](https://cloud.google.com/vertex-ai/generative-ai/docs/reference/rest))

If you are using an API key with a Vertex AI Gen API backend:

- Terms of Service: Your usage is governed by the [Google Cloud Platform Service Terms](https://cloud.google.com/terms/service-terms/).
- Privacy Notice: The [Google Cloud Privacy Notice](https://cloud.google.com/terms/cloud-privacy-notice) describes how your data is collected and managed.

### Usage Statistics Opt-Out

You may opt-out from sending Usage Statistics to Google data by following the instructions available here: [Usage Statistics Configuration](./cli/configuration.md#usage-statistics).

## Frequently Asked Questions (FAQ) for Gemini CLI

### 1. Is my code, including prompts and answers, used to train Google's models?

This depends entirely on the type of auth method you use.

- **Auth method 1:** Yes. When you use your personal Google account, the Gemini Code Assist Privacy Notice for Individuals applies. Under this notice, your **prompts, answers, and related code are collected** and may be used to improve Google's products, which includes model training.
- **Auth method 2a:** Yes. When you use the Gemini API key Gemini API (Unpaid Service) terms apply. Under this notice , your **prompts, answers, and related code are collected** and may be used to improve Google's products, which includes model training.
- **Auth method 2b, 3 & 4:** No. For these accounts, your data is governed by the Google Cloud or Gemini API (Paid Service) terms, which treat your inputs as confidential. Your code, prompts, and other inputs are **not** used to train models.

### 2. What are "Usage Statistics" and what does the opt-out control?

The "Usage Statistics" setting is the single control for all optional data collection in the Gemini CLI. The data it collects depends on your account type:

- **Auth method 1:** When enabled, this setting allows Google to collect both anonymous telemetry (like commands run and performance metrics) and **your prompts and answers** for model improvement.
- **Auth method 2a:** When enabled, this setting allows Google to collect both anonymous telemetry (like commands run and performance metrics) and **your prompts and answers** for model improvement. When disabled we will use your data as described in the [How Google Uses Your Data](https://ai.google.dev/gemini-api/terms#data-use-unpaid).
- **Auth method 2b:** This setting only controls the collection of anonymous telemetry. Google logs prompts and responses for a limited period of time, solely for the purpose of detecting violations of the Prohibited Use Policy and any required legal or regulatory disclosures
- **Auth methods 3 & 4:** This setting only controls the collection of anonymous telemetry. Your prompts and answers are never collected, regardless of this setting.

You can disable Usage Statistics for any account type by following the instructions in the [Usage Statistics Configuration](./cli/configuration.md#usage-statistics) documentation.
--- End of ./tos-privacy.md ---

