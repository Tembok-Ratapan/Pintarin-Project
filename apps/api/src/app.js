const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const env = require("./config/env");
const healthRoutes = require("./modules/health/health.routes");
const authRoutes = require("./modules/auth/auth.routes");
const analyticsRoutes = require("./modules/analytics/analytics.routes");
const regionsRoutes = require("./modules/regions/regions.routes");
const predictionsRoutes = require("./modules/predictions/predictions.routes");
const notFoundHandler = require("./middlewares/notFoundHandler");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
const csrRoutes = require('./modules/csr/csr.routes')
const profileRoutes = require("./modules/profiles/profile.routes");

const schoolRequestRoutes = require("./modules/schoolRequests/schoolRequest.routes");
const csrAidRoutes = require("./modules/csrAid/csrAid.routes");
const schoolRoutes = require("./modules/schools/school.routes");

app.use(helmet());

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

if (env.nodeEnv === "development") {
  app.use(morgan("dev"));
}

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to PINTARIN API",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/regions", regionsRoutes);
app.use("/api/predictions", predictionsRoutes);
app.use('/api/csr', csrRoutes)
app.use("/api/profiles", profileRoutes);
app.use("/api/school-requests", schoolRequestRoutes);
app.use("/api/csr-aid", csrAidRoutes);
app.use("/api/schools", schoolRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
