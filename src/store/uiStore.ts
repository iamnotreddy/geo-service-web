export type UIMode =
  | { type: "viewing" }
  | { type: "adding-marker" }
  | { type: "editing-marker"; markerId: string }
  | { type: "editing-metadata"; markerId: string };

// uiStore.ts
import { proxy } from "valtio";

class UIStore {
  currentMode: UIMode = { type: "viewing" };
  sidebarOpen: boolean = false;

  // UI Methods
  toggleAddMode() {
    if (this.currentMode.type === "adding-marker") {
      this.currentMode = { type: "viewing" };
      this.sidebarOpen = false;
    } else {
      this.currentMode = { type: "adding-marker" };
      this.sidebarOpen = true;
    }
  }
}

export const uiStore = proxy(new UIStore());
