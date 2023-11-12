import {ArrowLeft, ArrowRight, Cross, Plus, Trash} from "lucide-react";
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

ChartJS.register(ArcElement, Tooltip, Legend, Colors);

export const DistributionStep = ({
  control,
  next,
  back,
  watch,
  setValue,
  getValues,
}: {
  control: Control<z.infer<typeof schema>, any>;
  next: () => void;
  back: () => void;
  watch: UseFormWatch<z.infer<typeof schema>>;
  setValue: UseFormSetValue<z.infer<typeof schema>>;
  getValues: UseFormGetValues<z.infer<typeof schema>>;
}) => {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">
        Choose the distribution of{" "}
        <span className="text-primary font-bold">
          ${watch("ticker").toUpperCase()}
        </span>
      </h1>
      <p className="text-sm">
        This will determine the initial owners of the token. Be careful a big
        holder can have a high impact on the price.
      </p>
      <div className="flex flex-col gap-2">
        <h2>Airdrop addresses</h2>
        {watch("airdrops").map((a, i) => {
          return (
            <div key={i} className="flex items-end gap-2">
              <Controller
                name={`airdrops.${i}.address`}
                control={control}
                render={({field: {onChange, value}}) => (
                  <div className="flex flex-col gap-1">
                    <Label htmlFor={`${i}.address`}>Address</Label>
                    <Input
                      value={value}
                      onChange={onChange}
                      id={`${i}.address`}
                    />
                  </div>
                )}
              />
              <Controller
                name={`airdrops.${i}.share`}
                control={control}
                render={({field: {onChange, value}}) => (
                  <div className="flex flex-col gap-1">
                    <Label htmlFor={`${i}.share`}>Share (%)</Label>
                    <NumberInput
                      value={value}
                      onChange={(e) =>
                        onChange({target: {value: parseInt(e.target.value)}})
                      }
                      id={`${i}.share`}
                    />
                  </div>
                )}
              />
              <Trash
                color="hsl(346.8 77.2% 49.8%)"
                className="mb-2"
                onClick={() => {
                  let airdops = [...getValues("airdrops")];
                  airdops.splice(i, 1);
                  setValue("airdrops", airdops);
                }}
              />
            </div>
          );
        })}
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setValue("airdrops", [
              ...watch("airdrops"),
              {address: "0x", share: 1},
            ]);
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div>
        <Pie
          data={{
            labels: [
              "Liquidity Pool",
              "ZkMeme",
              ...watch("airdrops").map((a) => a.address),
              "you",
            ],
            datasets: [
              {
                label: "Token distribution",
                data: [
                  watch("marketShare"),
                  5,
                  ...watch("airdrops").map((a) => a.share),
                  100 -
                    [
                      watch("marketShare"),
                      5,
                      ...watch("airdrops").map((a) => a.share),
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
        <Button onClick={next}>
          Validate Distribution <ArrowRight className="ml-4" />
        </Button>
      </div>
    </div>
  );
};
