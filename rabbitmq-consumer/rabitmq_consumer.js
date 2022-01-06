const amqplib = require('amqplib')

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

module.exports = class RabbitmqServerQueue {
  constructor () {
    this.__url = 'amqp://localhost:5672/'
    this.__conn = undefined
    this.__channel = undefined
    this.__queue = 'formiguinha.queue'
    this.__exchange = 'formiguinha.exchange'
  }

  async connect () {
    this.__conn = await amqplib.connect(this.__url, 'heartbeat=60')
    this.__channel = await this.__conn.createChannel()

    await this.__channel.assertQueue(this.__queue, {
      durable: true,
      overflow: 'reject-publish',
      queueMode: 'lazy',
      messageTtl: 86400000,
      maxLength: 15000,
      deadLetterExchange: 'formiguinha.dead.letter',
      autoDelete: true
    })

    await this.__channel.assertExchange(this.__exchange, 'direct', { durable: true, autoDelete: true });
    await this.__channel.bindQueue(this.__queue, this.__exchange)

    console.log('connected')

    await this.__channel.consume(this.__queue, async (msg) => {
      console.log('tamo aqui')
      await delay(3000)
      console.log(msg.content.toString())
    }, { noAck: true })
  }
}
