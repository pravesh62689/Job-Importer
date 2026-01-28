import mongoose from "mongoose";

export const Job = mongoose.model(
  "Job",
  new mongoose.Schema(
    {
      externalId: { type: String, index: true, unique: true },
      title: String,
      company: String,
    },
    { timestamps: true }
  )
);

export const ImportLog = mongoose.model(
  "import_logs",
  new mongoose.Schema(
    {
      fileName: String,
      totalFetched: Number,
      totalImported: Number,
      newJobs: Number,
      updatedJobs: Number,
      failedJobs: Number,
      failures: [
        {
          externalId: String,
          reason: String,
        },
      ],
    },
    { timestamps: true }
  )
);
