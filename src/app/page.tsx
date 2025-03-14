"use client";

import { useSnapshot } from "valtio";
import MapComponent from "../components/Map";
import { NavBar } from "@/components/NavBar";
import { uiStore } from "@/store/uiStore";
import { AddLocation } from "@/components/AddLocation";
import { AddModeDisplay } from "@/components/AddModeDisplay";

export default function Home() {
  const { currentMode } = useSnapshot(uiStore);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <div className="absolute inset-0">
        <MapComponent />
      </div>
      <div className="absolute top-2 left-0 right-0 pointer-events-none">
        <div className="pointer-events-auto">
          <NavBar />
        </div>
      </div>
      {currentMode.type === "adding-marker" && (
        <div className="absolute top-12 left-0 right-0 pointer-events-none">
          <div className="pointer-events-auto">
            <AddModeDisplay />
          </div>
        </div>
      )}
      {currentMode.type === "adding-marker" && (
        <div className="absolute left-10 top-2">
          <AddLocation />
        </div>
      )}
    </div>
  );
}
