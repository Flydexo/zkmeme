"use client";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import {NumericFormat} from "react-number-format";
import {SubmitHandler, useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {
  Form,
  FormLabel,
  FormField,
  FormItem,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import {useAccount, useContract, useProvider} from "@starknet-react/core";
import {constants, hash, uint256, shortString, stark} from "starknet";
import {parseEther} from "ethers";
import {erc20Abi} from "@/lib/abis/erc20";
import {useToast} from "@/components/ui/use-toast";
import {Toaster} from "@/components/ui/toaster";
import {useState} from "react";
import {Loader, Loader2} from "lucide-react";
import {campaignClassHash} from "@/lib/config";

const schema = z
  .object({
    token: z
      .object({
        address: z
          .string()
          .startsWith("0x")
          .max(66)
          .min(65)
          .regex(/0[xX][0-9a-fA-F]+/g),
      })
      .required(),
    ethAmount: z.number().gt(0),
    supply: z.number().gt(0).max(100),
    liquidity: z.number().gt(0).max(100),
    dex: z.enum(["JEDISWAP"]),
  })
  .required()
  .refine((s) => s.supply + s.liquidity <= 100, {
    message: "liquidity and supply must be less or equal than 100%",
    path: ["liquidity"],
  });

export default function Launch() {
  const {account} = useAccount();
  const {provider} = useProvider();
  const {toast} = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const {contract: token} = useContract({
    address: form.watch("token.address"),
    abi: erc20Abi,
  });

  const submit: SubmitHandler<z.infer<typeof schema>> = async (input) => {
    if (!token || !account) return;
    try {
      setLoading(true);
      const supply = (await token.call("total_supply")) as bigint;
      const salt = stark.randomAddress();
      const unique = 0;
      const constructorCalldata = [
        input.token.address,
        uint256.bnToUint256(parseEther(input.ethAmount.toString())).low,
        uint256.bnToUint256(parseEther(input.ethAmount.toString())).high,
        uint256.bnToUint256(
          (supply * BigInt(input.supply * 100)) / BigInt(10000)
        ).low,
        uint256.bnToUint256(
          (supply * BigInt(input.supply * 100)) / BigInt(10000)
        ).high,
        uint256.bnToUint256(
          (supply * BigInt(input.liquidity * 100)) / BigInt(10000)
        ).low,
        uint256.bnToUint256(
          (supply * BigInt(input.liquidity * 100)) / BigInt(10000)
        ).high,
        shortString.encodeShortString(
          `CMP-${shortString.decodeShortString(
            (await token.call("symbol")).toString()
          )}`
        ),
        shortString.encodeShortString(
          `Campaign-${shortString.decodeShortString(
            (await token.call("name")).toString()
          )}`
        ),
        account.address,
      ];
      const address = hash.calculateContractAddressFromHash(
        salt,
        campaignClassHash,
        constructorCalldata,
        unique
      );
      const tx = await account.execute([
        {
          contractAddress: form.getValues("token.address"),
          entrypoint: "approve",
          calldata: [
            address,
            uint256.bnToUint256(
              (supply * BigInt((input.supply + input.liquidity) * 100)) /
                BigInt(10000)
            ).low,
            uint256.bnToUint256(
              (supply * BigInt((input.supply + input.liquidity) * 100)) /
                BigInt(10000)
            ).high,
          ],
        },
        {
          contractAddress: constants.UDC.ADDRESS,
          entrypoint: constants.UDC.ENTRYPOINT,
          calldata: [
            campaignClassHash,
            salt,
            unique,
            constructorCalldata.length,
            ...constructorCalldata,
          ],
        },
      ]);
      await provider.waitForTransaction(tx.transaction_hash);
      toast({
        title: "Campaign created",
        action: (
          <Button
            variant={"outline"}
            onClick={() => navigator.clipboard.writeText(address)}
          >
            Copy
          </Button>
        ),
      });
    } catch {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen flex items-center justify-center min-h-screen">
      <Toaster />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(submit)}
          className="flex flex-col gap-8 w-1/3"
        >
          <h1 className="text-2xl font-semibold">
            Launch safely your meme token with high liquidity
          </h1>
          <p className="font-light text-sm">
            The ZKMeme launchpad allows you to create a campaign to raise the
            initial liquidity of your pool from your community. If the campaign
            raises all the raise amount in ETH then the liquidity pool is
            created with the raised ETH. After 1 day, the campaign participants
            can claim their owed tokens. Otherwise, if the campaign did not
            raise enough ETH during a 3 day period, participants can withdraw
            their ETH.
          </p>
          <FormField
            control={form.control}
            name="token.address"
            render={({field}) => {
              return (
                <FormItem className="flex flex-col gap-1">
                  <FormLabel>Token address</FormLabel>
                  <FormControl>
                    <Input
                      id="tokenAddress"
                      placeholder="paste your token address here"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="ethAmount"
            render={({field}) => {
              return (
                <FormItem className="flex flex-col gap-1">
                  <FormLabel>Raise amount (ETH)</FormLabel>
                  <FormControl>
                    <NumericFormat
                      id="raiseAmount"
                      customInput={Input}
                      thousandSeparator=","
                      allowNegative={false}
                      allowLeadingZeros={false}
                      suffix=" ETH"
                      onValueChange={(v) => {
                        field.onChange({
                          target: {value: v.floatValue},
                        });
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="supply"
            render={({field}) => {
              return (
                <FormItem className="flex flex-col gap-1">
                  <FormLabel>Launch Supply Percentage</FormLabel>
                  <FormControl>
                    <NumericFormat
                      id="supply"
                      customInput={Input}
                      thousandSeparator=","
                      allowNegative={false}
                      allowLeadingZeros={false}
                      decimalScale={2}
                      suffix="%"
                      isAllowed={(values) => {
                        const {floatValue} = values;
                        return floatValue! <= 100;
                      }}
                      onValueChange={(v) =>
                        field.onChange({
                          target: {value: v.floatValue},
                        })
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="liquidity"
            render={({field}) => {
              return (
                <FormItem className="flex flex-col gap-1">
                  <FormLabel>LP Supply Percentage</FormLabel>
                  <FormControl>
                    <NumericFormat
                      id="liquidity"
                      customInput={Input}
                      thousandSeparator=","
                      allowNegative={false}
                      allowLeadingZeros={false}
                      decimalScale={2}
                      suffix="%"
                      isAllowed={(values) => {
                        const {floatValue} = values;
                        return floatValue! <= 100;
                      }}
                      onValueChange={(v) =>
                        field.onChange({
                          target: {value: v.floatValue},
                        })
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="dex"
            render={({field}) => {
              return (
                <FormItem className="flex flex-col gap-1">
                  <FormLabel>DEX</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger id="dex">
                        <SelectValue placeholder="Select a DEX" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="JEDISWAP">Jediswap</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          {account ? (
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Launch campaign
            </Button>
          ) : (
            <p>Please connect wallet</p>
          )}
        </form>
      </Form>
    </div>
  );
}
