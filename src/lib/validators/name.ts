import { z } from "zod";

export const NameSchema = z.object({
  indexName: z.string(),
  namespace: z.string(),
});

export const NameArraySchema = z.string(NameSchema);

export type Name = z.infer<typeof NameSchema>;
