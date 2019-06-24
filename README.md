# libra-cli-rest
Libra CLI restful interface to quickly support libra transactions for mobile app:
https://play.google.com/store/apps/details?id=com.ravelab.libracoinsim

It is currently not very "REST-ful", but will be improved over time.

Currently supported requests:

### Create account
POST /api/account
{ "address": "addr" }

### Get account balance
GET /api/account?address=address
{ "account": { "balance": 0.0 } }

### Mint Libra
PUT /api/account?address=address&amount=10.5
{ "output": "cli output" }

### Send Libra
POST /api/transfer?sender=address&receiver=address&amount=1.50
{ "output": "cli output" }

### Get transaction history
GET /api/history?address=address
{ "sentEvents": [{"index": "0", "account": "addr", "amount": "15000000", "gasUsed": "241600"}], 
  "receivedEvents": [{"index": "0", "account": "addr", "amount": "15000000"}], 
}

