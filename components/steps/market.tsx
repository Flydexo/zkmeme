import {ArrowLeft, ArrowRight} from "lucide-react";
import {Button} from "../ui/button";
import {Label} from "@radix-ui/react-label";
import {Control, Controller, UseFormWatch} from "react-hook-form";
import {schema} from "@/lib/config";
import {z} from "zod";
import {Slider} from "../ui/slider";
import {NumberInput} from "../ui/input";

export const MarketStep = ({
  control,
  next,
  back,
  watch,
}: {
  control: Control<z.infer<typeof schema>, any>;
  next: () => void;
  back: () => void;
  watch: UseFormWatch<z.infer<typeof schema>>;
}) => {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">
        Choose the initial price of{" "}
        <span className="text-primary font-bold">
          ${watch("ticker").toUpperCase()}
        </span>
      </h1>
      <p className="text-sm">
        This will determine the initial price of your token. You need to provide
        a % of the token supply and ETH. The more ETH you provide, the more
        liquid your token will be.
      </p>
      <h2>
        Initial price:{" "}
        {(
          (watch("marketNotional") as any) /
          (((watch("initialSupply") as any).replace(",", "") *
            (watch("marketShare") as any)) /
            100 || 1)
        ).toFixed(18)}{" "}
        ETH
      </h2>
      <div className="flex w-full justify-between">
        <div className="flex flex-col gap-1 w-3/4">
          <Label htmlFor="supply">Percent of the supply</Label>
          <Controller
            control={control}
            name="marketShare"
            render={({field: {onChange, value}}) => {
              return (
                <div className="flex gap-4 items-center">
                  <NumberInput
                    onChange={onChange}
                    value={value}
                    className="w-[5ch]"
                    id={"supply"}
                  />
                  %
                  <Slider
                    onValueChange={(v) => onChange(v[0])}
                    min={0}
                    max={100}
                    defaultValue={[33]}
                  />
                </div>
              );
            }}
          />
        </div>
        <Controller
          control={control}
          name="marketNotional"
          render={({field: {onChange}}) => {
            return (
              <div className="flex flex-col gap-1">
                <Label htmlFor="eth">ETH Supply</Label>
                <NumberInput onChange={onChange} id="eth" />
              </div>
            );
          }}
        />
      </div>
      <div className="w-full flex justify-between gap-4">
        <Button onClick={back} variant={"outline"}>
          <ArrowLeft className="mr-4" />
          Back
        </Button>
        <Button onClick={next}>
          Validate Market <ArrowRight className="ml-4" />
        </Button>
      </div>
    </div>
  );
};
