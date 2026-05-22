import { defineApp } from "convex/server";
import aggregate from "@convex-dev/aggregate/convex.config.js";
import rateLimiter from "@convex-dev/rate-limiter/convex.config.js";

const app = defineApp();

app.use(rateLimiter);
app.use(aggregate, { name: "videoClipCounts" });
app.use(aggregate, { name: "stitchCounts" });
app.use(aggregate, { name: "longrVideoCounts" });

export default app;
