import { EndpointController } from "$controllers/docs.controller.js";
import { isJohnOwolabiIdogun } from "$middlewares/auth.middleware.js";
import { Router } from "express";

const endpointRouters = Router();
const endpointController = new EndpointController();

endpointRouters.post(
  "/endpoints",
  isJohnOwolabiIdogun,
  endpointController.handleCreateDoc
);
endpointRouters.get("/endpoints", endpointController.handleGetDocs);
endpointRouters.get("/endpoints/:id", endpointController.handleGetDoc);
endpointRouters.put(
  "/endpoints/:id",
  isJohnOwolabiIdogun,
  endpointController.handleUpdateDoc
);
endpointRouters.delete(
  "/endpoints/:id",
  isJohnOwolabiIdogun,
  endpointController.handleDeleteDoc
);

export default endpointRouters;
