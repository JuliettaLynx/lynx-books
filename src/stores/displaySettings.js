import { defineStore } from "pinia";

export const useDisplaySettingsStore = defineStore("displaySettings", {
  state: () => ({
    // 'grid' — карточки сеткой, 'list' — строкой (список)
    displayMode: "grid",
  }),
  actions: {
    toggleDisplayMode() {
      this.displayMode = this.displayMode === "grid" ? "list" : "grid";
      this.saveToLocalStorage();
    },
    setDisplayMode(mode) {
      if (mode === "grid" || mode === "list") {
        this.displayMode = mode;
        this.saveToLocalStorage();
      }
    },
    loadFromLocalStorage() {
      const saved = localStorage.getItem("displayMode");
      if (saved === "grid" || saved === "list") {
        this.displayMode = saved;
      }
    },
    saveToLocalStorage() {
      localStorage.setItem("displayMode", this.displayMode);
    },
  },
});
