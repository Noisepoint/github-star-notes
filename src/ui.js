(function () {
  const NOTE_ROOT_CLASS = "ghsn-note";
  const NOTE_MOUNTED_ATTR = "data-ghsn-mounted";

  function createButton(label, variant) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `ghsn-button ${variant ? `ghsn-button-${variant}` : ""}`.trim();
    button.textContent = label;
    return button;
  }

  function createToolbar() {
    const toolbar = document.createElement("div");
    toolbar.className = "ghsn-toolbar";

    const exportButton = createButton("导出全部备注", "secondary");
    const importButton = createButton("导入全部备注", "secondary");
    const status = document.createElement("span");
    status.className = "ghsn-toolbar-status";
    let exportDataCache = null;

    async function refreshExportDataCache() {
      exportButton.disabled = true;
      exportButton.textContent = "准备导出";
      exportDataCache = await window.GitHubStarNotesStorage.getData();
      exportButton.disabled = false;
      exportButton.textContent = "导出全部备注";
    }

    refreshExportDataCache();

    document.addEventListener("ghsn:notes-updated", refreshExportDataCache);

    exportButton.addEventListener("click", () => {
      if (!exportDataCache) {
        showInlineStatus(status, "数据准备中，请稍后再试");
        refreshExportDataCache();
        return;
      }

      window.GitHubStarNotesImportExport.exportNotesData(exportDataCache);
      showInlineStatus(status, "已请求下载备份");
    });

    importButton.addEventListener("click", async () => {
      try {
        const result = await window.GitHubStarNotesImportExport.importNotes();
        showInlineStatus(status, `已导入 ${result.importedCount} 条`);
        document.dispatchEvent(new CustomEvent("ghsn:notes-updated"));
        await refreshExportDataCache();
      } catch (error) {
        if (error.message !== "No file selected") {
          showInlineStatus(status, "导入失败");
        }
      }
    });

    toolbar.append(exportButton, importButton, status);
    return toolbar;
  }

  function mountToolbar() {
    if (document.querySelector(".ghsn-toolbar")) {
      return;
    }

    const pageType = window.GitHubStarNotesPage.getCurrentPageType();
    let target = null;

    if (pageType === "stars") {
      target = document.querySelector('[data-testid="stars-search-bar"]') || document.querySelector('input[name="q"]')?.closest("form")?.parentElement;
    }

    if (!target) {
      return;
    }

    target.insertAdjacentElement("afterend", createToolbar());
  }

  function showInlineStatus(target, message) {
    target.textContent = message;
    window.clearTimeout(target._ghsnStatusTimer);
    target._ghsnStatusTimer = window.setTimeout(() => {
      target.textContent = "";
    }, 1800);
  }

  function createNoteRoot(repoKey, variant) {
    const root = document.createElement("section");
    root.className = `${NOTE_ROOT_CLASS} ghsn-note-${variant}`;
    root.dataset.repoKey = repoKey;
    root.dataset.variant = variant;
    return root;
  }

  async function renderNote(root) {
    const repoKey = root.dataset.repoKey;
    const record = await window.GitHubStarNotesStorage.getRepoNote(repoKey);
    root.innerHTML = "";

    if (record?.note) {
      renderReadMode(root, record.note);
    } else {
      renderEmptyMode(root);
    }
  }

  function renderEmptyMode(root) {
    const action = createButton("添加备注", "link");
    action.addEventListener("click", () => renderEditMode(root, ""));

    const inner = document.createElement("div");
    inner.className = "ghsn-empty";
    inner.append(action);
    root.append(inner);
  }

  function renderReadMode(root, note) {
    const label = document.createElement("span");
    label.className = "ghsn-label";
    label.textContent = root.dataset.variant === "repo" ? "GitHub Star Note" : "我的备注";

    const text = document.createElement("p");
    text.className = "ghsn-text";
    text.textContent = note;

    const editButton = createButton("编辑", "link");
    editButton.addEventListener("click", () => renderEditMode(root, note));

    const content = document.createElement("div");
    content.className = "ghsn-content";
    content.append(label, text);

    const actions = document.createElement("div");
    actions.className = "ghsn-actions";
    actions.append(editButton);

    root.append(content, actions);
  }

  function renderEditMode(root, initialNote) {
    root.innerHTML = "";

    const textarea = document.createElement("textarea");
    textarea.className = "ghsn-textarea";
    textarea.maxLength = window.GitHubStarNotesStorage.MAX_NOTE_LENGTH;
    textarea.rows = root.dataset.variant === "repo" ? 4 : 3;
    textarea.value = initialNote;
    textarea.placeholder = "写下这个 repo 是做什么的、适合什么场景、为什么值得收藏...";

    const counter = document.createElement("span");
    counter.className = "ghsn-counter";

    const error = document.createElement("span");
    error.className = "ghsn-error";

    const saveButton = createButton("保存", "primary");
    const cancelButton = createButton("取消", "secondary");
    const deleteButton = createButton("删除", "danger");

    const updateCounter = () => {
      counter.textContent = `${textarea.value.length} / ${window.GitHubStarNotesStorage.MAX_NOTE_LENGTH}`;
      error.textContent = textarea.value.length > window.GitHubStarNotesStorage.MAX_NOTE_LENGTH ? "备注最多 500 个字符" : "";
    };

    textarea.addEventListener("input", updateCounter);
    updateCounter();

    saveButton.addEventListener("click", async () => {
      if (textarea.value.length > window.GitHubStarNotesStorage.MAX_NOTE_LENGTH) {
        error.textContent = "备注最多 500 个字符";
        return;
      }

      await window.GitHubStarNotesStorage.saveRepoNote(root.dataset.repoKey, textarea.value);
      document.dispatchEvent(new CustomEvent("ghsn:notes-updated", { detail: { repoKey: root.dataset.repoKey } }));
      await renderNote(root);
      root.classList.add("ghsn-note-saved");
      window.setTimeout(() => root.classList.remove("ghsn-note-saved"), 800);
    });

    cancelButton.addEventListener("click", () => renderNote(root));

    deleteButton.addEventListener("click", async () => {
      await window.GitHubStarNotesStorage.saveRepoNote(root.dataset.repoKey, "");
      document.dispatchEvent(new CustomEvent("ghsn:notes-updated", { detail: { repoKey: root.dataset.repoKey } }));
      await renderNote(root);
    });

    const meta = document.createElement("div");
    meta.className = "ghsn-edit-meta";
    meta.append(counter, error);

    const actions = document.createElement("div");
    actions.className = "ghsn-edit-actions";
    actions.append(saveButton, cancelButton, deleteButton);

    root.append(textarea, meta, actions);
    textarea.focus();
  }

  function mountStarsNote(item) {
    if (!item?.item || !item.anchor) {
      return;
    }

    const existingNotes = Array.from(item.item.querySelectorAll(`[${NOTE_MOUNTED_ATTR}="${item.repoKey}"]`));
    const visibleExistingNote = existingNotes.find((note) => {
      return window.GitHubStarNotesPage.isVisibleElement(note) && !window.GitHubStarNotesPage.isInsideIgnoredStarsArea(note);
    });

    if (visibleExistingNote) {
      return;
    }

    existingNotes.forEach((note) => note.remove());

    const root = createNoteRoot(item.repoKey, "stars");
    root.setAttribute(NOTE_MOUNTED_ATTR, item.repoKey);
    item.anchor.insertAdjacentElement("afterend", root);
    renderNote(root);
  }

  function mountRepoNote(target) {
    if (!target?.item || !target.anchor) {
      return;
    }

    const existingRepoNotes = Array.from(document.querySelectorAll(`[${NOTE_MOUNTED_ATTR}="${target.repoKey}"][data-variant="repo"]`));
    const currentRepoNote = existingRepoNotes.find((note) => target.item.contains(note));

    existingRepoNotes.forEach((note) => {
      if (note !== currentRepoNote) {
        note.remove();
      }
    });

    if (currentRepoNote) {
      return;
    }

    const root = createNoteRoot(target.repoKey, "repo");
    root.setAttribute(NOTE_MOUNTED_ATTR, target.repoKey);
    target.anchor.insertAdjacentElement("afterend", root);
    renderNote(root);
  }

  function cleanupForPageType(pageType) {
    const currentRepoKey = pageType === "repo" ? window.GitHubStarNotesPage.getRepoKeyFromUrl(window.location.href) : null;

    if (pageType !== "stars") {
      document.querySelectorAll(".ghsn-toolbar").forEach((toolbar) => toolbar.remove());
    }

    Array.from(document.querySelectorAll(`[${NOTE_MOUNTED_ATTR}]`)).forEach((note) => {
      const variant = note.dataset.variant;
      const repoKey = note.dataset.repoKey;

      if (pageType === "stars" && variant !== "stars") {
        note.remove();
        return;
      }

      if (pageType === "repo" && (variant !== "repo" || repoKey !== currentRepoKey)) {
        note.remove();
        return;
      }

      if (pageType === "unsupported") {
        note.remove();
      }
    });
  }

  async function refreshMountedNotes(repoKey) {
    const selector = repoKey ? `[${NOTE_MOUNTED_ATTR}="${repoKey}"]` : `[${NOTE_MOUNTED_ATTR}]`;
    const roots = Array.from(document.querySelectorAll(selector));
    await Promise.all(roots.map((root) => renderNote(root)));
  }

  window.GitHubStarNotesUI = {
    mountToolbar,
    mountStarsNote,
    mountRepoNote,
    cleanupForPageType,
    refreshMountedNotes
  };
})();
