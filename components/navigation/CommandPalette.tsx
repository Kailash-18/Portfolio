"use client";

import { useEffect, useRef, useState } from "react";
import { Command, Search, X, CornerDownLeft, MapPin, Download, Copy, Github, Gamepad2 } from "lucide-react";
import { navigation } from "./Navigation";
import { profile } from "../../lib/profile/resume";
import { copyEmail } from "../portfolio/Contact";

const commands = [
  ...navigation.map(([label,id]) => ({label, id, group:"Navigate", icon:MapPin})),
  ...[["Route a signal","route"],["Type a command","type"],["Shape the signal field","field"]].map(([label,id]) => ({label,id,group:"Signal studio",icon:Gamepad2})),
  {label:"Copy email address",id:"copy",group:"Contact",icon:Copy},
  {label:"Open GitHub profile",id:"github",group:"Profile",icon:Github},
  {label:"View résumé",id:"resume",group:"Profile",icon:Download},
];

export default function CommandPalette() {
  const dialog = useRef<HTMLDialogElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const [query,setQuery] = useState("");
  const [active,setActive] = useState(0);
  const [status,setStatus] = useState("");
  const results = commands.filter(x => (x.label + " " + x.group).toLowerCase().includes(query.trim().toLowerCase()));
  useEffect(() => {
    const open = () => {
      if (!dialog.current?.open) { setQuery(""); setActive(0); dialog.current?.showModal(); search.current?.focus(); }
    };
    const keys = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (dialog.current?.open) dialog.current.close(); else open();
      }
    };
    window.addEventListener("open-command",open); window.addEventListener("keydown",keys);
    return () => { window.removeEventListener("open-command",open); window.removeEventListener("keydown",keys); };
  }, []);
  useEffect(() => {
    if (!status) return;
    const timeout = window.setTimeout(() => setStatus(""),4000);
    return () => window.clearTimeout(timeout);
  },[status]);
  function run(command: typeof commands[number]) {
    dialog.current?.close();
    if (command.id === "copy") {
      copyEmail().then(() => setStatus("Email copied to clipboard.")).catch(() => setStatus(profile.email)); return;
    }
    if (command.id === "github") { window.open(profile.github,"_blank","noopener,noreferrer"); return; }
    if (command.id === "resume") { location.assign(profile.resume); return; }
    if (command.group === "Signal studio") {
      if(location.pathname!=="/"){location.assign("/?studio="+command.id);return;} window.dispatchEvent(new CustomEvent("launch-game",{detail:command.id})); return;
    }
    location.hash=command.id;
    document.getElementById(command.id)?.scrollIntoView();
  }
  return <><dialog ref={dialog} className="palette" aria-label="Command palette" onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
    <div className="palette-inner"><div className="palette-search"><Search size={20}/><input ref={search} placeholder="Search commands or sections…" aria-label="Search commands" role="combobox" aria-autocomplete="list" aria-expanded aria-controls="command-results" aria-activedescendant={results.length ? `cmd-${results[active]?.id}` : undefined} value={query} onChange={e => { setQuery(e.target.value); setActive(0); }} onKeyDown={e => {
      if (!results.length) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault(); const next = (active + (e.key === "ArrowDown" ? 1 : -1) + results.length) % results.length;
        setActive(next); document.getElementById(`cmd-${results[next].id}`)?.scrollIntoView({block:"nearest"});
      } else if (e.key === "Enter") { e.preventDefault(); run(results[active]); }
    }}/><button aria-label="Close palette" onClick={() => dialog.current?.close()}><X size={18}/></button></div>
    <div className="command-list" role="listbox" aria-label="Matching commands" id="command-results">{results.map((item,i) => <button role="option" tabIndex={-1} aria-selected={active === i} id={`cmd-${item.id}`} key={item.id} onMouseEnter={() => setActive(i)} onClick={() => run(item)}><item.icon size={16}/>{item.label}<small>{item.group}</small></button>)}{!results.length && <p>No matching commands.</p>}</div>
    <div className="palette-foot"><span><Command size={13}/>Command palette</span><span><CornerDownLeft size={13}/>Select</span></div></div>
  </dialog><div role="status" className={status ? "toast" : "sr-only"}>{status}</div></>;
}
