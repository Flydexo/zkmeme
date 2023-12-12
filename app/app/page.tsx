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
import {Progress} from "@/components/ui/progress";
import {FeeStep} from "@/components/steps/fee";

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
      fee: "FEE",
    },
  });

  return (
    <div className="w-1/2">
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
        <FeeStep
          next={() => setStep(4)}
          back={() => setStep(2)}
          control={control}
        />
      ) : step === 4 ? (
        <MarketStep
          next={() => setStep(5)}
          back={() => setStep(3)}
          watch={watch}
          control={control}
        />
      ) : step === 5 ? (
        <DistributionStep
          next={() => setStep(6)}
          back={() => setStep(4)}
          watch={watch}
          control={control}
          setValue={setValue}
          getValues={getValues}
        />
      ) : step === 6 ? (
        <RecapStep back={() => setStep(5)} getValues={getValues} />
      ) : null}
      <Progress value={(step / 6) * 100} className="mt-10" />
    </div>
  );
}
