"use client";

import RemotePeer from "@/components/RemotePeer/RemotePeer";
import { web3auth } from "@/utils/web3Auth";
import {
  useLocalAudio,
  useLocalScreenShare,
  useLocalVideo,
  usePeerIds,
  useRoom,
} from "@huddle01/react/hooks";
import { Inter } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import { Web3Auth } from "@web3auth/modal";
import { ADAPTER_EVENTS } from "@web3auth/base";

const inter = Inter({ subsets: ["latin"] });

export default function Room({ params }: { params: { roomId: string } }) {
  const [isLoaded, setIsLoaded] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);
  const { joinRoom, leaveRoom, state } = useRoom({
    onLeave: () => {
      web3auth.logout();
      window.location.reload();
    },
  });
  const { enableVideo, isVideoOn, stream, disableVideo } = useLocalVideo();
  const { enableAudio, disableAudio, isAudioOn } = useLocalAudio();
  const { startScreenShare, stopScreenShare, shareStream } =
    useLocalScreenShare();
  const { peerIds } = usePeerIds();

  const subscribeAuthEvents = (web3auth: Web3Auth) => {
    web3auth.on(ADAPTER_EVENTS.CONNECTED, async () => {
      const info = await web3auth.getUserInfo();
      console.log("info", info.name);
      console.log("roomId", params.roomId);
      const tokenResponse = await fetch(
        `/token?roomId=${params.roomId}&displayName=${info.name ?? "guest"}`
      );
      const token = await tokenResponse.text();
      if (token) {
        await joinRoom({
          roomId: params.roomId,
          token,
        });
      }
    });
    web3auth.on(ADAPTER_EVENTS.DISCONNECTED, () => {
      console.log("disconnected");
    });
    web3auth.on(ADAPTER_EVENTS.ERRORED, (error) => {
      console.log("error", error);
    });
    web3auth.on(ADAPTER_EVENTS.ERRORED, (error) => {
      console.log("error", error);
    });
  };

  useEffect(() => {
    setIsLoaded(true);
  }, [isLoaded]);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (shareStream && screenRef.current) {
      screenRef.current.srcObject = shareStream;
    }
  }, [shareStream]);

  useEffect(() => {
    const init = async () => {
      await web3auth.initModal();
    };
    if (!web3auth.connected) {
      init();
    }
    subscribeAuthEvents(web3auth);
  }, [web3auth.connected]);

  return (
    <>
      {isLoaded && (
        <main
          className={`flex min-h-screen flex-col items-center p-4 ${inter.className}`}
        >
          <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
            <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
              <code className="font-mono font-bold">{state}</code>
            </p>
            <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
              {state === "idle" && (
                <button
                  type="button"
                  className="bg-blue-500 p-2 mx-2 rounded-lg"
                  onClick={async () => {
                    try {
                      if (web3auth.connected) {
                        web3auth.logout();
                      } else {
                        web3auth.connect();
                      }
                    } catch (error) {
                      console.log(error);
                    }
                  }}
                >
                  {web3auth.connected ? "Logout" : "Login to Join Room"}
                </button>
              )}

              {state === "connected" && (
                <>
                  <button
                    className="bg-blue-500 p-2 mx-2 rounded-lg"
                    onClick={async () => {
                      isVideoOn ? await disableVideo() : await enableVideo();
                    }}
                  >
                    {isVideoOn ? "Disable Video" : "Enable Video"}
                  </button>
                  <button
                    className="bg-blue-500 p-2 mx-2 rounded-lg"
                    onClick={async () => {
                      isAudioOn ? await disableAudio() : await enableAudio();
                    }}
                  >
                    {isAudioOn ? "Disable Audio" : "Enable Audio"}
                  </button>
                  <button
                    className="bg-blue-500 p-2 mx-2 rounded-lg"
                    onClick={async () => {
                      shareStream
                        ? await stopScreenShare()
                        : await startScreenShare();
                    }}
                  >
                    {shareStream ? "Disable Screen" : "Enable Screen"}
                  </button>
                  <button
                    className="bg-blue-500 p-2 mx-2 rounded-lg"
                    onClick={leaveRoom}
                  >
                    Leave Room
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="w-full mt-8 flex gap-4 justify-between items-stretch">
            <div className="flex-1 justify-between items-center flex flex-col">
              <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700/10 after:dark:from-sky-900 after:dark:via-[#0141ff]/40 before:lg:h-[360px]">
                <div className="relative flex gap-2">
                  {isVideoOn && (
                    <div className="w-1/2 mx-auto border-2 rounded-xl border-blue-400">
                      <video
                        ref={videoRef}
                        className="aspect-video rounded-xl"
                        autoPlay
                        muted
                      />
                    </div>
                  )}
                  {shareStream && (
                    <div className="w-1/2 mx-auto border-2 rounded-xl border-blue-400">
                      <video
                        ref={screenRef}
                        className="aspect-video rounded-xl"
                        autoPlay
                        muted
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 mb-32 grid gap-2 text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
                {peerIds.map((peerId) =>
                  peerId ? <RemotePeer key={peerId} peerId={peerId} /> : null
                )}
              </div>
            </div>
          </div>
        </main>
      )}
    </>
  );
}
