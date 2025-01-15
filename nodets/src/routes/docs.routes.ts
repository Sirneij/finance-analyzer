import { EndpointController } from "$controllers/docs.controller.js";
import { Router } from "express";

const endpointRouters = Router();
const endpointController = new EndpointController();

endpointRouters.post("/endpoints", endpointController.create);
endpointRouters.get("/endpoints", endpointController.getAll);
endpointRouters.get("/endpoints/:id", endpointController.get);
endpointRouters.put("/endpoints/:id", endpointController.update);
endpointRouters.delete("/endpoints/:id", endpointController.delete);

export default endpointRouters;
