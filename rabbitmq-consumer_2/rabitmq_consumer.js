const amqplib = require('amqplib')

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

module.exports = class RabbitmqServerQueue {
  constructor () {
    this.__url = 'amqp://localhost:5672/'
    this.__conn = undefined
    this.__channel = undefined
    this.__deadLetterQueue = 'formiguinha.dead.letter.queue'
  }

  async connect () {
    this.__conn = await amqplib.connect(this.__url, 'heartbeat=60')
    this.__channel = await this.__conn.createChannel()

    // Creating deadLetter
    await this.__channel.assertQueue(this.__deadLetterQueue, { durable: true })

    console.log(`connected ${this.__deadLetterQueue}`)

    await this.__channel.consume(this.__deadLetterQueue, async (msg) => {
      console.log(msg.content.toString())
    })
  }
}
