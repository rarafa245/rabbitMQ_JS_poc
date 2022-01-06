const RabbitmqServerQueue = require('./rabitmq_consumer')


const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

delay(1000)
  .then(async () => {
    const rabbitmqServerQueue = new RabbitmqServerQueue()
    await rabbitmqServerQueue.connect()
  })
  .catch((e) => {
    console.log(e)
    console.log('deu ruim')
  })
