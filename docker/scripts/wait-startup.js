const net = require('net');
const { SQSClient, ListQueuesCommand } = require('@aws-sdk/client-sqs');
const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
const { SNSClient, ListTopicsCommand } = require('@aws-sdk/client-sns');

class TcpPortWaiter {
  constructor(host, port, timeout = 45000, interval = 1000) {
    this.host = host;
    this.port = port;
    this.timeout = timeout;
    this.interval = interval;
  }

  wait() {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const checkPort = () => {
        const socket = net.createConnection(this.port, this.host);
        socket.once('connect', () => {
          socket.end();
          resolve();
        });
        socket.once('error', () => {
          socket.destroy();
          if (Date.now() - startTime > this.timeout) {
            reject(
              new Error(
                `Timeout: TCP port ${this.port} on ${this.host} is not available.`,
              ),
            );
          } else {
            setTimeout(checkPort, this.interval);
          }
        });
      };

      checkPort();
    });
  }
}

class SqsQueueWaiter {
  constructor(
    queueNames,
    endpoint,
    region = 'eu-west-1',
    timeout = 45000,
    interval = 1000,
  ) {
    this.queueNames = queueNames;
    this.timeout = timeout;
    this.interval = interval;

    this.client = new SQSClient({
      region,
      endpoint,
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
    });
  }

  async wait() {
    const startTime = Date.now();

    while (Date.now() - startTime < this.timeout) {
      try {
        const result = await this.client.send(new ListQueuesCommand({}));
        const queues = result.QueueUrls || [];
        if (this.existsQueues(queues)) return;
      } catch (_) {
        // Ignore errors, retry
      }

      await new Promise((res) => setTimeout(res, this.interval));
    }

    throw new Error(
      `Timeout: SQS queues ${this.getQueueNames()} were not found.`,
    );
  }

  existsQueues(existingQueues) {
    for (const targetQueues of this.queueNames) {
      if (!existingQueues.some((url) => url.endsWith(`/${targetQueues}`))) {
        return false;
      }
    }
    return true;
  }

  getQueueNames() {
    return this.queueNames.join(', ');
  }
}

class S3BucketWaiter {
  constructor(
    bucketNames,
    endpoint,
    region = 'eu-west-1',
    timeout = 45000,
    interval = 1000,
  ) {
    this.bucketNames = bucketNames;
    this.timeout = timeout;
    this.interval = interval;

    this.client = new S3Client({
      region,
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
    });
  }

  async wait() {
    const startTime = Date.now();

    while (Date.now() - startTime < this.timeout) {
      try {
        const result = await this.client.send(new ListBucketsCommand({}));
        const buckets = result.Buckets?.map((b) => b.Name) || [];
        if (this.existsBuckets(buckets)) return;
      } catch (_) {
        // silent retry
      }

      await new Promise((res) => setTimeout(res, this.interval));
    }

    throw new Error(
      `Timeout: S3 buckets "${this.getBucketNames()}" were not found.`,
    );
  }

  existsBuckets(existingBuckets) {
    for (const bucketName of this.bucketNames) {
      if (!existingBuckets.includes(bucketName)) {
        return false;
      }
    }
    return true;
  }

  getBucketNames() {
    return this.bucketName.join(', ');
  }
}

class SnsTopicWaiter {
  constructor(
    topicNames,
    endpoint,
    region = 'eu-west-1',
    timeout = 45000,
    interval = 1000,
  ) {
    this.topicNames = topicNames;
    this.timeout = timeout;
    this.interval = interval;

    this.client = new SNSClient({
      region,
      endpoint,
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
    });
  }

  async wait() {
    const startTime = Date.now();

    while (Date.now() - startTime < this.timeout) {
      try {
        const result = await this.client.send(new ListTopicsCommand({}));
        const topicArns = result.Topics?.map((t) => t.TopicArn) || [];
        if (this.existsTopics(topicArns)) return;
      } catch (_) {
        // ignore and retry
      }

      await new Promise((res) => setTimeout(res, this.interval));
    }

    throw new Error(
      `Timeout: SNS topics not found: ${this.topicNames.join(', ')}`,
    );
  }

  existsTopics(existingTopicsArns) {
    for (const topicName of this.topicNames) {
      if (!existingTopicsArns.some((arn) => arn.endsWith(`:${topicName}`))) {
        return false;
      }
    }
    return true;
  }

  getTopicNames() {
    return this.topicNames.join(', ');
  }
}

class ServiceWaitCoordinator {
  constructor(...waiters) {
    this.waiters = waiters;
  }

  async waitForAll() {
    for (const waiter of this.waiters) {
      const name = waiter.constructor.name;
      console.log(`⏳ Waiting: ${name}...`);
      await waiter.wait();
      console.log(`✅ Ready: ${name}`);
    }
  }
}

async function main() {
  try {
    const interval = 5000;
    const timeout = 2 * 60 * 1000;
    const region = 'eu-west-1';
    const tcpWaiter = new TcpPortWaiter('localhost', 5432, timeout, interval);
    const sqsWaiter = new SqsQueueWaiter(
      ['dev-developer-events-queue.fifo', 'dev-report-events-queue.fifo'],
      'http://localhost:4566',
      region,
      timeout,
      interval,
    );
    const snsWaiter = new SnsTopicWaiter(
      ['dev-developer-events-topic.fifo', 'dev-report-events-topic.fifo'],
      'http://localhost:4566',
      region,
      timeout,
      interval,
    );
    const s3Waiter = new S3BucketWaiter(
      ['dev-static-bucket-stack'],
      'http://localhost:4566',
      region,
      timeout,
      interval,
    );
    const coordinator = new ServiceWaitCoordinator(
      tcpWaiter,
      sqsWaiter,
      snsWaiter,
      s3Waiter,
    );
    await coordinator.waitForAll();
    process.exit(0);
  } catch (err) {
    console.error(`❌ ${err.message}`);
    process.exit(1);
  }
}
main();
