import { WebSocket } from "ws";
import { TransactionService } from "$services/transaction.service.ts";
import { baseConfig } from "$config/base.config.ts";
import mongoose from "mongoose";

export function TransactionWebSocketHandler(ws: WebSocket): void {
  ws.on("open", () => {
    baseConfig.logger.info("WebSocket connection opened");
  });
  ws.on("message", async (message: string) => {
    baseConfig.logger.info(`WebSocket message received: ${message}`);
    try {
      const data = JSON.parse(message);

      baseConfig.logger.info(`WebSocket message received: ${message}`);

      if (!data.action || !data.userId) {
        ws.send(JSON.stringify({ error: "Invalid message format" }));
        return;
      }

      let res;

      switch (data.action) {
        case "analyze":
          res = await handleAnalyzeAction(ws, data.userId);
          ws.send(JSON.stringify(res));
          break;
        case "summary":
          res = await handleSummaryAction(ws, data.userId);
          ws.send(JSON.stringify(res));
          break;
        case "progress":
          res = await TransactionService.handleProgressAction(data);
          ws.send(JSON.stringify(res));
          break;
        case "upload":
          handleUploadAction(ws);
          break;
        default:
          ws.send(JSON.stringify({ error: "Unknown action" }));
      }
    } catch (error) {
      ws.send(JSON.stringify({ error: (error as Error).message }));
    }
  });

  ws.on("close", () => {
    baseConfig.logger.info("WebSocket connection closed");
  });

  ws.on("error", (error) => {
    baseConfig.logger.error(`WebSocket error: ${error.message}`);
  });
}

async function handleAnalyzeAction(
  ws: WebSocket,
  userId: mongoose.Types.ObjectId
) {
  try {
    const result = await TransactionService.analyzeTransactionsByUserIdWs(
      userId
    );
    ws.send(JSON.stringify({ action: "analyze", result }));
  } catch (error) {
    ws.send(JSON.stringify({ error: (error as Error).message }));
  }
}

async function handleSummaryAction(
  ws: WebSocket,
  userId: mongoose.Types.ObjectId
) {
  try {
    const result = await TransactionService.summarizeTransactionsbyUserIdWs(
      userId
    );
    ws.send(JSON.stringify({ action: "summary", result }));
  } catch (error) {
    ws.send(JSON.stringify({ error: (error as Error).message }));
  }
}

function handleUploadAction(ws: WebSocket) {
  ws.send(
    JSON.stringify({
      action: "upload",
      status: "Upload not supported over WebSocket yet.",
    })
  );
}
