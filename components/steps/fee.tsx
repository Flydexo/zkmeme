import {ArrowLeft, ArrowRight} from "lucide-react";
import {Button} from "../ui/button";
import {Input} from "../ui/input";
import {Label} from "@radix-ui/react-label";
import {Control, Controller, UseFormRegisterReturn} from "react-hook-form";
import {z} from "zod";
import {schema} from "@/lib/config";
import {cn} from "@/lib/utils";

export const FeeStep = ({
  next,
  back,
  control,
}: {
  control: Control<z.infer<typeof schema>>;
  back: () => void;
  next: () => void;
}) => {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">How do you want to pay?</h1>
      <p className="text-sm">
        Choose either to pay a fixed price in ETH or to pay 3% of your token
        supply.
      </p>
      <Controller
        name="fee"
        control={control}
        render={({field: {onChange, value}}) => {
          return (
            <div className="w-full flex items-center justify-center gap-4">
              <div
                className={cn(
                  "bg-card text-card-foreground rounded-lg border-2 p-4 flex flex-col gap-2 border-border items-center px-8  transition-colors cursor-pointer",
                  value === "FIXED" ? "bg-green-700 border-green-800" : ""
                )}
                onClick={() => onChange({target: {value: "FIXED"}})}
              >
                <h1 className="text-xl font-bold">Fixed fee</h1>
                <h2 className="text-lg font-medium">0.01 ETH</h2>
              </div>
              <div
                className={cn(
                  "bg-card text-card-foreground rounded-lg border-2 p-4 flex flex-col gap-2 border-border items-center px-8 transition-colors  cursor-pointer",
                  value === "FEE" ? "bg-green-700 border-green-800" : ""
                )}
                onClick={() => onChange({target: {value: "FEE"}})}
              >
                <h1 className="text-xl font-bold">Supply fee</h1>
                <h2 className="text-lg font-medium">3% supply</h2>
              </div>
            </div>
          );
        }}
      />
      <div className="w-full flex justify-between gap-4">
        <Button onClick={back} variant={"outline"}>
          <ArrowLeft className="mr-4" />
          Back
        </Button>
        <Button onClick={next}>
          Validate Fee <ArrowRight className="ml-4" />
        </Button>
      </div>
    </div>
  );
};
