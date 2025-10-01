import { LoaderCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { SPOTIFY_TOKEN_URL, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, base64ClientCreds } from "@/lib/spotify";
import axios from "axios";

interface CallbackProps {
    searchParams: { code?: string; state?: string; error?: string };
}

export default async function Callback({ searchParams }: CallbackProps) {
    const code = searchParams.code;
    const state = searchParams.state;
    const error = searchParams.error;
    if (error) {
        redirect('/?error=access_denied');
    }
    if (!state) {
        redirect('/?error=state_mismatch');
    }
    if (code) {
        let tokenData;
        try {
            console.log('=== Token Exchange Debug ===');
            console.log('CLIENT_ID:', CLIENT_ID);
            console.log('CLIENT_SECRET:', CLIENT_SECRET ? '***SET***' : 'MISSING');
            console.log('REDIRECT_URI:', REDIRECT_URI);
            console.log('Code:', code);

            const response = await axios.post(
                SPOTIFY_TOKEN_URL,
                new URLSearchParams({
                    code: code,
                    redirect_uri: REDIRECT_URI,
                    grant_type: 'authorization_code'
                }).toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': 'Basic ' + base64ClientCreds()
                    }
                }
            );
            tokenData = response.data;
            console.log('Token exchange successful!');
        } catch (err: any) {
            console.error('=== Token Exchange Error ===');
            console.error('Error:', err.response?.data || err.message);
            console.error('Status:', err.response?.status);
            console.error('Full error:', err);
            redirect(`/?error=token_exchange_failed&detail=${encodeURIComponent(err.response?.data?.error_description || err.message)}`);
        }
        if (tokenData) {
            const { access_token, refresh_token, expires_in } = tokenData;
            redirect(`/?access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`);
        }
    }
    return (
        <div className="flex flex-col gap-4 justify-center items-center h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black p-4">
            <LoaderCircle className="animate-spin text-white" />
            <p className="text-white">Connecting to Spotify...</p>
        </div>
    );
}