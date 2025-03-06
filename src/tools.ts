/**
 * Tool definitions for the AI chat agent
 * Tools can either require human confirmation or execute automatically
 */
import { z } from "zod";
import { tool } from "ai";
import { Client } from "pg";
import { agentContext } from "./server";

// /**
//  * confirmBeforeQueryingDatabase tool that requires human confirmation
//  * When invoked, this will present a confirmation dialog to the user
//  * The actual implementation is in the executions object below
//  */
// const confirmBeforeQueryingDatabase = tool({
//   description: "queries the database with sql and returns the result",
//   parameters: z.object({ sql_query: z.string() }),
//   // Omitting execute function makes this tool require human confirmation
// });

const queryDatabase = tool({
  description: "queries the database with sql and returns the result",
  parameters: z.object({ sql_query: z.string() }),
  execute: async ({ sql_query }) => {
    // we can now read the agent context from the ALS store
    const agent = agentContext.getStore();
    if (!agent) throw new Error("No agent found");

    console.log(`running query: ${sql_query}`);
    try {
      const connectionString = agent.getEnv().HYPERDRIVE.connectionString;
      const client = new Client({ connectionString });
      await client.connect();

      const result = await client.query(sql_query);
      await client.end();
      return JSON.stringify(result);
    } catch (error) {
      console.log(error);
      return error;
    }
  },
});

/**
 * Export all available tools
 * These will be provided to the AI model to describe available capabilities
 */
export const tools = {
  // confirmBeforeQueryingDatabase,
  queryDatabase,
};

/**
 * Implementation of confirmation-required tools
 * This object contains the actual logic for tools that need human approval
 * Each function here corresponds to a tool above that doesn't have an execute function
 */
export const executions = {
  // confirmBeforeQueryingDatabase: async ({ sql_query }) => {
  //   //setup query logic
  // },
};
