import { assert } from "chai";
import { readJson, unlink, writeJson } from "fs-extra";

export async function expectErrorAsync(
  f: () => Promise<any>,
  errorMessage?: string
) {
  try {
    await f();
  } catch (err) {
    assert.equal(err.message, errorMessage);
  }
}

describe("Solhint plugin", function() {
  const SOLHINT_CONFIG_FILENAME = ".solhint.json";

  describe("Project with solhint config", function() {
    before("setup", async function() {
      process.chdir(__dirname + "/buidler-project");
      process.env.BUIDLER_NETWORK = "develop";

      delete require.cache[require.resolve("@nomiclabs/buidler")];
      this.env = require("@nomiclabs/buidler");
    });

    it("should define solhint task", function() {
      assert.isDefined(this.env.tasks.solhint);
      assert.isDefined(this.env.tasks.check);
    });

    it("return a report", async function() {
      const reports = await this.env.run("solhint");
      assert.equal(reports.length, 1);
      assert.equal(reports[0].reports.length, 5);
    });
  });

  describe("Project with no solhint config", function() {
    before("setup", function() {
      process.chdir(__dirname + "/no-config-project");
      process.env.BUIDLER_NETWORK = "develop";

      delete require.cache[require.resolve("@nomiclabs/buidler")];
      this.env = require("@nomiclabs/buidler");
    });

    it("should define solhint task", function() {
      assert.isDefined(this.env.tasks.solhint);
      assert.isDefined(this.env.tasks.check);
    });

    it("return a report", async function() {
      const reports = await this.env.run("solhint");
      assert.equal(reports.length, 1);
      assert.equal(reports[0].reports[0].ruleId, "max-line-length");
    });
  });

  describe("Project with invalid solhint configs", function() {
    before("setup", function() {
      process.chdir(__dirname + "/invalid-config-project");
      process.env.BUIDLER_NETWORK = "develop";

      delete require.cache[require.resolve("@nomiclabs/buidler")];
      this.env = require("@nomiclabs/buidler");
    });

    it("should throw when using invalid extensions", async function() {
      const invalidExtensionConfig = {
        extends: "invalid"
      };
      await writeJson(SOLHINT_CONFIG_FILENAME, invalidExtensionConfig);

      await expectErrorAsync(
        () => this.env.run("solhint"),
        "Failed to apply the extensions"
      );
    });

    it("should throw when using invalid rules", async function() {
      const invalidRuleConfig = {
        rules: {
          "invalid-rule": false
        }
      };
      await writeJson(SOLHINT_CONFIG_FILENAME, invalidRuleConfig);

      await expectErrorAsync(
        () => this.env.run("solhint"),
        "Failed to apply the extensions"
      );
    });

    after(async () => {
      await unlink(SOLHINT_CONFIG_FILENAME);
    });
  });
});
