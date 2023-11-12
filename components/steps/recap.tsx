import {ArrowLeft, Loader2, Rocket, Twitter} from "lucide-react";
import {Button} from "../ui/button";
import {UseFormGetValues} from "react-hook-form";
import {schema} from "@/lib/config";
import {z} from "zod";
import {Pie} from "react-chartjs-2";
import {Chart as ChartJS, ArcElement, Tooltip, Legend, Colors} from "chart.js";
import {StarknetWindowObject, connect} from "@argent/get-starknet";
import {Account, uint256} from "starknet";
import {useEffect, useState} from "react";
import {parseEther} from "ethers";
import {toast} from "../ui/use-toast";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

ChartJS.register(ArcElement, Tooltip, Legend, Colors);
const router =
  "0x028c858a586fa12123a1ccb337a0a3b369281f91ea00544d0c086524b759f627";
const ETH =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
const zkMeme =
  "0x00511C44Ac32BE44d25a2b5C62ea815F1D8d741DEA639507076BdEc9B7b89Aa9";
const classHash =
  "0x21293e71e7efff54ea1efe62a3cec51eaeb94ea4769339c4d5d9e8cde29a080";

export const RecapStep = ({
  back,
  getValues,
}: {
  back: () => void;
  getValues: UseFormGetValues<z.infer<typeof schema>>;
}) => {
  const [starknet, setStarknet] = useState<StarknetWindowObject | null>(null);
  const [loading, setLoading] = useState(false);
  const [launched, setLaunched] = useState<{
    pair: string;
    swap: string;
    token: string;
  }>({
    pair: "",
    swap: "",
    token: "0x04c0a5193d58f74fbace4b74dcf65481e734ed1714121bdc571da345540efa05",
  });

  useEffect(() => {
    connect({modalMode: "neverAsk", chainId: "SN_MAINNET"}).then((sn) =>
      setStarknet(sn)
    );
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Recap</h1>
      <p className="text-sm">You token is ready to launch! 🚀</p>
      <div className="w-full flex gap-10">
        <div className="w-[300px]">
          <Pie
            options={{
              plugins: {
                legend: {display: false},
              },
            }}
            data={{
              labels: [
                "Liquidity Pool",
                "ZkMeme",
                ...getValues("airdrops").map((a) => a.address),
                "you",
              ],
              datasets: [
                {
                  label: "Token distribution",
                  data: [
                    getValues("marketShare"),
                    5,
                    ...getValues("airdrops").map((a) => a.share),
                    100 -
                      [
                        getValues("marketShare"),
                        5,
                        ...getValues("airdrops").map((a) => a.share),
                      ].reduce((a, b) => a + b),
                  ],
                  hoverOffset: 4,
                },
              ],
            }}
          />
        </div>
        <Table>
          <TableCaption>Token recap</TableCaption>
          <TableHeader>
            <TableHead>Key</TableHead>
            <TableHead>Value</TableHead>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>{getValues("name")}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Ticker</TableCell>
              <TableCell>${getValues("ticker")}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Supply</TableCell>
              <TableCell>
                {Intl.NumberFormat("en-US").format(getValues("initialSupply"))}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Initial Liquidity</TableCell>
              <TableCell>
                {Intl.NumberFormat("en-US").format(getValues("marketNotional"))}{" "}
                ETH
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Liquidity</TableCell>
              <TableCell>
                {getValues("lockLiquidity") ? "locked" : "free"}
              </TableCell>
            </TableRow>
            {launched && (
              <>
                <TableRow>
                  <TableCell>Pair</TableCell>
                  <TableCell>
                    <Link
                      href={launched.pair}
                      className="text-primary underline"
                      target="_blank"
                    >
                      sithswap.com
                    </Link>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Swap</TableCell>
                  <TableCell>
                    <Link
                      href={launched.swap}
                      className="text-primary underline"
                      target="_blank"
                    >
                      avnu.fi
                    </Link>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Address</TableCell>
                  <TableCell>
                    <Link
                      href={`https://starkscan.co/token/${launched.token}`}
                      className="text-primary underline"
                      target="_blank"
                    >
                      {launched.token.slice(0, 10)}...
                      {launched.token.slice(-10)}
                    </Link>
                  </TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </div>
      {!launched ? (
        <div className="w-full flex justify-between gap-4">
          {!loading && (
            <Button onClick={back} variant={"outline"}>
              <ArrowLeft className="mr-4" />
              Back
            </Button>
          )}
          {!starknet ? (
            <Button
              onClick={async () => {
                const account = await connect({chainId: "SN_MAINNET"});
                if (account) setStarknet(account);
              }}
            >
              Connect Wallet
            </Button>
          ) : (
            <Button
              disabled={loading}
              onClick={async () => {
                try {
                  setLoading(true);
                  const account: Account = starknet.account;
                  toast({
                    title: "Deploying token",
                  });
                  const deployed = await account.deploy({
                    classHash: "",
                    constructorCalldata: [
                      Buffer.from(getValues("name"), "ascii"),
                      Buffer.from(getValues("ticker"), "ascii"),
                      uint256.bnToUint256(
                        parseEther(getValues("initialSupply").toFixed(18))
                      ).low,
                      uint256.bnToUint256(
                        parseEther(getValues("initialSupply").toFixed(18))
                      ).high,
                      account.address,
                    ],
                  });
                  toast({
                    title: "Waiting for deployment of token",
                  });
                  await new Promise((resolve) => {
                    const interval = setInterval(async () => {
                      try {
                        const receipt = await account.getTransactionReceipt(
                          deployed.transaction_hash
                        );
                        if (
                          (receipt as any).finality_status === "ACCEPTED_ON_L2"
                        ) {
                          clearInterval(interval);
                          resolve(() => {});
                        }
                      } catch (e) {}
                    }, 2000);
                  });
                  toast({
                    title: "Initiating initial supply",
                  });
                  const tx = await account.execute([
                    {
                      entrypoint: "transfer",
                      contractAddress: deployed.contract_address[0],
                      calldata: [
                        zkMeme,
                        uint256.bnToUint256(
                          parseEther(
                            ((5 * getValues("initialSupply")) / 100).toFixed(18)
                          )
                        ).low,
                        uint256.bnToUint256(
                          parseEther(
                            ((5 * getValues("initialSupply")) / 100).toFixed(18)
                          )
                        ).high,
                      ],
                    },
                    ...getValues("airdrops").map((airdrop) => {
                      return {
                        entrypoint: "transfer",
                        contractAddress: deployed.contract_address[0],
                        calldata: [
                          airdrop.address,
                          uint256.bnToUint256(
                            parseEther(
                              (
                                (airdrop.share * getValues("initialSupply")) /
                                100
                              ).toFixed(18)
                            )
                          ).low,
                          uint256.bnToUint256(
                            parseEther(
                              (
                                (airdrop.share * getValues("initialSupply")) /
                                100
                              ).toFixed(18)
                            )
                          ).high,
                        ],
                      };
                    }),
                    {
                      entrypoint: "approve",
                      contractAddress: deployed.contract_address[0],
                      calldata: [
                        router,
                        uint256.bnToUint256(
                          parseEther(
                            (
                              (getValues("initialSupply") *
                                getValues("marketShare")) /
                              100
                            ).toFixed(18)
                          )
                        ).low,
                        uint256.bnToUint256(
                          parseEther(
                            (
                              (getValues("initialSupply") *
                                getValues("marketShare")) /
                              100
                            ).toFixed(18)
                          )
                        ).high,
                      ],
                    },
                    {
                      entrypoint: "approve",
                      contractAddress: ETH,
                      calldata: [
                        router,
                        uint256.bnToUint256(
                          parseEther(getValues("marketNotional").toFixed(18))
                        ).low,
                        uint256.bnToUint256(
                          parseEther(getValues("marketNotional").toFixed(18))
                        ).high,
                      ],
                    },
                    {
                      entrypoint: "addLiquidity",
                      contractAddress: router,
                      calldata: [
                        deployed.contract_address[0],
                        ETH,
                        0,
                        uint256.bnToUint256(
                          parseEther(
                            (
                              (getValues("initialSupply") *
                                getValues("marketShare")) /
                              100
                            ).toFixed(18)
                          )
                        ).low,
                        uint256.bnToUint256(
                          parseEther(
                            (
                              (getValues("initialSupply") *
                                getValues("marketShare")) /
                              100
                            ).toFixed(18)
                          )
                        ).high,
                        uint256.bnToUint256(
                          parseEther(getValues("marketNotional").toFixed(18))
                        ).low,
                        uint256.bnToUint256(
                          parseEther(getValues("marketNotional").toFixed(18))
                        ).high,
                        uint256.bnToUint256(
                          parseEther(
                            (
                              (getValues("initialSupply") *
                                getValues("marketShare")) /
                              100
                            ).toFixed(18)
                          )
                        ).low,
                        uint256.bnToUint256(
                          parseEther(
                            (
                              (getValues("initialSupply") *
                                getValues("marketShare")) /
                              100
                            ).toFixed(18)
                          )
                        ).high,
                        uint256.bnToUint256(
                          parseEther(getValues("marketNotional").toFixed())
                        ).low,
                        uint256.bnToUint256(
                          parseEther(getValues("marketNotional").toFixed())
                        ).high,
                        account.address,
                        Math.floor(Date.now() / 1000) + 120,
                      ],
                    },
                  ]);
                  await new Promise((resolve) => {
                    const interval = setInterval(async () => {
                      try {
                        const receipt = await account.getTransactionReceipt(
                          tx.transaction_hash
                        );
                        if (
                          (receipt as any).finality_status === "ACCEPTED_ON_L2"
                        ) {
                          clearInterval(interval);
                          resolve(() => {});
                        }
                      } catch (e) {}
                    }, 2000);
                  });
                  const {
                    result: [pair],
                  } = await account.callContract({
                    entrypoint: "pairFor",
                    contractAddress: router,
                    calldata: [deployed.contract_address[0], ETH, 0],
                  });
                  if (getValues("lockLiquidity") === true) {
                    toast({
                      title: "Locking liquidity",
                      description:
                        "This step might take more than 2 minutes because we need to wait the contract to be indexed",
                    });
                    const [balance_low, balance_high]: any = await new Promise(
                      (resolve) => {
                        const interval = setInterval(async () => {
                          try {
                            const {
                              result: [balance_low, balance_high],
                            } = await account.callContract({
                              entrypoint: "balanceOf",
                              contractAddress: pair,
                              calldata: [account.address],
                            });
                            if (balance_low && balance_high) {
                              clearInterval(interval);
                              resolve([balance_low, balance_high]);
                            }
                          } catch (e) {}
                        }, 10000);
                      }
                    );
                    await account.execute([
                      {
                        entrypoint: "transfer",
                        contractAddress: pair,
                        calldata: [
                          `0x${"0".repeat(63)}1`,
                          balance_low,
                          balance_high,
                        ],
                      },
                    ]);
                  }
                  toast({title: "🚀 Token launched"});
                  setLoading(false);
                  setLaunched({
                    pair: `https://app.sithswap.com/add/${pair}`,
                    swap: `https://app.avnu.fi/en?tokenFrom=0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7&tokenTo=${deployed.contract_address[0]}&amount=1`,
                    token: deployed.contract_address[0],
                  });
                } catch (e) {
                  setLoading(false);
                }
              }}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Rocket className="mr-2 h-4 w-4" />
              )}{" "}
              Launch
            </Button>
          )}
        </div>
      ) : (
        <Link
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
            `I created $${getValues(
              "ticker"
            )} in seconds with zkmeme by @flydex0.\nContract address: ${
              launched.token
            }\n`
          )}&url=${encodeURIComponent(`https://zkmeme.vercel.app`)}`}
          target="_blank"
        >
          <Button>
            <Twitter className="w-4 h-4 mr-2" />
            Share on twitter
          </Button>
        </Link>
      )}
    </div>
  );
};
