"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import LiquidGlassCard from "@/components/liquid-glass-card";
import spotifyLogo from "../../public/spotify.png";
import appleLogo from "../../public/apple.svg";
import Image from "next/image";
import { trpc } from "@/lib/trpc";
import SpotifyTable from "@/components/SpotifyTable";
import { Button } from "@heroui/react";
import { MoveRight } from "lucide-react";
import AppleTable from "@/components/AppleTable";

export type Playlist = {
  id: string
  name: string
}

const brands = [
  {
    id: 1,
    name: "Spotify",
    image: spotifyLogo,

  },
  {
    id: 2,
    name: "Apple",
    image: appleLogo,
  }
]


export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string>('');

  const { data: authUrl } = trpc.spotify.spotifyAuth.useQuery();

  const { data: user } = trpc.spotify.getUser.useQuery(
    { accessToken },
    { enabled: !!accessToken }
  );

  useEffect(() => {
    const storedToken = sessionStorage.getItem('spotify_access_token');
    if (storedToken) {
      setAccessToken(storedToken);
    }

    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const expiresIn = searchParams.get('expires_in');

    if (accessToken && refreshToken) {
      sessionStorage.setItem('spotify_access_token', accessToken);
      sessionStorage.setItem('spotify_refresh_token', refreshToken);
      sessionStorage.setItem('spotify_expires_in', expiresIn || '3600');
      setAccessToken(accessToken);
      console.log('✅ Spotify tokens saved to sessionStorage!');
      router.replace('/');
    }
  }, [searchParams, router]);

  useEffect(() => {
    console.log('User data:', user);
  }, [user]);


  const handleBrandClick = async (brandName: string) => {
    if (brandName === "Spotify") {
      if (accessToken) {
        console.log('Already authenticated!', accessToken);
      } else {
        if (authUrl) {
          window.location.href = authUrl;
        }
      }
    } else if (brandName === "Apple") {
      console.log("Apple Music coming soon");
    }
  };

  return (
    <div className="flex flex-col gap-4 justify-center items-center h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black p-4">
      <div className="flex flex-col gap-4 my-5">
        <h1 className="text-6xl font-bold text-center ">Playlist Converter</h1>
        <p className="text-sm text-center">Convert your playlists from one platform to another</p>
      </div>
      <div className="flex flex-wrap gap-4">
        {
          brands.map((brand) => (
            <LiquidGlassCard key={brand.id} onClick={() => handleBrandClick(brand.name)} >
              <Image src={brand.image} alt={brand.name} width={150} height={150} />
            </LiquidGlassCard>
          ))
        }
      </div>
      <div className="flex flex-row gap-5 items-center justify-center w-full max-w-6xl">
        <SpotifyTable data={user?.userPlaylist.items} isLoading={false} />
        <MoveRight className="w-10 h-10" />
        {/* TODO: Add Apple Music Table */}
        <AppleTable data={[]} isLoading={false} />

      </div>

    </div>
  );
}
