"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import LiquidGlassCard from "@/components/liquid-glass-card";
import spotifyLogo from "../../public/spotify.png";
import appleLogo from "../../public/apple.svg";
import { trpc } from "@/lib/trpc";
import SpotifyTable from "@/components/SpotifyTable";
import AppleTable from "@/components/AppleTable";
import { MoveRight } from "lucide-react";
import { Button } from "@heroui/react";

interface MusicKitInstance {
  authorize: () => Promise<string>;
}

interface MusicKitStatic {
  configure: (config: {
    developerToken: string;
    app: { name: string; build: string };
  }) => void;
  getInstance: () => MusicKitInstance;
}

declare global {
  interface Window {
    MusicKit: MusicKitStatic;
  }
}

export type Playlist = { id: string; name: string };

const brands = [
  { id: 1, name: "Spotify", image: spotifyLogo },
  { id: 2, name: "Apple", image: appleLogo },
];

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [accessToken, setAccessToken] = useState<string>("");
  const { data: authUrl } = trpc.spotify.spotifyAuth.useQuery();
  const { data: user } = trpc.spotify.getUser.useQuery(
    { accessToken },
    { enabled: !!accessToken }
  );

  useEffect(() => {
    const stored = sessionStorage.getItem("spotify_access_token");
    if (stored) setAccessToken(stored);

    const a = searchParams.get("access_token");
    const r = searchParams.get("refresh_token");
    const e = searchParams.get("expires_in");

    if (a && r) {
      sessionStorage.setItem("spotify_access_token", a);
      sessionStorage.setItem("spotify_refresh_token", r);
      sessionStorage.setItem("spotify_expires_in", e || "3600");
      setAccessToken(a);
      router.replace("/");
    }
  }, [searchParams, router]);


  const { data: appleDev } = trpc.appleMusic.getDeveloperToken.useQuery();
  const [scriptReady, setScriptReady] = useState(false);
  const [mkConfigured, setMkConfigured] = useState(false);
  const configuredRef = useRef(false);

  const [appleUserToken, setAppleUserToken] = useState<string | null>(null);
  const {
    data: applePlaylists,
    refetch: refetchApple,
    isFetching: appleLoading,
  } = trpc.appleMusic.getLibraryPlaylists.useQuery(
    { userToken: appleUserToken ?? "", limit: 25 },
    { enabled: !!appleUserToken }
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.MusicKit) {
      setScriptReady(true);
      return;
    }

    const s = document.createElement("script");
    s.src = "https://js-cdn.music.apple.com/musickit/v1/musickit.js";
    s.async = true;

    const onLoaded = () => setScriptReady(true);
    window.addEventListener("musickitloaded", onLoaded);
    s.onload = () => setScriptReady(true);

    document.head.appendChild(s);
    return () => {
      window.removeEventListener("musickitloaded", onLoaded);
      try { document.head.removeChild(s); } catch { }
    };
  }, []);

  useEffect(() => {
    if (!scriptReady || !appleDev?.token) return;
    if (configuredRef.current) return;

    try {
      const MK = window.MusicKit;
      if (!MK || typeof MK.configure !== "function") return;

      MK.configure({
        developerToken: appleDev.token,
        app: { name: "Playlist Converter", build: "1.0" },
      });

      configuredRef.current = true;
      setMkConfigured(true);
    } catch (e) {
      console.error("MusicKit configure error", e);
      configuredRef.current = false;
      setMkConfigured(false);
    }
  }, [scriptReady, appleDev?.token]);

  const handleBrandClick = async (brandName: string) => {
    if (brandName === "Spotify") {
      if (!accessToken && authUrl) window.location.href = authUrl;
      return;
    }

    if (brandName === "Apple") {
      try {
        if (!mkConfigured || !configuredRef.current) {
          setTimeout(async () => {
            if (!configuredRef.current) {
              alert("Apple Music hazırlanıyor, lütfen tekrar deneyin.");
              return;
            }
            const MK = window.MusicKit;
            const inst = MK.getInstance();
            const token = await inst.authorize();
            setAppleUserToken(token);
            refetchApple();
          }, 150);
          return;
        }

        const MK = window.MusicKit;
        const inst = MK.getInstance();
        const token = await inst.authorize();
        setAppleUserToken(token);
        refetchApple();
      } catch (e) {
        console.error("Apple Music auth error", e);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 justify-center items-center h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black p-4">
      <div className="flex flex-col gap-4 my-5">
        <h1 className="text-6xl font-bold text-center">Playlist Converter</h1>
        <p className="text-sm text-center">Convert your playlists from one platform to another</p>
      </div>
      <div className="flex flex-wrap gap-4">
        {brands.map((brand) => (
          <LiquidGlassCard key={brand.id} onClick={() => handleBrandClick(brand.name)}>
            <Image src={brand.image} alt={brand.name} width={150} height={150} />
            {brand.name === "Apple" && (
              <div className="text-xs mt-2 text-center opacity-80">
                {!scriptReady ? "Loading…" : mkConfigured ? "Ready" : "Configuring…"}
              </div>
            )}
          </LiquidGlassCard>
        ))}
      </div>

      <div className="flex flex-row gap-5 items-center justify-center w-full max-w-6xl">
        <SpotifyTable data={user?.userPlaylist.items} isLoading={false} />
        <MoveRight className="w-10 h-10" />
        <AppleTable
          data={applePlaylists?.data ?? []}
          isLoading={!!appleUserToken && appleLoading}
        />
      </div>
    </div>
  );
}
