"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Repo = {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  topics: string[];
  pushed_at: string;
  fork: boolean;
};

type Profile = {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number;
};

type Activity = { date: string; count: number };
type GitHubData = {
  profile: Profile;
  repos: Repo[];
  totalStars: number | null;
  languages: { name: string; count: number; color: string }[];
  activity: Activity[];
  activityAvailable: boolean;
  source: "live" | "snapshot" | "resume";
};

const api = "https://api.github.com/users/kailash-18";
const profileUrl = "https://github.com/Kailash-18";
const snapshotProfile: Profile = {
  login: "Kailash-18",
  name: "Kailash",
  bio: null,
  public_repos: 6,
  html_url: profileUrl,
  avatar_url: "https://avatars.githubusercontent.com/u/201485712?v=4",
};

// Public REST snapshot, 21 November 2026. Retain real values if the API is unavailable.
function snapshotRepo(name: string, language: string | null, pushed_at: string, overrides: Partial<Repo> = {}): Repo {
  return { name, language, pushed_at, description: null, html_url: profileUrl + "/" + name, homepage: null, stargazers_count: 0, topics: [], fork: false, ...overrides };
}

const snapshotRepos = [
  snapshotRepo("PolyGen", "JavaScript", "2026-11-19T11:50:17Z"),
  snapshotRepo("OmniSight", "Python", "2026-11-13T11:18:05Z", { description: "Autonomous Multimodal UI Self-Healing & Visual QA Agent" }),
  snapshotRepo("AWS_Three_Tyre", "HCL", "2026-11-09T20:02:32Z", { stargazers_count: 1 }),
  snapshotRepo("Kailash-18", null, "2026-11-06T19:41:54Z"),
  snapshotRepo("life-after-code", "Python", "2026-10-27T06:14:46Z", { fork: true }),
  snapshotRepo("hacks", "Python", "2026-10-12T05:12:53Z", { fork: true, homepage: "https://hacks-topaz.vercel.app" }),
];

const colors: Record<string, string> = { Python: "#56a6de", JavaScript: "#efd66f", HCL: "#a18ad9", TypeScript: "#6498f4", Shell: "#7ddda2", CSS: "#c697d5" };
function languageBreakdown(repos: Repo[]) {
  const counts = new Map<string, number>();
  repos.forEach(({ language }) => {
    if (language) counts.set(language, (counts.get(language) ?? 0) + 1);
  });
  return Array.from(counts, ([name, count]) => ({ name, count, color: colors[name] ?? "#60bdad" })).sort((a, b) => b.count - a.count);
}

const snapshot: GitHubData = {
  profile: snapshotProfile,
  repos: snapshotRepos,
  languages: languageBreakdown(snapshotRepos),
  totalStars: 1,
  activity: activitySeries(new Map([
    ["2026-11-15", 2], ["2026-11-13", 37], ["2026-11-12", 1], ["2026-11-11", 3],
    ["2026-11-10", 15], ["2026-11-09", 7], ["2026-11-07", 8], ["2026-11-06", 11],
    ["2026-11-05", 1], ["2026-11-01", 3], ["2026-10-29", 5], ["2026-10-28", 1],
    ["2026-10-27", 2], ["2026-10-24", 3], ["2026-10-13", 1],
  ]), new Date("2026-11-21T00:00:00Z")),
  activityAvailable: true,
  source: "snapshot",
};

async function request<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(api + path, { signal, headers: { Accept: "application/vnd.github+json" } });
  if (!response.ok) throw new Error("GitHub is unavailable");
  return response.json();
}

function recentActivity(events: { created_at: string }[]): Activity[] {
  const counts = new Map<string, number>();
  events.forEach(({ created_at }) => {
    const date = created_at.slice(0, 10);
    counts.set(date, (counts.get(date) ?? 0) + 1);
  });
  return activitySeries(counts, new Date());
}

function activitySeries(counts: Map<string, number>, today: Date): Activity[] {
  return Array.from({ length: 84 }, (_, i) => {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - 83 + i);
    const key = date.toISOString().slice(0, 10);
    return { date: key, count: counts.get(key) ?? 0 };
  });
}

const GitHubContext = createContext<GitHubData>(snapshot);
export const useGitHub = () => useContext(GitHubContext);

export function GitHubProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(snapshot);
  useEffect(() => {
    async function refresh() {
      const controller = new AbortController();
      const signal = controller.signal;
      const timeout = window.setTimeout(() => controller.abort(), 12000);
      try {
      const [profile, repos] = await Promise.all([
        request<Profile>("", signal),
        request<Repo[]>("/repos?sort=updated&per_page=10", signal),
      ]);
      let allRepos = repos;
      if (profile.public_repos > repos.length) {
        allRepos = [];
        for (let page = 1; allRepos.length < profile.public_repos; page++) {
          const batch = await request<Repo[]>("/repos?sort=updated&per_page=100&page=" + page, signal);
          allRepos.push(...batch);
          if (batch.length < 100) break;
        }
      }
      if (signal.aborted) return;
      setData(previous => ({
        ...previous, profile, repos, source: "live", activity: [], activityAvailable: false, languages: languageBreakdown(allRepos),
        totalStars: allRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
      }));
      const events = await request<{ created_at: string }[]>("/events/public?per_page=100", signal);
      if (!signal.aborted) setData(previous => ({ ...previous, activity: recentActivity(events), activityAvailable: true }));
      } catch {
        // Keep the most recent successful data when GitHub rate limits or is unreachable.
      } finally {
        window.clearTimeout(timeout);
      }
    }
    void refresh();
    const interval = window.setInterval(() => { void refresh(); }, 5 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);
  return <GitHubContext.Provider value={data}>{children}</GitHubContext.Provider>;
}
