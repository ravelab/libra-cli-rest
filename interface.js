const { spawn } = require('child_process');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const WALLET_MNEMONIC = process.env.WALLET_MNEMONIC || '../libra-cli-rest/wallet.mnemonic';
let cli = null;
let lines = '';

setInterval(() => {
  cli.stdin.write(`a w ${WALLET_MNEMONIC}\n`);
}, 1000 * 60);

async function init() {
  const LIBRA_DIR = process.env.LIBRA_DIR || '../libra';
  cli = spawn(process.env.START_SCRIPT || LIBRA_DIR + '/scripts/cli/start_cli_testnet.sh', [], {
    cwd: LIBRA_DIR,
    stdio: ['pipe', 'pipe', process.stderr]
  });

  cli.stdout.on('data', data => {
    const line = data.toString();
    if (line.includes('mnemonic')) {
      return;
    }
    console.log(line);
    lines = lines + line;
  });

  cli.stdin.write(`a r ${WALLET_MNEMONIC}\n`);
}
init();

const runCmd = async (cmd, maxDelay, stopWord) => {
  lines = '';
  cli.stdin.write(cmd + '\n');
  if (stopWord) {
    let remainingDelay = maxDelay;
    while (remainingDelay > 0) {
      await sleep(1);
      if (lines.includes(stopWord)) {
        break;
      }
      remainingDelay--;
    }
  } else {
    await sleep(maxDelay);
  }
  return lines;
};

const lastWord = str => {
  const splitted = str.trimEnd().split(' ');
  return splitted[splitted.length - 1];
};

module.exports = {
  runCmd,
  lastWord
};
