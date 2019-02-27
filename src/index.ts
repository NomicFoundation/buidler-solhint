import { extendEnvironment, task } from "@nomiclabs/buidler/config";
import { BuidlerPluginError } from "@nomiclabs/buidler/internal/core/errors";
import { BuidlerRuntimeEnvironment } from "@nomiclabs/buidler/types";
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
      "An error has occurred loading the formatter",
      ex
    );
  }
}

async function getSolhintConfig() {
  let solhintConfig;
  try {
    solhintConfig = await loadConfig();
  } catch (err) {
    solhintConfig = getDefaultConfig();
  }

  try {
    solhintConfig = applyExtends(solhintConfig);
  } catch (err) {
    throw new BuidlerPluginError("Failed to apply the extensions", err);
  }

  return solhintConfig;
}

function printReport(reports: any) {
  const formatter = getFormatter();
  console.log(formatter(reports));
}

task("solhint", async (_, { config, run }) => {
  return processPath(
    config.paths.sources + "/**/*.sol",
    await getSolhintConfig()
  );
});

task("check", async (_, { config, run }) => {
  const reports = await run("solhint");

  printReport(reports);
});

extendEnvironment((env: BuidlerRuntimeEnvironment) => {});
