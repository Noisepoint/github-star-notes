(function () {
  let renderTimer = null;
  let observer = null;
  let lastUrl = window.location.href;
  let lastBody = null;
  const renderDelay = 250;

  function render() {
    if (!document.body || !window.GitHubStarNotesPage || !window.GitHubStarNotesUI) {
      return;
    }

    const pageType = window.GitHubStarNotesPage.getCurrentPageType();

    window.GitHubStarNotesUI.mountToolbar();

    if (pageType === "stars") {
      window.GitHubStarNotesPage.findStarsRepoItems().forEach((item) => {
        window.GitHubStarNotesUI.mountStarsNote(item);
      });
    }

    if (pageType === "repo") {
      window.GitHubStarNotesUI.mountRepoNote(window.GitHubStarNotesPage.findRepoPageTarget());
    }
  }

  function scheduleRender(delay = renderDelay) {
    window.clearTimeout(renderTimer);
    renderTimer = window.setTimeout(render, delay);
  }

  function getVisibleNoteCount() {
    return Array.from(document.querySelectorAll(".ghsn-note")).filter((note) => {
      return window.GitHubStarNotesPage.isVisibleElement(note) && !window.GitHubStarNotesPage.isInsideIgnoredStarsArea(note.parentElement);
    }).length;
  }

  function checkRenderHealth() {
    if (document.body !== lastBody) {
      startObserver();
      scheduleRender();
      return;
    }

    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      scheduleRender();
      return;
    }

    if (window.GitHubStarNotesPage.getCurrentPageType() !== "stars") {
      return;
    }

    const repoItems = window.GitHubStarNotesPage.findStarsRepoItems();
    const visibleNoteCount = getVisibleNoteCount();
    if (repoItems.length > 0 && visibleNoteCount < repoItems.length) {
      scheduleRender();
    }
  }

  function isPluginNode(node) {
    return node.nodeType === Node.ELEMENT_NODE && Boolean(node.closest?.(".ghsn-note, .ghsn-toolbar") || node.matches?.(".ghsn-note, .ghsn-toolbar"));
  }

  function isMeaningfulPageNode(node) {
    if (node.nodeType !== Node.ELEMENT_NODE || isPluginNode(node)) {
      return false;
    }

    return Boolean(
      node.matches?.("main, turbo-frame, [data-turbo-body], [data-testid='stars-search-bar'], .Box-row, .col-12, li") ||
        node.querySelector?.("main, turbo-frame, [data-turbo-body], [data-testid='stars-search-bar'], .Box-row, .col-12, li, a[href^='/']")
    );
  }

  function startObserver() {
    if (observer) {
      observer.disconnect();
    }

    if (!document.body) {
      return;
    }

    lastBody = document.body;
    observer = new MutationObserver((mutations) => {
      const shouldRender = mutations.some((mutation) => {
        return Array.from(mutation.addedNodes).some(isMeaningfulPageNode);
      });

      if (shouldRender) {
        scheduleRender();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function init() {
    render();
    startObserver();

    document.addEventListener("ghsn:notes-updated", (event) => {
      window.GitHubStarNotesUI.refreshMountedNotes(event.detail?.repoKey);
    });

    window.addEventListener("popstate", () => scheduleRender());
    document.addEventListener("turbo:load", () => scheduleRender());
    document.addEventListener("turbo:render", () => scheduleRender());
    document.addEventListener("turbo:frame-load", () => scheduleRender());
    document.addEventListener("turbo:before-render", () => {
      window.setTimeout(startObserver, 0);
    });
    window.setInterval(checkRenderHealth, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
