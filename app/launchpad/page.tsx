"use client";

import {Button} from "@/components/ui/button";
import {Dialog, DialogHeader} from "@/components/ui/dialog";
import {Input, NumberInput} from "@/components/ui/input";
import {Progress} from "@/components/ui/progress";
import {Toaster} from "@/components/ui/toaster";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {useToast} from "@/components/ui/use-toast";
import {
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {useAccount, useProvider} from "@starknet-react/core";
import {formatEther, parseEther} from "ethers";
import {Coins} from "lucide-react";
import Link from "next/link";
import {useCallback, useState} from "react";
import {addAddressPadding, shortString, uint256} from "starknet";
import {campaignClassHash} from "@/lib/config";

const MAX_CAMPAIGN_TIME = 3 * 24 * 3600;
const MIN_CLAIM_TIME = 24 * 3600;

export default function Launch() {
  const [searchCampaignId, setSearchCampaignId] = useState("");
  const {provider} = useProvider();
  const [data, setData] = useState<{
    name: string;
    symbol: string;
    price: bigint;
    raised: bigint;
    remaining: bigint;
    multiplier: number;
    end: number;
    terminated_at: number;
  }>();
  const {account} = useAccount();
  const {toast} = useToast();
  const [ethToBuy, setEthToBuy] = useState(1);

  const search = useCallback(
    async (id: string) => {
      try {
        const classHash = await provider.getClassHashAt(id);

        if (addAddressPadding(classHash).toLowerCase() != campaignClassHash)
          return toast({
            variant: "destructive",
            title: "Contract not a campaign",
          });

        const {
          result: [token],
        } = await provider.callContract({
          contractAddress: id,
          entrypoint: "token",
        });
        const name = shortString.decodeShortString(
          (
            await provider.callContract({
              contractAddress: token,
              entrypoint: "name",
            })
          ).result[0]
        );
        const symbol = shortString.decodeShortString(
          (
            await provider.callContract({
              contractAddress: token,
              entrypoint: "symbol",
            })
          ).result[0]
        );
        const {
          result: [price_low, price_high],
        } = await provider.callContract({
          contractAddress: id,
          entrypoint: "price",
        });
        const {
          result: [remaining_low, remaining_high],
        } = await provider.callContract({
          contractAddress: id,
          entrypoint: "remaining_eth",
        });
        const {
          result: [raised_low, raised_high],
        } = await provider.callContract({
          contractAddress:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          entrypoint: "balanceOf",
          calldata: [id],
        });
        const {
          result: [started_at],
        } = await provider.callContract({
          contractAddress: id,
          entrypoint: "started_at",
        });
        const {
          result: [lp_low, lp_high],
        } = await provider.callContract({
          contractAddress: id,
          entrypoint: "lp_amount",
        });
        let token_low, token_high;
        try {
          const {
            result: [_token_low, _token_high],
          } = await provider.callContract({
            contractAddress: token,
            entrypoint: "balanceOf",
            calldata: [id],
          });
          token_low = _token_low;
          token_high = _token_high;
        } catch (e) {
          try {
            const {
              result: [_token_low, _token_high],
            } = await provider.callContract({
              contractAddress: token,
              entrypoint: "balance_of",
              calldata: [id],
            });
            token_low = _token_low;
            token_high = _token_high;
          } catch (e) {
            return toast({
              variant: "destructive",
              title: "Token does not respect erc20 standard",
            });
          }
        }
        const {
          result: [terminated_at],
        } = await provider.callContract({
          contractAddress: id,
          entrypoint: "terminated_at",
        });

        setData({
          name,
          symbol,
          price: uint256.uint256ToBN({low: price_low, high: price_high}),
          raised: uint256.uint256ToBN({low: raised_low, high: raised_high}),
          remaining: uint256.uint256ToBN({
            low: remaining_low,
            high: remaining_high,
          }),
          end: Number(started_at) + MAX_CAMPAIGN_TIME,
          multiplier: Number(
            formatEther(
              ((uint256.uint256ToBN({low: token_low, high: token_high}) -
                uint256.uint256ToBN({low: lp_low, high: lp_high})) *
                BigInt(10) ** BigInt(18)) /
                uint256.uint256ToBN({low: lp_low, high: lp_high})
            )
          ),
          terminated_at: Number(terminated_at),
        });
      } catch (e) {
        console.error(e);
        toast({
          variant: "destructive",
          title: "Invalid campaign",
        });
      }
    },
    [provider]
  );

  return (
    <div className="w-screen flex flex-col items-center gap-16 p-16">
      <Toaster />
      <div className="text-center flex flex-col gap-4">
        <h1 className="text-3xl font-bold">ZKMeme Launchpad</h1>
        <h2>Launch safely your meme token with high liquidity</h2>
        <Button asChild>
          <Link href={"/launchpad/add"}>Create Launchpad</Link>
        </Button>
      </div>
      <div className="flex items-center justify-between w-2/3">
        <h3 className="text-2xl font-bold">Search campaign</h3>
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Campaign address"
            value={searchCampaignId}
            onChange={(e) => setSearchCampaignId(e.target.value)}
          />
          <Button type="button" onClick={() => search(searchCampaignId)}>
            Search
          </Button>
        </div>
      </div>
      {data && (
        <div className="flex flex-col gap-8 w-2/3">
          <div className="bg-card text-card-foreground border-border border-2 rounded-lg flex items-center justify-around p-8 gap-8">
            <div className="flex items-center gap-4">
              <h3 className="font-semibold col-span-2">
                {data.name} ({data.symbol})
              </h3>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm whitespace-nowrap">
                Remains: {formatEther(data.remaining)}
              </span>
              <Progress
                value={
                  (Number(formatEther(data.raised)) /
                    Number(formatEther(data.raised + data.remaining))) *
                  100
                }
                max={100}
                className="w-40"
              />
              <span className="text-sm whitespace-nowrap">
                {formatEther(data.raised + data.remaining)} ETH
              </span>
            </div>
            <p>Price: {formatEther(data.price)} ETH</p>
            <div className="flex items-center gap-1">
              {data.terminated_at > 0 ? (
                <Button
                  disabled={
                    data.terminated_at + MIN_CLAIM_TIME > Date.now() / 1000
                  }
                  onClick={async () => {
                    if (!account)
                      return toast({
                        title: "Please connect wallet",
                        variant: "destructive",
                      });
                    await account.execute({
                      entrypoint: "claim",
                      contractAddress: searchCampaignId,
                      calldata: [],
                    });
                    toast({
                      title: "Tokens claimed",
                    });
                  }}
                >
                  {data.terminated_at + MIN_CLAIM_TIME > Date.now() / 1000
                    ? "Claim in 1 day"
                    : "Claim"}
                </Button>
              ) : data.end > Date.now() / 1000 ? (
                <Dialog>
                  <DialogTrigger>
                    <Button>Buy</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Buy {data.name} (${data.symbol})
                      </DialogTitle>
                      <DialogDescription>
                        Buy $<strong>{data.symbol}</strong> at{" "}
                        <strong>{formatEther(data.price)} ETH</strong> fixed
                        price a <strong>{data.multiplier}</strong> multiplier at
                        launch price. Your ETH is locked during the launchpad
                        duration. Either the campaign collects all the required
                        ETH and you can claim your tokens after one day or the
                        campaign fails and you can withdraw your ETH the{" "}
                        <strong>
                          {Intl.DateTimeFormat("en").format(data.end * 1000)}
                        </strong>
                        . ZKMeme takes a 1% fee on deposit and withdraws.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-start w-full gap-2 justify-between">
                      <div className="flex flex-col gap-2 w-full">
                        <NumberInput
                          min={0}
                          thousandSeparator={","}
                          suffix=" ETH"
                          value={ethToBuy}
                          onValueChange={(v) => setEthToBuy(v.floatValue || 0)}
                        />
                        <p className="text-xs pl-2">
                          {Intl.NumberFormat().format(
                            (ethToBuy * 0.99) / Number(formatEther(data.price))
                          )}{" "}
                          {data.symbol}
                        </p>
                      </div>
                      <Button
                        onClick={async () => {
                          if (!account)
                            return toast({
                              title: "Please connect wallet",
                              variant: "destructive",
                            });
                          await account.execute([
                            {
                              contractAddress:
                                "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
                              entrypoint: "approve",
                              calldata: [
                                searchCampaignId,
                                uint256.bnToUint256(
                                  parseEther(ethToBuy.toString())
                                ).low,
                                uint256.bnToUint256(
                                  parseEther(ethToBuy.toString())
                                ).high,
                              ],
                            },
                            {
                              contractAddress: searchCampaignId,
                              entrypoint: "buy",
                              calldata: [
                                uint256.bnToUint256(
                                  parseEther(ethToBuy.toString())
                                ).low,
                                uint256.bnToUint256(
                                  parseEther(ethToBuy.toString())
                                ).high,
                              ],
                            },
                          ]);
                        }}
                      >
                        Buy
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button
                  onClick={async () => {
                    if (!account)
                      return toast({
                        title: "Please connect wallet",
                        variant: "destructive",
                      });
                    await account.execute({
                      entrypoint: "withdraw",
                      contractAddress: searchCampaignId,
                      calldata: [],
                    });
                    toast({
                      title: "ETH withdrawn",
                    });
                  }}
                >
                  Withdraw
                </Button>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      size={"icon"}
                      variant={"outline"}
                      onClick={() => {
                        navigator.clipboard.writeText(searchCampaignId);
                      }}
                    >
                      <Coins className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy campaign token address</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      )}
      {/* <div className="flex flex-col gap-8 w-2/3">
        <h3 className="text-2xl font-bold">Ongoing campaigns</h3>
        <div className="bg-card text-card-foreground border-border border-2 rounded-lg flex items-center justify-around p-8 gap-8">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage
                src="https://pbs.twimg.com/profile_images/1733078776685244416/NwmsCa54_400x400.jpg"
                width={48}
                height={48}
              />
              <AvatarFallback>SPEPE</AvatarFallback>
            </Avatar>
            <h3 className="font-semibold col-span-2">Stark PEPE (SPEPE)</h3>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm whitespace-nowrap">Raised: 9</span>
            <Progress max={100} value={90} className="w-40" />
            <span className="text-sm whitespace-nowrap">10 ETH</span>
          </div>
          <p>Price: 0.00001 ETH</p>
          <div className="flex items-center gap-1">
            <Button>Buy</Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button size={"icon"} variant={"outline"}>
                    <Coins className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy campaign address</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <h3 className="text-2xl font-bold">Finished campaigns</h3>
        <div className="bg-card text-card-foreground border-border border-2 rounded-lg flex items-center justify-around p-8 gap-8">
          <Avatar>
            <AvatarImage
              src="https://pbs.twimg.com/profile_images/1733078776685244416/NwmsCa54_400x400.jpg"
              width={48}
              height={48}
            />
            <AvatarFallback>SPEPE</AvatarFallback>
          </Avatar>
          <h3 className="font-semibold">Stark PEPE (SPEPE)</h3>
          <p>Raised: 10 ETH</p>
          <p>
            Launch Price: <span className="text-sm">0.00001 ETH</span>
          </p>
          <p>
            Launch ROI: <span className="font-bold text-green-400">2700%</span>
          </p>
        </div>
      </div> */}
    </div>
  );
}
