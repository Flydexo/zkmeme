import {ArrowLeft, ArrowRight} from "lucide-react";
import {Button} from "../ui/button";
import {Input} from "../ui/input";
import {Label} from "@radix-ui/react-label";
import {UseFormRegisterReturn} from "react-hook-form";

export const TickerStep = ({
  input,
  next,
  back,
}: {
  input: UseFormRegisterReturn;
  next: () => void;
  back: () => void;
}) => {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Choose a Ticker for your token</h1>
      <p className="text-sm">
        This is the surname of your token used on exchanges and social media
      </p>
      <div className="flex flex-col gap-1">
        <Label htmlFor="name">Token Ticker</Label>
        <Input
          type="text"
          id="name"
          placeholder="DOGE, PEPE, BONK, SHIB"
          {...input}
        />
      </div>
      <div className="w-full flex justify-between gap-4">
        <Button onClick={back} variant={"outline"}>
          <ArrowLeft className="mr-4" />
          Back
        </Button>
        <Button onClick={next}>
          Validate Ticker <ArrowRight className="ml-4" />
        </Button>
      </div>
    </div>
  );
};
