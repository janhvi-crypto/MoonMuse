import { useEffect, useState } from "react";
import { Moon, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { entriesStore, newId, today, type Entry } from "@/lib/entries-store";
import { toast } from "sonner";

interface Props { kind: "dream" | "manifest"; }

const COPY = {
  dream: {
    label: "dream log",
    title: "last night, i dreamt…",
    placeholder: "soft details before they slip away…",
    cta: "save the dream",
    chip: "DREAMS ☾",
  },
  manifest: {
    label: "manifestation notes",
    title: "i call this in",
    placeholder: "I am… I receive… I welcome…",
    cta: "send it to the moon",
    chip: "WHISPERS ✦",
  },
};

export const SaveableJournal = ({ kind }: Props) => {
  const c = COPY[kind];
  const [list, setList] = useState<Entry[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    const refresh = () => setList(entriesStore.list(kind));
    refresh();
    return entriesStore.subscribe(refresh);
  }, [kind]);

  const save = () => {
    if (!body.trim()) { toast.error("write a little something ✦"); return; }
    entriesStore.save({ id: newId(), kind, date: today(), title, body, createdAt: Date.now() });
    toast.success("kept softly 💗");
    setTitle(""); setBody("");
  };

  return (
    <div className="glass-panel rounded-3xl p-6 grain animate-fade-up">
      <div className="flex items-center gap-2 text-cloud-pink mb-1">
        <Moon className="w-4 h-4" />
        <span className="font-pixel text-[10px] uppercase tracking-[0.35em]">{c.label}</span>
      </div>
      <h3 className="font-serif italic text-2xl md:text-3xl text-paper mb-4">{c.title}</h3>

      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="title (optional)"
        className="w-full bg-transparent border-b border-cloud-pink/20 pb-1 mb-2 font-serif italic text-xl text-paper placeholder:text-paper/30 outline-none focus:border-cloud-pink/50"
      />
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder={c.placeholder}
        className="w-full min-h-[140px] rounded-2xl bg-paper/5 border border-cloud-pink/20 p-3 font-hand text-xl text-paper placeholder:text-paper/40 outline-none resize-none focus:border-cloud-pink/50"
      />
      <Button onClick={save} className="w-full mt-3 bg-cloud-pink text-ink hover:bg-bow">
        <Save className="w-4 h-4 mr-2" /> {c.cta}
      </Button>

      {list.length > 0 && (
        <div className="mt-5">
          <p className="font-pixel text-[9px] tracking-[0.3em] text-cloud-pink mb-2">{c.chip}</p>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {list.slice(0, 10).map(e => (
              <div key={e.id} className="bg-night-soft/30 rounded-xl px-3 py-2 group">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-pixel text-[9px] text-paper/60 tracking-wider">{e.date}</span>
                  {e.title && <span className="font-serif italic text-paper/90 text-sm">· {e.title}</span>}
                  <button
                    onClick={() => entriesStore.remove(e.id)}
                    className="ml-auto opacity-0 group-hover:opacity-100 text-paper/40 hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="font-hand text-lg text-paper/85 leading-snug whitespace-pre-wrap">{e.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
