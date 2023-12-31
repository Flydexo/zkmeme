import {z} from "zod";

export const schema = z.object({
  name: z.string(),
  ticker: z.string().toUpperCase(),
  initialSupply: z.number().positive(),
  marketShare: z.number().positive().max(95),
  marketNotional: z.number().positive(),
  airdrops: z.array(
    z.object({
      share: z.number().positive().max(100),
      address: z.string().regex(/^0x[A-Fa-f0-9]{63,64}$/g),
    })
  ),
  lockLiquidity: z.boolean(),
  fee: z.enum(["FIXED", "FEE"]),
});

export const campaignClassHash =
  "0x07a4029632326873a5b22726af2c50d79bfb9d7e658604d3ada19334d0901071";
