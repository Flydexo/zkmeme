"use client";

import {useState} from "react";
import {Button} from "../ui/button";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useStarkName,
} from "@starknet-react/core";
import Image from "next/image";
import {createPortal} from "react-dom";
import Link from "next/link";

export const Header = () => {
  const [modalOpened, setModalOpened] = useState(false);
  const {connect, connectors} = useConnect();
  const {disconnect} = useDisconnect();
  const {account} = useAccount();
  const {data: name} = useStarkName({address: account?.address});

  return (
    <div className="w-full flex items-center p-4 justify-between">
      <Link
        href={"/"}
        className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-red-400 inline-block text-transparent bg-clip-text"
      >
        zkMeme
      </Link>
      <div className="flex items-center gap-4">
        <Link href={"/token"} className="hover:text-muted-foreground">
          Token creator
        </Link>
        <Link href={"/launchpad"} className="hover:text-muted-foreground">
          Launchpad
        </Link>
      </div>
      {account ? (
        <Button onClick={() => disconnect()}>
          {name ? name : account.address.slice(0, 4)}...
          {account.address.slice(-4)}
        </Button>
      ) : (
        <Button onClick={() => setModalOpened(true)}>Connect Wallet</Button>
      )}
      {modalOpened &&
        createPortal(
          <div
            className="top-0 left-0 w-screen h-screen bg-black bg-opacity-20 fixed grid place-content-center z-10"
            onClick={() => setModalOpened(false)}
          >
            <div className="w-[33vw] h-max p-4 rounded-lg bg-card text-card-foreground flex flex-col gap-2">
              <h2 className="text-xl font-semibold text-center">
                Connect Wallet
              </h2>
              {connectors.map((connector, i) => (
                <div
                  className="w-full bg-accent text-accent-foreground rounded-md flex p-2 justify-between text-lg cursor-pointer"
                  key={i}
                  onClick={() => connect({connector})}
                >
                  <Image
                    src={connector.icon.light!}
                    alt={connector.name}
                    width={24}
                    height={24}
                  />
                  <h3>{connector.name}</h3>
                </div>
              ))}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
