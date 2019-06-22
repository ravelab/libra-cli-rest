const express = require('express');
const { runCmd, lastWord } = require('./interface');

const router = express.Router();

// disable for now, too powerful
// router.get("/cli", async (req, res) => {
//   const { cmd, delay } = req.query;
//   const output = await runCmd(cmd, delay);
//   res.status(200).send({ output });
// });

// curl -X POST localhost:8080/api/account
router.post('/account', async (req, res) => {
  const output = await runCmd('a c', 5000, 'address');
  const address = lastWord(output);
  res.status(200).send({ address });
});

// curl -X GET localhost:8080/api/account?address=3486e8633188afe8137891619a6ad073dd445590994085a4e3dc07005c7a0c21
router.get('/account', async (req, res) => {
  const { address } = req.query;
  const output = await runCmd(`q b ${address}`, 5000, 'Balance');
  const balance = +lastWord(output);
  res.status(200).send({ account: { balance } });
});

// curl -X PUT localhost:8080/api/account?address=3486e8633188afe8137891619a6ad073dd445590994085a4e3dc07005c7a0c21\&amount=10
router.put('/account', async (req, res) => {
  const { address, amount } = req.query;
  const output = await runCmd(`a m ${address} ${amount}`, 500, 'submitted');
  res.status(200).send({ output });
});

// curl -X POST localhost:8080/api/transfer?receiver=3486e8633188afe8137891619a6ad073dd445590994085a4e3dc07005c7a0c21\&sender=6a64890713425c735907bd3837cb0e0e707989ca57051876b162de3cf758614a\&amount=1.25
router.post('/transfer', async (req, res) => {
  const { sender, receiver, amount } = req.query;
  const output = await runCmd(`t ${sender} ${receiver} ${amount}`, 500, 'submitted');
  res.status(200).send({ output });
});

// TODO
router.get('/transaction', async (req, res) => {
  // 'q ts ${address} ${seq} false'
  res.status(200).send();
});

// TODO
router.get('/transaction_count', async (req, res) => {
  // input: account address
  // 'q s ${address}'
  res.status(200).send();
});

module.exports = router;
