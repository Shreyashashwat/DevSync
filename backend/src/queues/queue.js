import { Queue } from "bullmq";

export const taskQueue = new Queue("task-queue", {
  connection: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

console.log("QUEUE CONNECTED:", {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

