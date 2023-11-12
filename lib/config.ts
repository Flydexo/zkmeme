import {z} from "zod";

export const schema = z.object({
  name: z.string(),
  ticker: z.string().toUpperCase(),
  initialSupply: z.number().positive(),
  marketShare: z.number().positive().max(100),
  marketNotional: z.number().positive(),
  airdrops: z.array(
    z.object({
      share: z.number().positive().max(100),
      address: z.string().regex(/^0x[A-Fa-f0-9]{63,64}$/g),
    })
  ),
});
