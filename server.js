import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import connectDB from "./config/database.js";
import { typeDefs } from "./schema/schema.js";
import { resolvers } from "./schema/resolvers.js";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (error) => {
    console.error("GraphQL Error:", error);
    return {
      message: error.message,
      path: error.path,
      extensions: {
        code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
      },
    };
  },
});

// Start the server
async function startServer() {
  try {
    // Start Apollo Server
    const { url } = await startStandaloneServer(server, {
      listen: { port: PORT },
      context: async ({ req }) => ({
        // Add any context you need here (auth, user info, etc.)
        user: req?.user,
      }),
    });

    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 GraphQL endpoint: ${url}`);
    console.log(`🎯 Apollo Studio: ${url}`);

    // Start Express server for additional endpoints
    const app = express();

    // Middleware
    app.use(cors());
    app.use(morgan("dev"));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Health check endpoint
    app.get("/health", (req, res) => {
      res.status(200).json({
        status: "OK",
        message: "Workflow Backend with GraphQL is running",
        timestamp: new Date().toISOString(),
        graphqlEndpoint: url,
      });
    });

    // 404 handler
    app.use("*", (req, res) => {
      res.status(404).json({
        success: false,
        message: "Route not found. Use /graphql for GraphQL queries",
      });
    });

    // Global error handler
    app.use((err, req, res, next) => {
      console.error("Global error:", err);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development"
            ? err.message
            : "Something went wrong",
      });
    });

    // Start Express server on a different port
    const expressPort = PORT + 1;
    app.listen(expressPort, () => {
      console.log(`📊 Health check: http://localhost:${expressPort}/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
