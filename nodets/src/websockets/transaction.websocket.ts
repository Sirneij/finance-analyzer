import { WebSocket } from "ws";
import { TransactionService } from "$services/transaction.service.js";
import { baseConfig } from "$config/base.config.js";
import mongoose from "mongoose";
import { sendError } from "$utils/error.utils.js";

export function TransactionWebSocketHandler(ws: WebSocket): void {
  ws.on("message", async (message: string) => {
    try {
      const actions = JSON.parse(message);

      if (!Array.isArray(actions)) {
        sendError(ws, "Invalid message format. Expected an array.");
        return;
      }

      for (const actionObj of actions) {
        if (!actionObj.action || !actionObj.userId) {
          sendError(
            ws,
            "Invalid action format. Each action requires 'action' and 'userId'."
          );
          return;
        }

        const { action, userId } = actionObj;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
          sendError(ws, "Invalid userId format.");
          return;
        }

        switch (action) {
          case "analyze":
          case "summary":
            await handleAction(ws, new mongoose.Types.ObjectId(userId), action);
            break;
          default:
            sendError(ws, `Unknown action: ${action}`);
        }
      }
    } catch (error) {
      baseConfig.logger.error(
        `Error processing message: ${
          error instanceof Error ? error.message : error
        }`
      );
      sendError(
        ws,
        `Failed to process message: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  });

  ws.on("close", () => {
    baseConfig.logger.info("Frontend WebSocket connection closed");
  });

  ws.on("error", (error) => {
    baseConfig.logger.error(`WebSocket error: ${error.message}`);
  });
}

async function handleAction(
  frontendWs: WebSocket,
  userId: mongoose.Types.ObjectId,
  action: string
) {
  try {
    const transactions = await TransactionService.findTransactionsByUserId(
      userId,
      -1,
      -1
    );

    if (!transactions) {
      sendError(
        frontendWs,
        `No transactions found for userId: ${userId}`,
        action
      );
      return;
    }

    await TransactionService.connectToUtilityServer(
      action,
      transactions.transactions,
      frontendWs
    );
  } catch (error) {
    baseConfig.logger.error(
      `Error handling action: ${error instanceof Error ? error.message : error}`
    );
    sendError(
      frontendWs,
      `Failed to handle action: ${
        error instanceof Error ? error.message : error
      }`
    );
  }
}
