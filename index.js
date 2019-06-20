const express = require("express");
const { spawn } = require("child_process");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const WALLET_MNEMONIC =
  process.env.WALLET_MNEMONIC || "../libra-cli-web/wallet.mnemonic";
let cli = null;
let lines = "";

setInterval(() => {
  cli.stdin.write(`a w ${WALLET_MNEMONIC}\n`);
}, 1000 * 60);

async function init() {
  const LIBRA_DIR = process.env.LIBRA_DIR || "../libra";
  cli = spawn(
    process.env.START_SCRIPT || LIBRA_DIR + "/scripts/cli/start_cli_testnet.sh",
    [],
    {
      cwd: LIBRA_DIR,
      stdio: ["pipe", "pipe", process.stderr]
    }
  );

  cli.stdout.on("data", data => {
    const line = data.toString();
    console.log(line);
    lines = lines + line;
  });

  cli.stdin.write(`a r ${WALLET_MNEMONIC}\n`);
}
init();

const app = express();

app.get("/cli", async (req, res) => {
  const { cmd, delay } = req.query;
  lines = "";
  cli.stdin.write(cmd + "\n"); // "a la\n"
  await sleep(delay || 300);

  res.status(200).send({ output: lines });
});

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0");
console.log("Listen on port " + port);
