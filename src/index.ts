import { internalTask, task } from "@nomiclabs/buidler/config";
import { BuidlerPluginError } from "@nomiclabs/buidler/internal/core/errors";
import { existsSync } from "fs";
import { join } from "path";
import { applyExtends, loadConfig } from "solhint/lib/config/config-file";
import { processPath } from "solhint/lib/index";

function getDefaultConfig() {
  return {
    extends: ["solhint:default"]
  };
}

function getFormatter(formatterName = "stylish") {
  try {
    return require(`eslint/lib/formatters/${formatterName}`);
  } catch (ex) {
    throw new BuidlerPluginError(
      `An error occurred loading the solhint formatter ${formatterName}`,
      ex
    );
  }
}

function hasConfigFile(rootDirectory: string) {
  const files = [
    ".solhint.json",
    ".solhintrc",
    ".solhintrc.json",
    ".solhintrc.yaml",
    ".solhintrc.yml",
    ".solhintrc.js",
    "solhint.config.js"
  ];

  for (const file of files) {
    if (existsSync(join(rootDirectory, file))) {
      return true;
    }
  }
  return false;
}

async function getSolhintConfig(rootDirectory: string) {
  let solhintConfig;
  if (hasConfigFile(rootDirectory)) {
    try {
      solhintConfig = await loadConfig();
    } catch (err) {
      throw new BuidlerPluginError(
        "An error occurred when loading your solhint config."
      );
    }
  } else {
    solhintConfig = getDefaultConfig();
  }

  try {
    solhintConfig = applyExtends(solhintConfig);
  } catch (err) {
    throw new BuidlerPluginError(
      "An error occurred when processing your solhint config."
    );
  }

  return solhintConfig;
}

function printReport(reports: any) {
  const formatter = getFormatter();
  console.log(formatter(reports));
}

internalTask("buidler-solhint:run-solhint", async (_, { config, run }) => {
  return processPath(
    config.paths.sources + "/**/*.sol",
    await getSolhintConfig(config.paths.root)
  );
});

task("check", async (_, { config, run }) => {
  const reports = await run("buidler-solhint:run-solhint");

  printReport(reports);
});
