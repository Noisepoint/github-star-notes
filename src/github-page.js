(function () {
  const IGNORED_REPO_OWNER_PATHS = new Set([
    "about",
    "account",
    "apps",
    "blog",
    "business",
    "codespaces",
    "collections",
    "contact",
    "customer-stories",
    "dashboard",
    "enterprise",
    "events",
    "explore",
    "features",
    "gist",
    "github",
    "issues",
    "login",
    "marketplace",
    "new",
    "notifications",
    "organizations",
    "pricing",
    "pulls",
    "search",
    "settings",
    "sponsors",
    "stars",
    "topics",
    "trending"
  ]);

  function isValidRepoKey(repoKey) {
    return /^[^/\s]+\/[^/\s]+$/.test(repoKey || "");
  }

  function normalizePathPart(value) {
    return decodeURIComponent(value || "").trim();
  }

  function getRepoKeyFromUrl(url) {
    try {
      const parsedUrl = new URL(url, window.location.origin);
      const [owner, repo] = parsedUrl.pathname
        .split("/")
        .filter(Boolean)
        .map(normalizePathPart);

      if (!owner || !repo || IGNORED_REPO_OWNER_PATHS.has(owner.toLowerCase())) {
        return null;
      }

      const repoKey = `${owner}/${repo}`;
      return isValidRepoKey(repoKey) ? repoKey : null;
    } catch {
      return null;
    }
  }

  function getCurrentPageType() {
    const params = new URLSearchParams(window.location.search);
    const pathParts = window.location.pathname.split("/").filter(Boolean);

    if (pathParts.length === 1 && params.get("tab") === "stars") {
      return "stars";
    }

    if (pathParts.length >= 2 && getRepoKeyFromUrl(window.location.href)) {
      return "repo";
    }

    return "unsupported";
  }

  function findStarsRepoItems() {
    if (getCurrentPageType() !== "stars") {
      return [];
    }

    const seenRepoKeys = new Set();
    const candidates = [];

    Array.from(document.querySelectorAll('main a[href^="/"]')).forEach((link) => {
      const repoKey = getRepoKeyFromUrl(link.href);
      if (!repoKey || seenRepoKeys.has(repoKey) || !isVisibleElement(link) || isInsideIgnoredStarsArea(link)) {
        return;
      }

      const item = findStarsRepoContainer(link);
      if (!item || !isLikelyStarsRepoItem(item, link, repoKey)) {
        return;
      }

      seenRepoKeys.add(repoKey);
      candidates.push({
        repoKey,
        item,
        anchor: findStarsInsertAnchor(item, link)
      });
    });

    return candidates;
  }

  function isLikelyStarsRepoItem(item, link, repoKey) {
    if (!isVisibleElement(item) || isInsideIgnoredStarsArea(item)) {
      return false;
    }

    const href = new URL(link.href).pathname;
    const [owner, repo] = repoKey.split("/");
    const itemText = item.textContent.replace(/\s+/g, " ").trim();
    const hasRepoName = itemText.includes(repo);
    const hasOwnerName = itemText.includes(owner);
    const isExactRepoHref = href === `/${owner}/${repo}`;

    return isExactRepoHref && (hasRepoName || hasOwnerName);
  }

  function findStarsRepoContainer(link) {
    const candidates = [
      link.closest(".col-12.d-block.width-full.border-bottom"),
      link.closest(".col-12.width-full.border-bottom"),
      link.closest("[data-view-component='true'].Box-row"),
      link.closest(".Box-row"),
      link.closest("li.border-bottom"),
      link.closest("li"),
      link.closest("div[data-hpc]")
    ].filter((candidate) => candidate && isVisibleElement(candidate) && !isInsideIgnoredStarsArea(candidate));

    if (candidates.length > 0) {
      return candidates[0];
    }

    let current = link.parentElement;
    for (let depth = 0; current && depth < 6; depth += 1) {
      const hasStarButton = Boolean(current.querySelector('form[action*="/star"], form[action*="/unstar"], button[aria-label*="Star"], button[aria-label*="Unstar"]'));
      const hasDescription = Boolean(current.querySelector("p"));

      if (hasStarButton || hasDescription) {
        return current;
      }

      current = current.parentElement;
    }

    return null;
  }

  function isVisibleElement(element) {
    if (!element || !element.isConnected) {
      return false;
    }

    if (element.hidden || element.getAttribute("aria-hidden") === "true") {
      return false;
    }

    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return false;
    }

    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
  }

  function isInsideIgnoredStarsArea(element) {
    return Boolean(
      element.closest(
        [
          "nav",
          "header",
          "footer",
          "aside",
          "details-menu",
          "dialog",
          "[role='dialog']",
          "[popover]",
          ".UnderlineNav",
          ".js-user-list-form",
          ".js-user-list-menu",
          ".blankslate",
          ".SelectMenu",
          ".Overlay",
          ".ghsn-note",
          ".ghsn-toolbar"
        ].join(", ")
      )
    );
  }

  function findStarsInsertAnchor(item, link) {
    const description = Array.from(item.querySelectorAll("p")).find((paragraph) => {
      return isVisibleElement(paragraph) && !isInsideIgnoredStarsArea(paragraph);
    });

    if (description) {
      return description;
    }

    const header = link.closest("h3") || link.closest(".d-inline-block") || link.closest("div");
    return header || item;
  }

  function findRepoPageTarget() {
    if (getCurrentPageType() !== "repo") {
      return null;
    }

    const repoKey = getRepoKeyFromUrl(window.location.href);
    if (!repoKey) {
      return null;
    }

    const aboutSection = document.querySelector('div.BorderGrid-cell h2, div.BorderGrid-cell h3')?.closest(".BorderGrid-cell");
    const repoHeader = document.querySelector('[data-testid="repository-container-header"]') || document.querySelector("#repository-container-header");
    const fallback = document.querySelector("main");

    return {
      repoKey,
      item: aboutSection || repoHeader || fallback,
      anchor: aboutSection?.querySelector("h2, h3") || repoHeader || fallback
    };
  }

  window.GitHubStarNotesPage = {
    getCurrentPageType,
    getRepoKeyFromUrl,
    findStarsRepoItems,
    findStarsRepoContainer,
    findRepoPageTarget,
    isVisibleElement,
    isInsideIgnoredStarsArea,
    isValidRepoKey
  };
})();
