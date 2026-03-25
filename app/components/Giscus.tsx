"use client";
import { useEffect } from "react";

type GiscusProps = {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  mapping?: string;
};

// 获取当前主题
const getTheme = (): "light" | "dark" => {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
};

// 创建并加载 Giscus 脚本
const loadGiscus = (container: HTMLElement, repo: string, repoId: string, category: string, categoryId: string, mapping: string, theme: "light" | "dark") => {
  // 清除之前的内容
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
  script.setAttribute("data-theme", theme);
  script.setAttribute("data-lang", "zh-CN");
  script.setAttribute("data-loading", "lazy");
  script.setAttribute("data-strict", "0");

  container.appendChild(script);
};

export default function Giscus({ repo, repoId, category, categoryId, mapping = "pathname" }: GiscusProps) {
  
  useEffect(() => {
    if (!repo || !repoId || !category || !categoryId) return;
    const container = document.getElementById("giscus-container");
    if (!container) return;

    // 初始化加载 Giscus
    const currentTheme = getTheme();
    loadGiscus(container, repo, repoId, category, categoryId, mapping, currentTheme);

    // 监听主题变化
    const handleThemeChange = () => {
      const newTheme = getTheme();
      loadGiscus(container, repo, repoId, category, categoryId, mapping, newTheme);
    };

    // 创建 MutationObserver 监听 html 元素的 class 变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          handleThemeChange();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });

    return () => {
      observer.disconnect();
      container.innerHTML = "";
    };
  }, [repo, repoId, category, categoryId, mapping]);

  return <div id="giscus-container" className="mt-10 rounded-xl overflow-hidden" />;
}
