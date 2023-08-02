import fs from "node:fs";
import path from "node:path";
import { markdownTable } from "markdown-table";

const verboseRuntimes = {
  cpp: "C++",
  dart: "Dart",
  deno: "Deno",
  dotnet: ".NET",
  java: "Java",
  kotlin: "Kotlin",
  node: "Node.js",
  php: "PHP",
  python: "Python",
  ruby: "Ruby",
  swift: "Swift",
};

const verboseTemplates = {
  "Analyze With Perspectiveapi": "Analyze With PerspectiveAPI",
  "Generate Pdf": "Generate PDF",
  "Prompt Chatgpt": "Prompt ChatGPT",
  "Push Notifications With Fcm": "Push Notifications With FCM",
  "Url Shortener": "URL Shortener",
  "Whatsapp With Vonage": "WhatsApp With Vonage",
};

const folderDenylist = [".github", ".git"];

function getDirectories(dirPath) {
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .filter((name) => !folderDenylist.includes(name));
}

function toTitleCase(text) {
  return text
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
}

function normalizeTemplate(template) {
  const titleCase = toTitleCase(template);
  return titleCase in verboseTemplates
    ? verboseTemplates[titleCase]
    : titleCase;
}

function getRuntimeToTemplates() {
  const runtimeDirs = getDirectories(path.join(".", "../../../"));
  const runtimeToTemplates = {};

  for (const runtimeDir of runtimeDirs) {
    const runtime = verboseRuntimes[runtimeDir] || runtimeDir;
    const templateDirs = getDirectories(
      path.join(".", "../../../", runtimeDir)
    );

    runtimeToTemplates[runtime] = templateDirs.map((templateDir) => {
      const template = normalizeTemplate(templateDir);
      return {
        name: template,
        dir: path.join(".", runtimeDir, templateDir),
      };
    });
  }

  return runtimeToTemplates;
}

function getTemplateToRuntimes(runtimeToTemplates) {
  const templateToRuntimes = {};
  for (const runtime of Object.keys(runtimeToTemplates)) {
    for (const template of runtimeToTemplates[runtime]) {
      if (!(template.name in templateToRuntimes)) {
        templateToRuntimes[template.name] = [];
      }

      templateToRuntimes[template.name].push({
        name: runtime,
        dir: template.dir,
      });
    }
  }
  return templateToRuntimes;
}

function generateTableRows(sortedTemplates) {
  return sortedTemplates.map((template) => {
    return [
      template,
      ...sortedRuntimes.map((runtime) => {
        const matchingRuntime = templateToRuntimes[template].find(
          (r) => r.name === runtime
        );
        return matchingRuntime ? `[✅](${matchingRuntime.dir})` : "🏗️";
      }),
    ];
  });
}

function updateReadmeFile(readmePath, table) {
  const readme = fs.readFileSync(readmePath).toString();

  if (
    readme.includes("<!-- TABLE:START -->") &&
    readme.includes("<!-- TABLE:END -->")
  ) {
    const newReadme = `${
      readme.split("<!-- TABLE:START -->")[0]
    }<!-- TABLE:START -->\n${table}\n<!-- TABLE:END -->${
      readme.split("<!-- TABLE:END -->")[1]
    }`;

    fs.writeFileSync(readmePath, newReadme);
  }
}

const runtimeToTemplate = getRuntimeToTemplates();
const templateToRuntimes = getTemplateToRuntimes(runtimeToTemplate);

const sortedRuntimes = Object.keys(runtimeToTemplate).sort((a, b) => {
  return runtimeToTemplate[b].length - runtimeToTemplate[a].length;
});

const sortedTemplates = Object.keys(templateToRuntimes).sort((a, b) => {
  return templateToRuntimes[b].length - templateToRuntimes[a].length;
});

const table = markdownTable([
  ["Template", ...sortedRuntimes],
  ...generateTableRows(sortedTemplates),
]);

const readmePath = path.join(".", "../../../README.md");
updateReadmeFile(readmePath, table);
