var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', async (error0, connection) => {
  if (error0) {
    throw error0;
  }
  
  connection.createChannel(async (error1, channel) => {
    const msg = 'Hello World!';
    const exchange = 'formiguinha.exchange'

    channel.publish(exchange, '', Buffer.from(msg));

    console.log(" [x] Sent %s", msg);
  });

  setTimeout(function() {
    connection.close();
    process.exit(0);
  }, 500);
});
