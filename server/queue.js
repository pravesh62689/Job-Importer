import "dotenv/config";
import { Queue } from "bullmq";
import IORedis from "ioredis";

export const redis = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const jobQueue = new Queue("jobs", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 3000 },
  },
});
