import { useRevalidator } from "react-router";
import { useEffect } from "react";

export function useRevalidateOnFocus() {
  const { revalidate, state } = useRevalidator();

  useEffect(
    function revalidateOnFocus() {
      function onFocus() {
        revalidate();
      }
      window.addEventListener("focus", onFocus);
      return () => window.removeEventListener("focus", onFocus);
    },
    [revalidate],
  );

  useEffect(
    function revalidateOnVisibilityChange() {
      function onVisibilityChange() {
        // Only revalidate when coming back
        if (!document.hidden) return;
        revalidate();
      }
      window.addEventListener("visibilitychange", onVisibilityChange);
      return () =>
        window.removeEventListener("visibilitychange", onVisibilityChange);
    },
    [revalidate],
  );

  return { revalidate, state };
}
