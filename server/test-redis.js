import "dotenv/config";
import IORedis from "ioredis";

const redis = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redis
  .ping()
  .then((res) => {
    console.log("Redis response:", res);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Redis error:", err.message);
    process.exit(1);
  });
