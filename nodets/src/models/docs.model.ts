import mongoose, { Schema, Document } from "mongoose";
import { HttpMethod, SupportedLanguage } from "$types/docs.types.js";

const EndpointSchema = new Schema(
  {
    path: {
      type: String,
      required: true,
      index: true,
    },
    method: {
      type: String,
      required: true,
      enum: Object.values(HttpMethod),
    },
    middlewares: [
      {
        type: String,
        default: [],
      },
    ],
    category: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    parameters: [
      {
        name: { type: String, required: true },
        type: { type: String, required: true },
        required: { type: Boolean, default: false },
        description: { type: String, required: true },
      },
    ],
    responses: [
      {
        status: { type: Number, required: true },
        description: { type: String, required: true },
        example: { type: Schema.Types.Mixed, required: true },
      },
    ],
    examples: [
      {
        language: {
          type: String,
          enum: ["nodejs", "python", "go", "rust"],
          required: true,
        },
        code: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export interface IEndpoint extends Document {
  path: string;
  method: HttpMethod;
  middlewares: string[];
  category: string;
  description: string;
  parameters?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  responses: {
    status: number;
    description: string;
    example: Record<string, unknown>;
  }[];
  examples: {
    language: SupportedLanguage;
    code: string;
  }[];
}

export const EndpointModel = mongoose.model<IEndpoint>(
  "Endpoint",
  EndpointSchema
);
