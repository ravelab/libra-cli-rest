const express = require('express');
const { runCmd, lastWord } = require('./interface');

const router = express.Router();

const getSubstring = (str, startWith, endWith, pos = 0) => {
  const start = str.indexOf(startWith, pos);
  if (start === -1) {
    return {};
  }
  const end = str.indexOf(endWith, start);
  if (end === -1) {
    return {};
  }
  return { str: str.substring(start, end), nextPos: end + endWith.length };
};

// curl -X POST localhost:8080/api/account
router.post('/account', async (req, res) => {
  if (req.headers.authorization !== process.env.AUTH) {
    return res.sendStatus(401);
  }
  const output = await runCmd('a c', 5000, 'address');
  const address = lastWord(output);
  res.status(200).send({ address });
});

// curl -X GET localhost:8080/api/account?address=3486e8633188afe8137891619a6ad073dd445590994085a4e3dc07005c7a0c21
router.get('/account', async (req, res) => {
  if (req.headers.authorization !== process.env.AUTH) {
    return res.sendStatus(401);
  }
  const { address } = req.query;
  const output = await runCmd(`q b ${address}`, 5000, 'Balance');
  const balance = +lastWord(output);
  res.status(200).send({ account: { balance } });
});

// curl -X PUT localhost:8080/api/account?address=3486e8633188afe8137891619a6ad073dd445590994085a4e3dc07005c7a0c21\&amount=10
router.put('/account', async (req, res) => {
  if (req.headers.authorization !== process.env.AUTH) {
    return res.sendStatus(401);
  }
  const { address, amount } = req.query;
  const output = await runCmd(`a mb ${address} ${amount}`, 5000, 'submitted');
  res.status(200).send({ output });
});

// curl -X POST localhost:8080/api/transfer?receiver=3486e8633188afe8137891619a6ad073dd445590994085a4e3dc07005c7a0c21\&sender=6a64890713425c735907bd3837cb0e0e707989ca57051876b162de3cf758614a\&amount=1.25
router.post('/transfer', async (req, res) => {
  if (req.headers.authorization !== process.env.AUTH) {
    return res.status(401);
  }
  const { sender, receiver, amount } = req.query;
  const output = await runCmd(`tb ${sender} ${receiver} ${amount} 100`, 5000, 'submitted');
  res.status(200).send({ output });
});

// curl -X GET localhost:8080/api/history?address=6a64890713425c735907bd3837cb0e0e707989ca57051876b162de3cf758614a
router.get('/history', async (req, res) => {
  if (req.headers.authorization !== process.env.AUTH) {
    return res.sendStatus(401);
  }
  const { address } = req.query;
  const state = await runCmd(`q as ${address}`, 5000, 'Blockchain Version');
  let sub = getSubstring(state, 'sent_events_count', ',');
  if (!sub.str) {
    return res.status(200).send({ sentEvents: [], receivedEvents: [] });
  }
  const sentCount = sub.str.split(' ')[1];
  sub = getSubstring(state, 'received_events_count', ',', sub.nextPos);
  const receivedCount = sub.str.split(' ')[1];

  let sentEvents = [];
  if (sentCount > 0) {
    const sent = await runCmd(
      `q ev ${address} sent ${sentCount - 1} false 10`,
      5000,
      'Last event state'
    );
    while (true) {
      sub = getSubstring(sent, ' index:', 'proof:', sub.nextPos);
      if (!sub.str) {
        break;
      }
      const tokens = sub.str.split(' ');
      sub = getSubstring(sent, 'gas_used', '}', sub.nextPos);
      if (!sub.str) {
        break;
      }
      sentEvents.push({
        index: tokens[2].slice(0, -1),
        account: tokens[7].slice(0, -1),
        amount: tokens[9].slice(0, -1),
        gasUsed: sub.str.split(' ')[1]
      });
    }
  }

  let receivedEvents = [];
  if (receivedCount > 0) {
    const received = await runCmd(
      `q ev ${address} received ${receivedCount - 1} false 10`,
      5000,
      'Last event state'
    );
    while (true) {
      sub = getSubstring(received, ' index:', 'proof:', sub.nextPos);
      if (!sub.str) {
        break;
      }
      const tokens = sub.str.split(' ');
      receivedEvents.push({
        index: tokens[2].slice(0, -1),
        account: tokens[7].slice(0, -1),
        amount: tokens[9].slice(0, -1)
      });
    }
  }
  res.status(200).send({ sentEvents, receivedEvents });
});

module.exports = router;
