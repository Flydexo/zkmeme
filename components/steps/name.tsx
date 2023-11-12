import {ArrowRight} from "lucide-react";
import {Button} from "../ui/button";
import {Input} from "../ui/input";
import {Label} from "@radix-ui/react-label";
import {UseFormRegisterReturn} from "react-hook-form";

export const NameStep = ({
  input,
  next,
}: {
  input: UseFormRegisterReturn;
  next: () => void;
}) => {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Choose a Name for your token</h1>
      <p className="text-sm">This is the full name of your token</p>
      <div className="flex flex-col gap-1">
        <Label htmlFor="name">Token Name</Label>
        <Input
          type="text"
          id="name"
          placeholder="Dogecoin, Pepe, Bonk, HarryPotterObamaSonic10Inu"
          {...input}
        />
      </div>
      <Button onClick={next}>
        Validate Name <ArrowRight className="ml-4" />
      </Button>
    </div>
  );
};
