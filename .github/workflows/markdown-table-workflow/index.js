import fs from "node:fs";
import path from "node:path";
import { markdownTable } from "markdown-table";

const verboseRuntimes = {
  go: "Go",
  cpp: "C++",
  dart: "Dart",
  deno: "Deno",
  dotnet: ".NET",
  java: "Java",
  kotlin: "Kotlin",
  node: "Node.js",
  "node-typescript": "Node.js (TypeScript)",
  bun: "Bun",
  php: "PHP",
  python: "Python",
  ruby: "Ruby",
  swift: "Swift",
};

const overrideWords = {
  a: "a",
  an: "an",
  and: "and",
  as: "as",
  at: "at",
  but: "but",
  by: "by",
  for: "for",
  if: "if",
  in: "in",
  nor: "nor",
  of: "of",
  on: "on",
  or: "or",
  so: "so",
  the: "the",
  to: "to",
  up: "up",
  with: "with",
  yet: "yet",
  is: "is",
  are: "are",
  was: "was",
  were: "were",
  has: "has",
  have: "have",
  been: "been",
  am: "am",
  perspectiveapi: "PerspectiveAPI",
  pdf: "PDF",
  chatgpt: "ChatGPT",
  fcm: "FCM",
  url: "URL",
  whatsapp: "WhatsApp",
  rag: "RAG",
  openai: "OpenAI",
  elevenlabs: "ElevenLabs",
  langchain: "LangChain",
  huggingface: "Hugging Face",
  fal: "fal.ai",
};

const folderDenylist = [".github", ".git"];

function getDirectories(dirPath) {
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .filter((name) => !folderDenylist.includes(name));
}

function normalizeTemplateName(template) {
  return template
    .replace(/[_-]|([a-z])([A-Z])/g, (_, p1, p2) => (p1 ? `${p1} ${p2}` : " "))
    .toLowerCase()
    .split(" ")
    .map((word, i, words) => {
      const overrideWord = overrideWords[word];
      if (!overrideWord) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return i === 0 || i === words.length - 1
        ? overrideWord.charAt(0).toUpperCase() + overrideWord.slice(1)
        : overrideWord;
    })
    .join(" ");
}

function getRuntimeToTemplates() {
  const runtimeDirs = getDirectories(path.join(".", "../../../"));
  const runtimeToTemplates = {};

  for (const runtimeDir of runtimeDirs) {
    const runtime = verboseRuntimes[runtimeDir] || runtimeDir;
    const templateDirs = getDirectories(
      path.join(".", "../../../", runtimeDir),
    );

    runtimeToTemplates[runtime] = templateDirs.map((templateDir) => {
      const name = normalizeTemplateName(templateDir);
      return {
        name: name,
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
          (r) => r.name === runtime,
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
