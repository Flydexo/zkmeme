"use client";

import {NameStep} from "@/components/steps/name";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {TickerStep} from "@/components/steps/ticker";
import {SupplyStep} from "@/components/steps/supply";
import {MarketStep} from "@/components/steps/market";
import {DistributionStep} from "@/components/steps/distribution";
import {RecapStep} from "@/components/steps/recap";
import {schema} from "@/lib/config";
import {Toaster} from "@/components/ui/toaster";

export default function Trade() {
  const [step, setStep] = useState(0);
  const {register, watch, control, setValue, getValues} = useForm<
    z.infer<typeof schema>
  >({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "Token",
      ticker: "TKN",
      initialSupply: 100,
      marketShare: 10,
      marketNotional: 1,
      airdrops: [],
      lockLiquidity: true,
    },
  });

  return (
    <div className="grid w-screen h-screen place-content-center dark">
      <Toaster />
      {step === 0 ? (
        <NameStep input={register("name")} next={() => setStep(1)} />
      ) : step === 1 ? (
        <TickerStep
          input={register("ticker")}
          next={() => setStep(2)}
          back={() => setStep(0)}
        />
      ) : step === 2 ? (
        <SupplyStep
          next={() => setStep(3)}
          back={() => setStep(1)}
          watch={watch}
          control={control}
        />
      ) : step === 3 ? (
        <MarketStep
          next={() => setStep(4)}
          back={() => setStep(2)}
          watch={watch}
          control={control}
        />
      ) : step === 4 ? (
        <DistributionStep
          next={() => setStep(5)}
          back={() => setStep(3)}
          watch={watch}
          control={control}
          setValue={setValue}
          getValues={getValues}
        />
      ) : step === 5 ? (
        <RecapStep back={() => setStep(4)} getValues={getValues} />
      ) : null}
    </div>
  );
}
