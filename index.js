const { ServiceBroker } = require('moleculer');
const HTTPServer = require("moleculer-web");

// Create the broker for node-2 as Product Service and define the NodeId and set the communciation bus
const brokerProductNode = new ServiceBroker({
    nodeID: "product-node",
    transporter: "redis://localhost:6379"
});

// Create the product service
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

// Create the broker for node-1 as API Gateway Service and define nodeID and set the communication bus
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
                    // When the "GET /products" request is made the "listProducts" action of "products" service is executed
                    "GET /products": "products.list"
                }
            }
        ],
    }
});

// Start both brokers
Promise.all([
    brokerAPIGatewayNode.start(),
    brokerProductNode.start()
]);