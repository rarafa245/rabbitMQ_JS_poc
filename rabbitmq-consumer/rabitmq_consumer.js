const amqplib = require('amqplib')

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

module.exports = class RabbitmqServerQueue {
  constructor () {
    this.__url = 'amqp://localhost:5672/'
    this.__conn = undefined
    this.__channel = undefined
    this.__queue = 'formiguinha.queue'
    this.__exchange = 'formiguinha.exchange'
    this.__exchangeType = 'direct'
    this.__deadLetterExchange = 'formiguinha.dead.letter.exchange'
    this.__deadLetterExchangeType = 'fanout'
    this.__deadLetterQueue = 'formiguinha.dead.letter.queue'
  }

  async connect () {
    this.__conn = await amqplib.connect(this.__url, 'heartbeat=60')
    this.__channel = await this.__conn.createChannel()

    // Creating deadLetter
    await this.__channel.assertQueue(this.__deadLetterQueue, { durable: true })
    await this.__channel.assertExchange(this.__deadLetterExchange, this.__deadLetterExchangeType, { durable: true });
    await this.__channel.bindQueue(this.__deadLetterQueue, this.__deadLetterExchange)

    // Criating principal
    await this.__channel.assertQueue(this.__queue, {
      durable: true,
      overflow: 'reject-publish',
      queueMode: 'lazy',
      messageTtl: 86400000,
      maxLength: 15000,
      deadLetterExchange: this.__deadLetterExchange,
      autoDelete: true
    })

    await this.__channel.assertExchange(this.__exchange, this.__exchangeType, { durable: true, autoDelete: true });
    await this.__channel.bindQueue(this.__queue, this.__exchange)

    console.log('connected')

    await this.__channel.consume(this.__queue, async (msg) => {
      try{
        console.log(msg.content.toString())
        // throw new Error()
        this.__channel.ack(msg)
      } catch (e) {
        this.__channel.nack(msg, false, false)
      }
    }, { noAck: false })
  }
}
