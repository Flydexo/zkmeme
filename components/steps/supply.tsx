import {ArrowLeft, ArrowRight} from "lucide-react";
import {Button} from "../ui/button";
import {Input, NumberInput} from "../ui/input";
import {Label} from "@radix-ui/react-label";
import {Control, Controller, UseFormWatch} from "react-hook-form";
import {schema} from "@/lib/config";
import {z} from "zod";

export const SupplyStep = ({
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
        Choose the initial supply of{" "}
        <span className="text-primary font-bold">
          ${watch("ticker").toUpperCase()}
        </span>
      </h1>
      <p className="text-sm">This will determine how many tokens will exist</p>
      <Controller
        name="initialSupply"
        control={control}
        render={({field: {onChange}}) => (
          <div className="w-full flex justify-between">
            <Button
              variant={"secondary"}
              onClick={() => onChange({target: {value: "21000000"}})}
            >
              21 million
            </Button>
            <Button
              variant={"secondary"}
              onClick={() => onChange({target: {value: "1000000000"}})}
            >
              1 Billion
            </Button>
            <Button
              variant={"secondary"}
              onClick={() => onChange({target: {value: "1000000000000"}})}
            >
              1 Trillion
            </Button>
          </div>
        )}
      />
      <div className="flex flex-col gap-1">
        <Label htmlFor="supply">Initial supply</Label>
        <Controller
          control={control}
          name="initialSupply"
          render={({field: {onChange}}) => {
            return (
              <NumberInput
                thousandSeparator=","
                allowLeadingZeros={false}
                onChange={onChange}
                value={watch("initialSupply")}
                id="supply"
              />
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
          Validate Supply <ArrowRight className="ml-4" />
        </Button>
      </div>
    </div>
  );
};
