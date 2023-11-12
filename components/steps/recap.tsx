import {ArrowLeft, ArrowRight, Cross, Plus, Rocket, Trash} from "lucide-react";
import {Button} from "../ui/button";
import {Label} from "@radix-ui/react-label";
import {
  Control,
  Controller,
  UseFormGetValues,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import {schema} from "@/lib/config";
import {z} from "zod";
import {Slider} from "../ui/slider";
import {Input, NumberInput} from "../ui/input";
import {Pie} from "react-chartjs-2";
import {Chart as ChartJS, ArcElement, Tooltip, Legend, Colors} from "chart.js";
import {StarknetWindowObject, connect} from "@argent/get-starknet";
import {Account, uint256} from "starknet";
import {useEffect, useState} from "react";
import {parseEther} from "ethers";

ChartJS.register(ArcElement, Tooltip, Legend, Colors);

export const RecapStep = ({
  back,
  getValues,
}: {
  back: () => void;
  getValues: UseFormGetValues<z.infer<typeof schema>>;
}) => {
  const [starknet, setStarknet] = useState<StarknetWindowObject | null>(null);

  useEffect(() => {
    connect({modalMode: "neverAsk", chainId: "SN_GOERLI"}).then((sn) =>
      setStarknet(sn)
    );
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Recap</h1>
      <p className="text-sm">You token is ready to launch! 🚀</p>
      <h2>Name: {getValues("name")}</h2>
      <h2>Ticker: ${getValues("ticker")}</h2>
      <h2>Supply: {getValues("initialSupply")}</h2>
      <h2>Initial Liquidity: {getValues("marketNotional")} ETH</h2>
      <div className="h-[400px]">
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
      <div className="w-full flex justify-between gap-4">
        <Button onClick={back} variant={"outline"}>
          <ArrowLeft className="mr-4" />
          Back
        </Button>
        {!starknet ? (
          <Button onClick={() => connect({chainId: "SN_GOERLI"})}>
            Connect Wallet
          </Button>
        ) : (
          <Button
            onClick={async () => {
              const account: Account = starknet.account;
              // const deployed = await account.deploy({
              //   classHash:
              //     "0x21293e71e7efff54ea1efe62a3cec51eaeb94ea4769339c4d5d9e8cde29a080",
              //   constructorCalldata: [
              //     Buffer.from(getValues("name"), "ascii"),
              //     Buffer.from(getValues("ticker"), "ascii"),
              //     uint256.bnToUint256(
              //       parseEther(
              //         (getValues("initialSupply") as any).replace(/,/g, "")
              //       )
              //     ).low,
              //     uint256.bnToUint256(
              //       parseEther(
              //         (getValues("initialSupply") as any).replace(/,/g, "")
              //       )
              //     ).high,
              //     account.address,
              //   ],
              // });
              // await account.waitForTransaction(deployed.transaction_hash);
              const deployed = {
                contract_address: [
                  "0x053b6bac8d5c6453f25fea5ff9703dbf46587fa0e332d4900485f0146f39ab45",
                ],
              };
              await account.execute([
                // {
                //   entrypoint: "transfer",
                //   contractAddress: deployed.contract_address[0],
                //   calldata: [
                //     "0x048BF0A2F6170BB162A3D8A821E54dC0dB313F5aef5c8Dc3068237D230d1f94a",
                //     uint256.bnToUint256(
                //       parseEther(
                //         (
                //           (5 *
                //             parseInt(
                //               (getValues("initialSupply") as any).replace(
                //                 /,/g,
                //                 ""
                //               )
                //             )) /
                //           100
                //         ).toFixed(18)
                //       )
                //     ).low,
                //     uint256.bnToUint256(
                //       parseEther(
                //         (
                //           (5 *
                //             parseInt(
                //               (getValues("initialSupply") as any).replace(
                //                 /,/g,
                //                 ""
                //               )
                //             )) /
                //           100
                //         ).toFixed(18)
                //       )
                //     ).high,
                //   ],
                // },
                // {
                //   entrypoint: "transfer",
                //   contractAddress: deployed.contract_address[0],
                //   calldata: [
                //     "0x048BF0A2F6170BB162A3D8A821E54dC0dB313F5aef5c8Dc3068237D230d1f94a",
                //     uint256.bnToUint256(
                //       parseEther(
                //         (
                //           (5 *
                //             parseInt(
                //               (getValues("initialSupply") as any).replace(
                //                 /,/g,
                //                 ""
                //               )
                //             )) /
                //           100
                //         ).toFixed(18)
                //       )
                //     ).low,
                //     uint256.bnToUint256(
                //       parseEther(
                //         (
                //           (5 *
                //             parseInt(
                //               (getValues("initialSupply") as any).replace(
                //                 /,/g,
                //                 ""
                //               )
                //             )) /
                //           100
                //         ).toFixed(18)
                //       )
                //     ).high,
                //   ],
                // },
                {
                  entrypoint: "approve",
                  contractAddress:
                    "0x030b787c358eb75203ba2c0819412c87787c5f4aaf625d742a4a5a25ff4fdf3c",
                  calldata: [
                    "0x03b0310fe3e35fef5e8a0150607ea77dc6541a2d39498072b809f511a1364dae",
                    uint256.bnToUint256(
                      parseEther(
                        (
                          (parseInt(getValues("initialSupply") as any) *
                            getValues("marketShare")) /
                          100
                        ).toFixed(18)
                      )
                    ).low,
                    uint256.bnToUint256(
                      parseEther(
                        (
                          (parseInt(getValues("initialSupply") as any) *
                            getValues("marketShare")) /
                          100
                        ).toFixed(18)
                      )
                    ).high,
                  ],
                },
                {
                  entrypoint: "approve",
                  contractAddress:
                    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
                  calldata: [
                    "0x03b0310fe3e35fef5e8a0150607ea77dc6541a2d39498072b809f511a1364dae",
                    uint256.bnToUint256(
                      parseEther(getValues("marketNotional") as any)
                    ).low,
                    uint256.bnToUint256(
                      parseEther(getValues("marketNotional") as any)
                    ).high,
                  ],
                },
                {
                  entrypoint: "addLiquidity",
                  contractAddress:
                    "0x03b0310fe3e35fef5e8a0150607ea77dc6541a2d39498072b809f511a1364dae",
                  calldata: [
                    deployed.contract_address[0],
                    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
                    0,
                    uint256.bnToUint256(
                      parseEther(
                        (
                          (parseInt(getValues("initialSupply") as any) *
                            getValues("marketShare")) /
                          100
                        ).toFixed(18)
                      )
                    ).low,
                    uint256.bnToUint256(
                      parseEther(
                        (
                          (parseInt(getValues("initialSupply") as any) *
                            getValues("marketShare")) /
                          100
                        ).toFixed(18)
                      )
                    ).high,
                    uint256.bnToUint256(
                      parseEther(getValues("marketNotional") as any)
                    ).low,
                    uint256.bnToUint256(
                      parseEther(getValues("marketNotional") as any)
                    ).high,
                    uint256.bnToUint256(
                      parseEther(
                        (
                          (parseInt(getValues("initialSupply") as any) *
                            getValues("marketShare")) /
                          100
                        ).toFixed(18)
                      )
                    ).low,
                    uint256.bnToUint256(
                      parseEther(
                        (
                          (parseInt(getValues("initialSupply") as any) *
                            getValues("marketShare")) /
                          100
                        ).toFixed(18)
                      )
                    ).high,
                    uint256.bnToUint256(
                      parseEther(getValues("marketNotional") as any)
                    ).low,
                    uint256.bnToUint256(
                      parseEther(getValues("marketNotional") as any)
                    ).high,
                    account.address,
                    Date.now() + 10000,
                  ],
                },
              ]);
            }}
          >
            Launch <Rocket className="ml-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
