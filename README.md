# Moleculer Barebone Implementation

Repo implements barebone moleculer implementation that consists for 

- An API Gateway
- A internal service
- An SQS Consumer to consume messages from AWS SQS Queue

## How to run

Moleculer suggests to use default transporter, since we need to download and install NAT server,  I have decided to use Redis. Make sure to have redis installed before running the services

```
git clone git@github.com:manjufy/moleculer-bare.git
cd > moleculer-bare
cd > moleculer-bare > node index.js

Go to http://localhost:4000/products
```
