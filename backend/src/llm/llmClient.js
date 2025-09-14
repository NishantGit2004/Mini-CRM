// minimal wrapper: you can fill with openai SDK or fetch
import dotenv from 'dotenv';
dotenv.config();

export async function nlToRules(nlText) {
  return {
    op: "AND",
    children: [
      { field: "total_spend", operator: ">", value: 5000 },
      { field: "last_order_at", operator: "older_than_days", value: 180 }
    ]
  };
}