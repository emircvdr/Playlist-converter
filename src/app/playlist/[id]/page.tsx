"use client";
import { trpc } from "@/lib/trpc";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Spinner } from "@heroui/react";

interface SpotifyTrack {
    id: string;
    name: string;
    duration_ms: number;
    album: {
        name: string;
        images: { url: string }[];
    };
    artists: { name: string }[];
}

interface SpotifyPlaylistItem {
    track: SpotifyTrack;
}

export default function Page() {
    const { id } = useParams();
    const router = useRouter();

    const [accessToken, setAccessToken] = useState<string>("");

    useEffect(() => {
        const stored = sessionStorage.getItem("spotify_access_token");
        if (stored) setAccessToken(stored);
    }, []);

    const { data: playlist, isLoading } = trpc.spotify.getPlaylist.useQuery(
        { id: id as string, accessToken: accessToken },
        { enabled: !!accessToken }
    );

    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const totalDuration = playlist?.playlist.tracks.items.reduce((acc: number, item: SpotifyPlaylistItem) => acc + item.track.duration_ms, 0) || 0;
    const totalMinutes = Math.floor(totalDuration / 60000);

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-purple-900 via-blue-900 to-black p-8">
            <button
                onClick={() => router.push('/')}
                className="mb-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-200 group"
            >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Back to Playlists</span>
            </button>

            {isLoading ? (
                <div className="flex items-center justify-center h-[60vh]">
                    <Spinner
                        size="lg"
                        label="Loading playlist..."
                        classNames={{
                            label: "text-white/70 font-medium"
                        }}
                    />
                </div>
            ) : playlist ? (
                <div className="max-w-7xl mx-auto">
                    <div className="bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-pink-500/20 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8 mb-8">
                        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                            <div className="relative group">

                                <img
                                    src={playlist.playlist.images[0]?.url}
                                    alt={playlist.playlist.name}
                                    className="w-48 h-48 rounded-2xl object-cover shadow-2xl ring-4 ring-white/20 group-hover:ring-white/40 transition-all duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <p className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-2">Playlist</p>
                                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                                    {playlist.playlist.name}
                                </h1>
                                {playlist.playlist.description && (
                                    <p className="text-white/70 text-base mb-6 max-w-2xl"
                                        dangerouslySetInnerHTML={{ __html: playlist.playlist.description }}
                                    />
                                )}
                                <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start text-sm text-white/60">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                        <span className="font-medium">{playlist.playlist.owner.display_name}</span>
                                    </div>
                                    <span>•</span>
                                    <span className="font-medium">{playlist.playlist.tracks.items.length} songs</span>
                                    <span>•</span>
                                    <span className="font-medium">~{totalMinutes} min</span>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-4 px-6 text-white/60 font-semibold text-xs uppercase tracking-wider w-12">#</th>
                                        <th className="text-left py-4 px-6 text-white/60 font-semibold text-xs uppercase tracking-wider">Title</th>
                                        <th className="text-left py-4 px-6 text-white/60 font-semibold text-xs uppercase tracking-wider hidden md:table-cell">Album</th>
                                        <th className="text-left py-4 px-6 text-white/60 font-semibold text-xs uppercase tracking-wider w-24">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                            </svg>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {playlist.playlist.tracks.items.map((item: SpotifyPlaylistItem, index: number) => (
                                        <tr
                                            key={item.track.id}
                                            className="border-b border-white/5 hover:bg-white/5 transition-all duration-200 group"
                                        >
                                            <td className="py-3 px-6 text-white/60 font-medium text-sm">
                                                {index + 1}
                                            </td>
                                            <td className="py-3 px-6">
                                                <div className="flex items-center gap-4">

                                                    <img
                                                        src={item.track.album.images[0]?.url}
                                                        alt={item.track.name}
                                                        className="w-12 h-12 rounded-lg object-cover shadow-lg ring-2 ring-white/10 group-hover:ring-white/30 transition-all duration-300"
                                                    />
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-white font-semibold text-sm truncate group-hover:text-purple-300 transition-colors duration-200">
                                                            {item.track.name}
                                                        </span>
                                                        <span className="text-white/60 text-xs truncate">
                                                            {item.track.artists.map((a: { name: string }) => a.name).join(', ')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-6 text-white/70 text-sm truncate hidden md:table-cell max-w-xs">
                                                {item.track.album.name}
                                            </td>
                                            <td className="py-3 px-6 text-white/60 text-sm font-medium">
                                                {formatDuration(item.track.duration_ms)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="text-center text-white/60">
                        <p className="text-xl">Playlist not found</p>
                    </div>
                </div>
            )}
        </div>
    );
}