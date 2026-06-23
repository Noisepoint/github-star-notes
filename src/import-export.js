(function () {
  function downloadTextFile(filename, content) {
    const blob = new Blob([content], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.click();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportNotesData(data) {
    const content = JSON.stringify(data, null, 2);
    downloadTextFile("github-star-notes-backup.json", content);
    return data;
  }

  async function exportNotes() {
    const data = await window.GitHubStarNotesStorage.getData();
    return exportNotesData(data);
  }

  function pickJsonFile() {
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/json,.json";

      input.addEventListener("change", () => {
        const file = input.files?.[0];
        if (!file) {
          reject(new Error("No file selected"));
          return;
        }

        resolve(file);
      });

      input.click();
    });
  }

  function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("File read failed"));
      reader.readAsText(file);
    });
  }

  async function importNotes() {
    const file = await pickJsonFile();
    const text = await readFileAsText(file);
    const parsedData = JSON.parse(text);
    return window.GitHubStarNotesStorage.mergeImportedData(parsedData);
  }

  window.GitHubStarNotesImportExport = {
    exportNotesData,
    exportNotes,
    importNotes
  };
})();
