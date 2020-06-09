const { ServiceBroker } = require('moleculer');
const HTTPServer = require("moleculer-web");
const { Consumer } = require('sqs-consumer');
const AWS = require('aws-sdk');

// Create the broker for Product Service and define the NodeId and set the communciation bus
const brokerProductNode = new ServiceBroker({
    nodeID: "product-node",
    transporter: "redis://localhost:6379"
});

// Create product service
brokerProductNode.createService({
    name:  "products",
    actions: {
        // Define service action that returns the available products
        list(ctx) {
          return [
            { name: "Apples", price: 5 },
            { name: "Oranges", price: 3 },
            { name: "Bananas", price: 2 }
          ];
        }
      }
});

// Create a broker for gateway service
const brokerAPIGatewayNode = new ServiceBroker({
    nodeID: "api-gateway-node",
    transporter: "redis://localhost:6379"
});

// Create the gateway service
brokerAPIGatewayNode.createService({
    name: 'api', // service name
    mixins: [HTTPServer], // http server
    settings: {
        port: 4000,
        routes: [
            {
                aliases: {
                    // When the "GET /products" request is made the "list" action of "products" service is executed
                    "GET /products": "products.list"
                }
            }
        ],
    }
});

// Create a broker for SQS
const brokerSQSConsumerNode = new ServiceBroker({
    nodeID: "sqs-consumer-node",
    transporter: "redis://localhost:6379"
});

// Create the SQS Consumer service
brokerSQSConsumerNode.createService({
    name: 'sqs'
})

// Start both brokers
Promise.all([
    brokerAPIGatewayNode.start(),
    brokerProductNode.start(),
    brokerSQSConsumerNode.start().then(() => {
        AWS.config.update({
            region: '...',
            accessKeyId: '...',
            secretAccessKey: '...'
          });

        // sqs-consumer goes here
        const app = Consumer.create({
            queueUrl: 'https://sqs.ap-southeast-1.amazonaws.com/{accountId}/{queueName}',
            handleMessage: async (message) => {
              // do some work with `message`
              console.log('Message', message)
            }
          });
           
          app.on('error', (err) => {
            console.error(err.message);
          });
           
          app.on('processing_error', (err) => {
            console.error(err.message);
          });
           
          app.start();
    })
]);