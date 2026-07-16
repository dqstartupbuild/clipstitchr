import { defineApp } from "convex/server";
import aggregate from "@convex-dev/aggregate/convex.config.js";
import rateLimiter from "@convex-dev/rate-limiter/convex.config.js";
import stripe from "@convex-dev/stripe/convex.config.js";

const app = defineApp();

app.use(rateLimiter);
app.use(stripe);
app.use(aggregate, { name: "videoClipCounts" });
app.use(aggregate, { name: "videoClipProductCounts" });
app.use(aggregate, { name: "stitchCounts" });
app.use(aggregate, { name: "stitchProductCounts" });

export default app;
