(function () {
  let renderTimer = null;
  let observer = null;
  let lastUrl = window.location.href;

  function render() {
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

  function scheduleRender() {
    window.clearTimeout(renderTimer);
    renderTimer = window.setTimeout(render, 120);
  }

  function getVisibleNoteCount() {
    return Array.from(document.querySelectorAll(".ghsn-note")).filter((note) => {
      return window.GitHubStarNotesPage.isVisibleElement(note) && !window.GitHubStarNotesPage.isInsideIgnoredStarsArea(note);
    }).length;
  }

  function checkRenderHealth() {
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
    if (repoItems.length > 0 && getVisibleNoteCount() < repoItems.length) {
      scheduleRender();
    }
  }

  function startObserver() {
    if (observer) {
      observer.disconnect();
    }

    observer = new MutationObserver((mutations) => {
      const shouldRender = mutations.some((mutation) => {
        return Array.from(mutation.addedNodes).some((node) => {
          return node.nodeType === Node.ELEMENT_NODE && !node.closest?.(".ghsn-note, .ghsn-toolbar");
        });
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

    window.addEventListener("popstate", scheduleRender);
    document.addEventListener("turbo:load", scheduleRender);
    document.addEventListener("turbo:render", scheduleRender);
    document.addEventListener("turbo:frame-load", scheduleRender);
    window.setInterval(checkRenderHealth, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
