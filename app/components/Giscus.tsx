"use client";
import { useEffect } from "react";

type GiscusProps = {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  mapping?: string;
};

export default function Giscus({ repo, repoId, category, categoryId, mapping = "pathname" }: GiscusProps) {
  
  useEffect(() => {
  if (!repo || !repoId || !category || !categoryId) return;
  const container = document.getElementById("giscus-container");
  if (!container) return;

  // 清除之前的 giscus
  container.innerHTML = "";

  const script = document.createElement("script");
  script.src = "https://giscus.app/client.js";
  script.async = true;
  script.crossOrigin = "anonymous";
  script.setAttribute("data-repo", repo);
  script.setAttribute("data-repo-id", repoId);
  script.setAttribute("data-category", category);
  script.setAttribute("data-category-id", categoryId);
  script.setAttribute("data-mapping", mapping);
  script.setAttribute("data-reactions-enabled", "1");
  script.setAttribute("data-emit-metadata", "0");
  script.setAttribute("data-input-position", "top");
  script.setAttribute("data-theme", 'dark');
  script.setAttribute("data-lang", "zh-CN");
  script.setAttribute("data-loading", "lazy");
  script.setAttribute("data-strict", "0");

  container.appendChild(script);

  return () => {
    container.innerHTML = "";
  };
}, [repo, repoId, category, categoryId, mapping]);

  return <div id="giscus-container" className="mt-10 rounded-xl overflow-hidden" />;
}
