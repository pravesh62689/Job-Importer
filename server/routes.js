import { Router } from "express";
import { asyncHandler } from "./middleware.js";
import { jobQueue } from "./queue.js";
import { ImportLog } from "./models.js";

const r = Router();

r.post(
  "/import",
  asyncHandler(async (req, res) => {
    const { url } = req.body;
    await jobQueue.add("import", { url });
    res.json({ status: "queued" });
  })
);

r.get(
  "/import-logs",
  asyncHandler(async (req, res) => {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const skip = (page - 1) * limit;

    const logs = await ImportLog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ImportLog.countDocuments();

    res.json({
      data: logs,
      page,
      totalPages: Math.ceil(total / limit),
    });
  })
);

export default r;
