import * as fs from "fs";
import * as path from "path";
import {markdownTable} from 'markdown-table';

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
    swift: "Swift"
};

const folderDenylist = [ '.github', '.git' ];

const runtimes = fs.readdirSync(path.join('.', '../../../'), { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter((folder) => !folderDenylist.includes(folder))
    .sort();

const templates = [];

for(const runtime of runtimes) {
    const folders = fs.readdirSync(path.join('.', `../../../${runtime}`), { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
        templates.push(...folders);
}

const uniqueTemplates = [...new Set(templates)];

const rows = uniqueTemplates.map((template) => {
    const languagesSupport = runtimes.map((runtime) => {
        return fs.existsSync(path.join('.', `../../../${runtime}/${template}`)) ? `[✅](/${runtime}/${template})` : '';
    })

    return [template, ...languagesSupport];
});

const table = markdownTable([
    ['Template', ...runtimes.map((r) => verboseRuntimes[r] ? verboseRuntimes[r] : r)],
    ...rows.sort((a, b) => {
        const aCount = a.filter((column) => column !== '');
        const bCount = b.filter((column) => column !== '');

        return aCount > bCount ? -1 : 1;
    })
  ]);


const readmePath = path.join('.', "../../../README.md");
const readme = fs.readFileSync(readmePath).toString();
let newReadme = '';

if(readme.includes('<!-- TABLE:START -->') && readme.includes('<!-- TABLE:END -->')) {
    newReadme += readme.split('<!-- TABLE:START -->')[0];
    newReadme += '<!-- TABLE:START -->\n';

    newReadme += table;

    newReadme += '\n<!-- TABLE:END -->';
    newReadme += readme.split('<!-- TABLE:END -->')[1];
}

fs.writeFileSync(readmePath, newReadme);