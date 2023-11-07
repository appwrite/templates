export async function getStaticFiles() {
  const fileName = Bun.resolveSync("../static/index.html", import.meta.dir);
  const html = await Bun.file(fileName).text();
  return html;
}
