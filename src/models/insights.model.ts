import mongoose, { Schema, Document } from "mongoose";

export interface IInsights extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  subscriptionSpending: number;
  entertainmentTrend: number;
  monthlySavings: number;
  categoriesBreakdown: object;
  createdAt: Date;
  updatedAt: Date;
}

const insightsSchema = new Schema(
  {
    _id: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subscriptionSpending: {
      type: Number,
      required: true,
    },
    entertainmentTrend: {
      type: Number,
      required: true,
    },
    monthlySavings: {
      type: Number,
      required: true,
    },
    categoriesBreakdown: {
      type: Object,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Insights = mongoose.model<IInsights>("Insights", insightsSchema);
