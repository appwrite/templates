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

const folderDenylist = [".github", ".git"];

const generateUniqueTemplates = (runtimes) => {
  let templates = [];

  for (const runtime of runtimes) {
    const folders = fs
      .readdirSync(path.join(".", `../../../${runtime}`), {
        withFileTypes: true,
      })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    templates.push(...folders);
  }

  return [...new Set(templates)];
};

const generateTableRows = (templates, runtimes) => {
  return templates.map((template) => {
    const languagesSupport = runtimes.map((runtime) => {
      return fs.existsSync(path.join(".", `../../../${runtime}/${template}`))
        ? `[✅](/${runtime}/${template})`
        : "🏗️";
    });

    return [template, ...languagesSupport];
  });
};

const sortRuntimesBySupport = (runtimes, uniqueTemplates) => {
  return runtimes.sort((a, b) => {
    const aTemplates = uniqueTemplates.filter((template) =>
      fs.existsSync(path.join(".", `../../../${a}/${template}`))
    );
    const bTemplates = uniqueTemplates.filter((template) =>
      fs.existsSync(path.join(".", `../../../${b}/${template}`))
    );

    return bTemplates.length - aTemplates.length;
  });
};

const updateReadmeFile = (readmePath, table) => {
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
};

let runtimes = fs
  .readdirSync(path.join(".", "../../../"), { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name)
  .filter((folder) => !folderDenylist.includes(folder))
  .sort();

const uniqueTemplates = generateUniqueTemplates(runtimes);
runtimes = sortRuntimesBySupport(runtimes, uniqueTemplates);
const tableRows = generateTableRows(uniqueTemplates, runtimes);

const sortedTableRows = tableRows.sort((a, b) => {
  const aCount = a.filter((column) => column !== "").length;
  const bCount = b.filter((column) => column !== "").length;

  return aCount > bCount ? -1 : 1;
});

const table = markdownTable([
  [
    "Template &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;",
    ...runtimes.map((r) => (verboseRuntimes[r] ? verboseRuntimes[r] : r)),
  ],
  ...sortedTableRows,
]);

const readmePath = path.join(".", "../../../README.md");
updateReadmeFile(readmePath, table);
