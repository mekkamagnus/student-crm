The content of the URL is:[1]

Environment variables - Deno Docs[1]
There are a few ways to use environment variables in Deno:[1]

*   **Built-in `Deno.env` method**: The Deno runtime offers built-in support for environment variables with `Deno.env`, which has getter and setter methods.[1]
    *   Example usage:[1]
        ```typescript
        Deno.env.set("FIREBASE_API_KEY", "examplekey123");
        Deno.env.set("FIREBASE_AUTH_DOMAIN", "firebasedomain.com");
        console.log(Deno.env.get("FIREBASE_API_KEY")); // examplekey123
        console.log(Deno.env.get("FIREBASE_AUTH_DOMAIN")); // firebasedomain.com
        console.log(Deno.env.has("FIREBASE_AUTH_DOMAIN")); // true
        ```
*   **.env file**: Deno supports `.env` files.[1]
    *   You can tell Deno to read environment variables from `.env` with the `--env-file` flag, for example: `deno run --env-file main.ts`.[1]
    *   This reads the `.env` file from the current working directory or the first parent directory that contains one.[1]
    *   You can specify a different file as a parameter to the flag or pass multiple `--env-file` flags.[1]
    *   If multiple declarations for the same environment variable exist within a single `.env` file, the first occurrence is applied.[1]
    *   If the same variable is defined across multiple `.env` files (using multiple `--env-file` arguments), the value from the last file specified takes precedence.[1]
    *   Alternatively, the `dotenv` package in the standard library will load environment variables from `.env`.[1]
        ```typescript
        import "jsr:@std/dotenv/load";
        console.log(Deno.env.get("GREETING")); // "Hello, world."
        ```
*   **Set a variable when running a command**: You can set environment variables before running a command like so: `MY_VAR="my value" deno run main.ts`.[1]
    *   This can be combined with `deno task` commands.[1]
        ```json
        {
          "tasks": {
            "build:full": {
              "description": "Build the site with all features",
              "command": "BUILD_TYPE=FULL deno run main.ts"
            },
            "build:light": {
              "description": "Build the site without expensive operations",
              "command": "BUILD_TYPE=LIGHT deno run main.ts"
            }
          }
        }
        ```
*   **`std/cli`**: The Deno Standard Library has a `std/cli` module for parsing command line arguments.[1]

**Special environment variables**: The Deno runtime has several special environment variables, including:[1]

*   `DENO_AUTH_TOKENS`: A semi-colon separated list of bearer tokens and hostnames for fetching remote modules from private repositories.[1]
*   `DENO_TLS_CA_STORE`: Comma-separated list of order dependent certificate stores (e.g., `system`, `mozilla`).[1]
*   `DENO_CERT`: Load certificate authority from PEM encoded file.[1]
*   `DENO_COVERAGE_DIR`: Set the directory for collecting coverage profile data (for `deno test`).[1]
*   `DENO_DIR`: Set the cache directory.[1]
*   `DENO_INSTALL_ROOT`: Set `deno install`'s output directory.[1]
*   `DENO_REPL_HISTORY`: Set REPL history file path.[1]
*   `DENO_NO_PACKAGE_JSON`: Disables auto-resolution of `package.json`.[1]
*   `DENO_NO_PROMPT`: Set to disable permission prompts on access.[1]
*   `DENO_NO_UPDATE_CHECK`: Set to disable checking if a newer Deno version is available.[1]
*   `DENO_V8_FLAGS`: Set V8 command line options.[1]
*   `DENO_JOBS`: Number of parallel workers used for the `--parallel` flag with the test subcommand.[1]
*   `DENO_WEBGPU_TRACE`: Path to a directory to output a WGPU trace.[1]
*   `DENO_WEBGPU_BACKEND`: Select the backend WebGPU will use.[1]
*   `HTTP_PROXY`: Proxy address for HTTP requests.[1]
*   `HTTPS_PROXY`: Proxy address for HTTPS requests.[1]
*   `NPM_CONFIG_REGISTRY`: URL to use for the npm registry.[1]
*   `NO_COLOR`: Set to disable color.[1]
*   `NO_PROXY`: Comma-separated list of hosts which do not use a proxy.[1]

Sources:
[1] Environment variables - Deno Docs (https://docs.deno.com/runtime/reference/env_variables/)