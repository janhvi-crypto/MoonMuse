import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Pause, SkipForward, SkipBack, LogOut } from "lucide-react";
import { toast } from "sonner";

const TOKEN_KEY = "spotify_token";
const TOKEN_EXP = "spotify_token_exp";
const CLIENT_KEY = "spotify_client_id";
const PLAYLIST_KEY = "spotify_playlist";
const DEFAULT_PLAYLIST = "67F0mPhmi4d58O8ZIy56eG";
const SCOPES = "streaming user-read-email user-read-private user-modify-playback-state user-read-playback-state";

// PKCE helpers
const genVerifier = () => {
  const arr = new Uint8Array(64);
  crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr)).replace(/[^a-zA-Z0-9]/g, "").slice(0, 64);
};
const sha256 = async (s: string) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

export const SpotifyPlayer = () => {
  const [clientId, setClientId] = useState(() => localStorage.getItem(CLIENT_KEY) || "");
  const [token, setToken] = useState<string | null>(null);
  const [player, setPlayer] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [state, setState] = useState<any>(null);
  const [playlistId, setPlaylistId] = useState(() => localStorage.getItem(PLAYLIST_KEY) || DEFAULT_PLAYLIST);
  const [setupOpen, setSetupOpen] = useState(false);

  // Handle PKCE callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const cid = localStorage.getItem(CLIENT_KEY);
    const verifier = sessionStorage.getItem("pkce_verifier");
    if (code && cid && verifier) {
      window.history.replaceState({}, "", window.location.pathname);
      fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: cid,
          grant_type: "authorization_code",
          code,
          redirect_uri: window.location.origin + window.location.pathname,
          code_verifier: verifier,
        }),
      }).then(r => r.json()).then(d => {
        if (d.access_token) {
          localStorage.setItem(TOKEN_KEY, d.access_token);
          localStorage.setItem(TOKEN_EXP, String(Date.now() + d.expires_in * 1000));
          setToken(d.access_token);
          toast.success("Connected to Spotify ✦");
        } else {
          toast.error("Spotify login failed");
        }
      });
    } else {
      const stored = localStorage.getItem(TOKEN_KEY);
      const exp = Number(localStorage.getItem(TOKEN_EXP) || 0);
      if (stored && Date.now() < exp) setToken(stored);
    }
  }, []);

  // Init player
  useEffect(() => {
    if (!token) return;
    const init = () => {
      const p = new (window as any).Spotify.Player({
        name: "Sundown",
        getOAuthToken: (cb: (t: string) => void) => cb(token),
        volume: 0.6,
      });
      p.addListener("ready", ({ device_id }: any) => { setDeviceId(device_id); });
      p.addListener("player_state_changed", (s: any) => setState(s));
      p.addListener("authentication_error", () => { logout(); toast.error("Spotify session expired"); });
      p.addListener("account_error", () => toast.error("Spotify Premium required for in-site playback"));
      p.connect();
      setPlayer(p);
    };
    if ((window as any).Spotify) init();
    else (window as any).onSpotifyWebPlaybackSDKReady = init;
    return () => { player?.disconnect?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Auto-start playlist when ready
  useEffect(() => {
    if (token && deviceId && playlistId) {
      fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ context_uri: `spotify:playlist:${playlistId}` }),
      }).catch(() => {});
    }
  }, [token, deviceId, playlistId]);

  const login = async () => {
    if (!clientId) { setSetupOpen(true); return; }
    localStorage.setItem(CLIENT_KEY, clientId);
    const verifier = genVerifier();
    sessionStorage.setItem("pkce_verifier", verifier);
    const challenge = await sha256(verifier);
    const url = `https://accounts.spotify.com/authorize?` + new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: window.location.origin + window.location.pathname,
      scope: SCOPES,
      code_challenge_method: "S256",
      code_challenge: challenge,
    });
    window.location.href = url;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXP);
    setToken(null); setState(null); setDeviceId(null);
    player?.disconnect?.();
  };

  const cmd = (path: string, method = "PUT") => {
    if (!deviceId || !token) return;
    fetch(`https://api.spotify.com/v1/me/player/${path}${path.includes("?") ? "&" : "?"}device_id=${deviceId}`, {
      method, headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  };

  if (!token) {
    return (
      <div className="dream-card rounded-2xl p-6 grain animate-fade-up">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-[#1DB954]" />
          <span className="font-sans text-xs uppercase tracking-[0.3em] text-petal">your playlist</span>
        </div>
        <h3 className="font-serif text-2xl text-paper mb-2">Bring your own songs</h3>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Sign in with Spotify Premium to play your playlist right here, under the dusk.
        </p>

        {setupOpen ? (
          <div className="space-y-3 mb-4">
            <p className="text-xs text-muted-foreground leading-relaxed font-sans">
              Spotify needs a one-time Client ID. It takes 60 seconds:
            </p>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside font-sans leading-relaxed">
              <li>Open <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noreferrer" className="text-sun underline">Spotify Developer Dashboard</a></li>
              <li>Create app → add redirect URI: <code className="text-petal break-all">{window.location.origin + window.location.pathname}</code></li>
              <li>Copy the Client ID and paste below</li>
            </ol>
            <Input
              placeholder="Spotify Client ID"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="bg-dusk-mid border-border text-paper"
            />
          </div>
        ) : null}

        <div className="flex gap-2">
          <Button onClick={login} className="bg-[#1DB954] hover:bg-[#1ed760] text-ink font-medium flex-1">
            {clientId ? "Sign in with Spotify" : "Set up Spotify"}
          </Button>
          {!setupOpen && (
            <Button variant="ghost" onClick={() => setSetupOpen(true)} className="text-muted-foreground text-xs">
              I have a Client ID
            </Button>
          )}
        </div>
      </div>
    );
  }

  const track = state?.track_window?.current_track;
  const paused = state?.paused ?? true;

  return (
    <div className="dream-card rounded-2xl p-6 grain animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-twinkle" />
          <span className="font-sans text-xs uppercase tracking-[0.3em] text-petal">spotify</span>
        </div>
        <Button size="icon" variant="ghost" onClick={logout} className="h-7 w-7 text-muted-foreground hover:text-sun">
          <LogOut className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="flex gap-4 items-center mb-5">
        {track?.album?.images?.[0]?.url ? (
          <img src={track.album.images[0].url} alt="" className="w-16 h-16 rounded-lg object-cover sun-glow" />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-dusk-mid" />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-lg text-paper truncate">{track?.name || "—"}</h3>
          <p className="font-hand text-petal text-base truncate">{track?.artists?.map((a: any) => a.name).join(", ") || "loading the dusk…"}</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button size="icon" variant="ghost" onClick={() => cmd("previous", "POST")} className="text-paper hover:text-sun">
          <SkipBack className="w-5 h-5" />
        </Button>
        <Button size="icon" onClick={() => cmd(paused ? "play" : "pause")} className="bg-sun hover:bg-sun-glow text-ink rounded-full w-14 h-14 sun-glow">
          {paused ? <Play className="w-6 h-6 ml-0.5" /> : <Pause className="w-6 h-6" />}
        </Button>
        <Button size="icon" variant="ghost" onClick={() => cmd("next", "POST")} className="text-paper hover:text-sun">
          <SkipForward className="w-5 h-5" />
        </Button>
      </div>

      <div className="mt-5 pt-4 border-t border-border/50">
        <label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-sans">playlist id</label>
        <div className="flex gap-2 mt-1">
          <Input
            value={playlistId}
            onChange={(e) => setPlaylistId(e.target.value)}
            className="bg-dusk-mid border-border text-paper text-xs h-8"
          />
          <Button size="sm" onClick={() => { localStorage.setItem(PLAYLIST_KEY, playlistId); cmd("play", "PUT"); fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, { method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ context_uri: `spotify:playlist:${playlistId}` }) }); }} className="h-8 bg-sun text-ink hover:bg-sun-glow">
            load
          </Button>
        </div>
      </div>
    </div>
  );
};
