# DevToolkit

[![Website Deployed on Vercel](https://img.shields.io/badge/Deployed-on%20Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://devtoolkit.vercel.app) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

DevToolkit is **“a comprehensive collection of utilities for web developers”**. It provides a suite of **22 powerful web tools** — from code formatters and converters to generators and testers — all accessible via a single Next.js web app. The project is built with **Next.js 14** (React), uses the **shadcn/ui** component library for UI, and is styled with **Tailwind CSS**. It’s deployed on Vercel for instant access at [devtoolkit.vercel.app](https://devtoolkit.vercel.app).

## Features

DevToolkit includes the following tools (click on a tool name on the site to use it):

- **base64** – Encode or decode Base64 (binary-to-text) strings.
- **code-formatter** – Minify or prettify code (supports JSON, JavaScript, HTML, etc.).
- **color-palette** – Extract the dominant color palette from an image.
- **cron-generator** – Generate cron schedule expressions from natural language descriptions.
- **css-gradient-generator** – Build CSS linear and radial gradients visually.
- **curl-converter** – Convert `curl` commands into equivalent Fetch or Axios JavaScript code.
- **diff-viewer** – Compare two blocks of text/code and highlight the differences.
- **faker-data-generator** – Generate random test data (names, emails, addresses, etc.).
- **hash-generator** – Generate MD5 or SHA256 hashes from input text.
- **html-email-tester** – Render and preview raw HTML email code as a live email.
- **json-formatter** – Format, validate, and beautify JSON data.
- **jwt-decoder** – Decode and inspect JSON Web Tokens (JWT).
- **markdown-previewer** – Render Markdown to HTML in real-time.
- **password-generator** – Generate strong, random passwords (mixed-case letters, numbers, symbols).
- **px-to-rem-converter** – Convert pixel (px) values to rem units with a configurable root size.
- **regex-tester** – Test regular expressions against input text.
- **responsive-design-tester** – Preview a website at various screen sizes for responsive design testing.
- **rest-client** – Test REST API endpoints with custom headers, authentication, and request body.
- **sql-query-generator** – Generate SQL queries from plain-English prompts (uses optional AI).
- **timestamp-converter** – Convert Unix timestamps to human-readable dates and vice versa.
- **uuid-generator** – Generate random UUID (v4) codes.
- **yaml-json-converter** – Convert data between YAML and JSON formats.

&#x20;_Figure: Example of DevToolkit’s interface listing all available tools._ The sidebar menu shows each of the 22 utilities. Clicking a tool name navigates to that utility’s page.

## Installation

To run **DevToolkit** locally for development:

1. Ensure you have [Node.js](https://nodejs.org/) installed (recommended v16+).
2. Clone the repository:

   ```bash
   git clone https://github.com/monsur28/DevToolkit.git
   cd DevToolkit
   ```

3. Install dependencies:

   ```bash
   npm install
   # or `pnpm install` / `yarn install` if you use pnpm or yarn
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`.

_Optional:_ The **SQL Query Generator** tool can use AI for natural-language input. To enable this, set the `OPENAI_API_KEY` environment variable with your OpenAI API key in a local `.env` file.

## Built With

- **Next.js 14** – A React framework for building web applications.
- **shadcn/ui** – An open-source library of accessible React UI components.
- **Tailwind CSS** – A utility-first CSS framework for rapid UI development.
- **TypeScript** – Typed superset of JavaScript for safer code.
- **React** – JavaScript library for building user interfaces.
- **Node.js** – JavaScript runtime (used by Next.js on the server side).

## Author

**Abul Monsur (monsur28)** – [GitHub Profile](https://github.com/monsur28) – Full-stack developer based in Bangladesh (author of DevToolkit).

## Contributing

Contributions are welcome! To contribute, please:

- Fork the repository and create a new branch for your feature or fix.
- Implement your changes (following the existing style).
- Submit a pull request explaining your changes.

You can also open an issue for bug reports or new feature suggestions. Please be sure to document your code and follow best practices.

## License

This project is open source and released under the **MIT License**. See [LICENSE](LICENSE) for details. (The MIT License “permits reuse, modification, and distribution” of the software with attribution.)
