import { uiStore } from "@/store/uiStore";
import {
  Cube,
  Heart,
  Horse,
  MapPin,
  MapPinArea,
} from "@phosphor-icons/react/dist/ssr";
import { useSnapshot } from "valtio";

export const NavBar = () => {
  const { currentMode } = useSnapshot(uiStore);

  const navItems = [
    {
      icon: MapPin,
      label: "MapPin",
      onClick: () => uiStore.toggleAddMode(),
      customClass:
        currentMode.type === "adding-marker"
          ? "text-pink-600 font-bold"
          : "text-black",
    },
    {
      icon: MapPinArea,
      label: "MapPinArea",
      onClick: () => {},
      customClass: "",
    },
    { icon: Horse, label: "Horse", onClick: () => {}, customClass: "" },
    { icon: Heart, label: "Heart", onClick: () => {}, customClass: "" },
    { icon: Cube, label: "Cube", onClick: () => {}, customClass: "" },
  ];

  return (
    <nav className="bg-slate-300/30 backdrop-blur-sm rounded-xl shadow-lg mx-auto w-[400px] h-10">
      <div className="h-full flex items-center justify-around px-6">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              className="p-2 rounded-full"
              aria-label={item.label}
              onClick={item.onClick}
            >
              <Icon
                weight="duotone"
                className={`w-6 h-6  hover:text-pink-600 ${item.customClass}`}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
};
