import { ViewState } from "react-map-gl";
import { proxy } from "valtio";

// types.ts
export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type MarkerData = {
  id: string;
  coordinates: Coordinates;
  metadata?: {
    title?: string;
    articleUrl?: string;
    description?: string;
  };
};

class MapStore {
  markers: MarkerData[] = [];
  currentMarker: Coordinates | undefined = undefined;
  viewState: ViewState | undefined = {
    latitude: 37.8,
    longitude: -122.4,
    zoom: 14,
    bearing: 0,
    pitch: 0,
    padding: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
  };

  setCurrentMarker(coordinates?: Coordinates) {
    this.currentMarker = coordinates;
  }

  setViewState(viewState: ViewState) {
    this.viewState = viewState;
  }
}

export const mapStore = proxy(new MapStore());
