import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { Handlebars } from "https://deno.land/x/handlebars/mod.ts";
import { ensureDir, emptyDir } from "https://deno.land/std@0.224.0/fs/mod.ts";

Deno.test("Handlebars renders correctly from file", async () => {
  const testDirPath = "./temp_test_dir";
  const testFilePath = `${testDirPath}/test_template.hbs`;
  const templateContent = "<h1>Hello, {{name}}!</h1>";
  const data = { name: "World" };

  await ensureDir(testDirPath);
  await Deno.writeTextFile(testFilePath, templateContent);

  const hb = new Handlebars();
  const result = await hb.render(testFilePath, data);

  assertEquals(result, "<h1>Hello, World!</h1>");

  await emptyDir(testDirPath);
  await Deno.remove(testDirPath);
});
