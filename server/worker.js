import "dotenv/config";
import axios from "axios";
import { Worker } from "bullmq";
import { redis } from "./queue.js";
import { Job, ImportLog } from "./models.js";
import xml2js from "xml2js";
import mongoose from "mongoose";

mongoose.connect(process.env.MONGO_URL);

const CONCURRENCY = Number(process.env.WORKER_CONCURRENCY);
const BATCH_SIZE = Number(process.env.BATCH_SIZE);

const parser = new xml2js.Parser({ explicitArray: false });

console.log("Worker started with concurrency:", CONCURRENCY);

new Worker(
  "jobs",
  async (job) => {
    const feedUrl = job.data.url;
    console.log(`\nStarting import for the  feed: ${feedUrl}`);

    let newJobs = 0;
    let updatedJobs = 0;
    let failedJobs = 0;
    const failures = [];

    try {
      const xml = (await axios.get(feedUrl)).data;
      const parsed = await parser.parseStringPromise(xml);

      const rawItems = parsed?.rss?.channel?.item || [];
      const items = Array.isArray(rawItems) ? rawItems : [rawItems];

      console.log(`Fetched ${items.length} jobs from the feed`);

      const bulkOps = [];

      for (const item of items) {
        const externalId = item?.guid?._;

        if (!externalId) {
          failedJobs++;
          failures.push({
            externalId: null,
            reason: "Missing guid",
          });
          continue;
        }

        bulkOps.push({
          updateOne: {
            filter: { externalId },
            update: {
              $set: {
                title: item.title || "",
                company: item["dc:creator"] || "",
              },
            },
            upsert: true,
          },
        });
      }

      console.log(`Prepared ${bulkOps.length} records for the database write`);

      for (let i = 0; i < bulkOps.length; i += BATCH_SIZE) {
        const batch = bulkOps.slice(i, i + BATCH_SIZE);

        try {
          const result = await Job.bulkWrite(batch, { ordered: false });

          const inserted = result.upsertedCount || 0;
          const updated = result.modifiedCount || 0;

          newJobs += inserted;
          updatedJobs += updated;

          console.log(
            `Batch processed: inserted=${inserted}, updated=${updated}`
          );
        } catch (error) {
          failedJobs += batch.length;
          failures.push({
            externalId: null,
            reason: error.message,
          });

          console.error("Batch failed:", error.message);
        }
      }

      await ImportLog.create({
        fileName: feedUrl,
        totalFetched: items.length,
        totalImported: newJobs + updatedJobs,
        newJobs,
        updatedJobs,
        failedJobs,
        failures,
      });

      console.log(
        `Import completed for the  feed: ${feedUrl} | new=${newJobs}, updated=${updatedJobs}, failed=${failedJobs}`
      );
    } catch (error) {
      console.error(`Import failed for feed: ${feedUrl}`, error.message);

      await ImportLog.create({
        fileName: feedUrl,
        totalFetched: 0,
        totalImported: 0,
        newJobs: 0,
        updatedJobs: 0,
        failedJobs: 1,
        failures: [{ reason: error.message }],
      });
    }
  },
  {
    connection: redis,
    concurrency: CONCURRENCY,
  }
);
