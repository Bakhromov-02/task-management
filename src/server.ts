import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDatabase } from "./config/database";
import { logger } from "./utils/logger";

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    logger.info("Database connected successfully");

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(
        `API Documentation available at http://localhost:${PORT}/api-docs`
      );
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      logger.info("SIGTERM received, shutting down gracefully");
      server.close(() => {
        logger.info("Process terminated");
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
