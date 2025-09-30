"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import LiquidGlassCard from "@/components/liquid-glass-card";
import spotifyLogo from "../../public/spotify.png";
import appleLogo from "../../public/apple.svg";
import Image from "next/image";


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


  const getUser = async () => {
    const response = await fetch('/server/spotify/me', {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem('spotify_access_token')}`,
      },
    });
    const data = await response.json();
    console.log('User data:', data);
  }

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const expiresIn = searchParams.get('expires_in');

    if (accessToken && refreshToken) {
      sessionStorage.setItem('spotify_access_token', accessToken);
      sessionStorage.setItem('spotify_refresh_token', refreshToken);
      sessionStorage.setItem('spotify_expires_in', expiresIn || '3600');
      console.log('✅ Spotify tokens saved to sessionStorage!');
      router.replace('/');
      getUser();
    } else if (sessionStorage.getItem('spotify_access_token')) {
      getUser();
    }
  }, [searchParams, router]);


  const handleBrandClick = async (brandName: string) => {
    if (brandName === "Spotify") {
      const accessToken = sessionStorage.getItem('spotify_access_token');
      if (accessToken) {
        console.log('Already authenticated!', accessToken);
      } else {
        window.location.href = '/server/spotify';
      }
    } else if (brandName === "Apple") {
      console.log("Apple Music coming soon");
    }
  };

  return (
    <div className="flex flex-col gap-4 justify-center items-center h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black p-4">
      <div className="flex flex-col gap-4 my-5">
        <h1 className="text-6xl font-bold text-center ">Playlist Converter</h1>
        <p className="text-sm text-center text-foreground/80">Convert your playlists from one platform to another</p>
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

    </div>
  );
}
