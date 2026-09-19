"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

export type Density = "comfortable" | "dense";

const DENSITY_KEY = "tb.density";
const NAV_KEY = "tb.navCollapsed";

type Prefs = { density: Density; navCollapsed: boolean };

const SERVER_PREFS: Prefs = { density: "comfortable", navCollapsed: false };


const listeners = new Set<() => void>();
let cache: Prefs | null = null;

function read(): Prefs {
  if (typeof window === "undefined") {
    return SERVER_PREFS;
  }
  if (cache) return cache;
  const density =
    window.localStorage.getItem(DENSITY_KEY) === "dense" ? "dense" : "comfortable";
  const navCollapsed = window.localStorage.getItem(NAV_KEY) === "1";
  cache = { density, navCollapsed };
  return cache;
}

function write(partial: Partial<Prefs>) {
  const next = { ...read(), ...partial };
  cache = next;
  window.localStorage.setItem(DENSITY_KEY, next.density);
  window.localStorage.setItem(NAV_KEY, next.navCollapsed ? "1" : "0");
  document.documentElement.dataset.density = next.density;
  document.documentElement.dataset.nav = next.navCollapsed ? "collapsed" : "expanded";
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Apply density/nav attrs ASAP (call from client layout / shell). */
export function hydratePrefsDom() {
  if (typeof window === "undefined") return;
  const p = read();
  document.documentElement.dataset.density = p.density;
  document.documentElement.dataset.nav = p.navCollapsed ? "collapsed" : "expanded";
}

export function usePrefs() {
  // getServerSnapshot MUST return a cached reference (React 19 infinite-loop guard).
  const prefs = useSyncExternalStore(subscribe, read, () => SERVER_PREFS);

  useEffect(() => {
    hydratePrefsDom();
  }, []);

  const setDensity = useCallback((density: Density) => write({ density }), []);
  const setNavCollapsed = useCallback(
    (navCollapsed: boolean) => write({ navCollapsed }),
    [],
  );
  const toggleNav = useCallback(() => write({ navCollapsed: !read().navCollapsed }), []);
  const toggleDensity = useCallback(
    () => write({ density: read().density === "dense" ? "comfortable" : "dense" }),
    [],
  );

  return { ...prefs, setDensity, setNavCollapsed, toggleNav, toggleDensity };
}

/** Reduced-motion preference. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}
