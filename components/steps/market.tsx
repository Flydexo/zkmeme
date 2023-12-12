import {ArrowLeft, ArrowRight, Info} from "lucide-react";
import {Button} from "../ui/button";
import {Label} from "@radix-ui/react-label";
import {Control, Controller, UseFormWatch} from "react-hook-form";
import {schema} from "@/lib/config";
import {z} from "zod";
import {Slider} from "../ui/slider";
import {NumberInput} from "../ui/input";
import {Switch} from "../ui/switch";
import {on} from "events";
import {Tooltip, TooltipProvider} from "../ui/tooltip";
import {TooltipContent, TooltipTrigger} from "@radix-ui/react-tooltip";

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
          watch("marketNotional") /
          ((watch("initialSupply") * watch("marketShare")) / 100 || 1)
        ).toFixed(18)}{" "}
        ETH
      </h2>
      <div className="flex w-full justify-between">
        <div className="flex flex-col gap-1 w-1/2">
          <Label htmlFor="supply">Percent of the supply</Label>
          <Controller
            control={control}
            name="marketShare"
            render={({field: {onChange, value}}) => {
              return (
                <div className="flex gap-4 items-center">
                  <NumberInput
                    onValueChange={(a) => {
                      onChange({target: {value: a.floatValue}});
                    }}
                    value={value}
                    className="w-[10ch]"
                    id={"supply"}
                  />
                  %
                  <Slider
                    value={[watch("marketShare")]}
                    onValueChange={(v) => onChange(v[0])}
                    min={0}
                    max={watch("fee") === "FIXED" ? 100 : 97}
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
          render={({field: {onChange, value}}) => {
            return (
              <div className="flex flex-col gap-1">
                <Label htmlFor="eth">ETH Supply</Label>
                <NumberInput
                  onValueChange={(a) => {
                    onChange({target: {value: a.floatValue}});
                  }}
                  value={value}
                  id="eth"
                />
              </div>
            );
          }}
        />
        <Controller
          control={control}
          name="lockLiquidity"
          render={({field: {onChange, value}}) => {
            return (
              <div className="flex items-center gap-4">
                <Label htmlFor="lock">
                  Burn liquidity{" "}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 hover:stroke-slate-400 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-sm border-accent bg-background border-2 rounded-lg p-2 w-60">
                          By burning initial liquidity you cannot drain the pool
                          and dump the token. Which is usually a good sign for
                          investors
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Switch checked={value} onCheckedChange={onChange} />
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
        <Button
          onClick={next}
          disabled={watch("fee") === "FEE" && watch("marketShare") > 97}
        >
          Validate Market <ArrowRight className="ml-4" />
        </Button>
      </div>
    </div>
  );
};
