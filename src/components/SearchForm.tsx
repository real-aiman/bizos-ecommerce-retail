"use client";

import Image from "next/image";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useId, useRef, useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface Suggestion { id: number; name: string; slug: string; price: number; image: string; department: string }

export function SearchForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const box = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) { setResults([]); return; }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        const data = (await res.json()) as { results: Suggestion[] };
        setResults(data.results);
        setActive(-1);
      } catch { /* aborted or offline: keep the last results */ }
    }, 200);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [value]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function go(path: string) { setOpen(false); router.push(path); }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (active >= 0 && results[active]) return go(`/products/${results[active].slug}`);
    go(value.trim() ? `/search?q=${encodeURIComponent(value.trim())}` : "/#catalog");
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") setOpen(false);
    if (!results.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((i) => (i + 1) % results.length); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => (i <= 0 ? results.length - 1 : i - 1)); }
  }

  const showList = open && results.length > 0;

  return (
    <form ref={box} className="search-form" onSubmit={submit} role="search">
      <Search size={17} aria-hidden="true" />
      <input
        value={value}
        onChange={(e) => { setValue(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKey}
        placeholder="Search products"
        aria-label="Search products"
        enterKeyHint="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
      />
      {showList && (
        <ul className="suggestions" id={listId} role="listbox">
          {results.map((r, i) => (
            <li key={r.id} id={`${listId}-${i}`} role="option" aria-selected={i === active} className={i === active ? "is-active" : ""}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => go(`/products/${r.slug}`)}>
                <span className="mini-thumb"><Image src={r.image} alt="" fill sizes="40px" /></span>
                <span><strong>{r.name}</strong><small>{r.department}</small></span>
                <span>{formatCurrency(r.price)}</span>
              </button>
            </li>
          ))}
          <li role="presentation"><button type="button" className="see-all" onMouseDown={(e) => e.preventDefault()} onClick={() => go(`/search?q=${encodeURIComponent(value.trim())}`)}>See all results</button></li>
        </ul>
      )}
    </form>
  );
}
