import {Button} from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-red-400 inline-block text-transparent bg-clip-text">
        zkMeme
      </h1>
      <p>Create Starknet tokens within seconds</p>
      <Link href={"/app"}>
        <Button
          size={"lg"}
          className="bg-gradient-to-r from-blue-600 via-indigo-500 to-red-400"
        >
          Start Now
        </Button>
      </Link>
      <p>
        created by{" "}
        <Link
          className="underline bg-gradient-to-r from-blue-600 via-indigo-500 to-red-400 text-transparent bg-clip-text"
          href={"https://twitter.com/flydex0"}
          target="_blank"
        >
          @flydex0
        </Link>
      </p>
    </div>
  );
}
