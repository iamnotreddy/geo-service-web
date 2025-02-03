"use client"; // This is important - Map must be a client component

import Map, { Marker, Popup } from "react-map-gl";
import type { MarkerDragEvent, MapMouseEvent, MapRef } from "react-map-gl";

import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSnapshot } from "valtio";
import { uiStore } from "../store/uiStore";
import { mapStore } from "@/store/mapStore";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Newspaper, Target } from "@phosphor-icons/react";
import { format } from "date-fns";

type MapPointData = {
  category: string;
  createdAt: string;
  description: string;
  id: string;
  longitude: number;
  latitude: number;
  title: string;
  updatedAt: string;
};

export default function MapComponent() {
  const { currentMarker, viewState } = useSnapshot(mapStore);
  const { currentMode } = useSnapshot(uiStore);
  const [popupInfo, setPopupInfo] = useState<MapPointData | null>(null);
  const mapRef = useRef<MapRef>(null);

  const { data: mapMarkers } = useQuery<MapPointData[]>({
    queryKey: ["mapPoints"],
    queryFn: () =>
      fetch("http://localhost:3001/map-points").then((res) => {
        if (!res.ok) throw new Error("Failed to fetch map points");
        return res.json();
      }),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const onMarkerDrag = useCallback((event: MarkerDragEvent) => {
    mapStore.setCurrentMarker({
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat,
    });
    // mapRef.current?.panTo(event.lngLat, { duration: 1000 });
  }, []);

  const handleMapClick = useCallback(
    (event: MapMouseEvent) => {
      if (currentMode.type === "adding-marker") {
        mapStore.setCurrentMarker({
          longitude: event.lngLat.lng,
          latitude: event.lngLat.lat,
        });

        // mapRef.current?.panTo(event.lngLat, { duration: 1000 });
      }
    },
    [currentMode.type]
  );

  useEffect(() => {
    if (currentMode.type === "adding-marker" && !currentMarker) {
      // If entering add mode and no marker exists, set it to map center
      mapStore.setCurrentMarker({
        longitude: viewState!.longitude,
        latitude: viewState!.latitude,
      });
    }

    if (currentMode.type !== "adding-marker") {
      mapStore.setCurrentMarker(undefined);
    }
  }, [currentMode.type, currentMarker, viewState]);

  useEffect(() => {
    if (currentMode.type === "adding-marker" && currentMarker) {
      mapRef.current?.panTo([currentMarker.longitude, currentMarker.latitude], {
        duration: 1000,
      });
    }
  }, [currentMarker]);

  return (
    <>
      <style type="text/css">{`
        .mapboxgl-popup-content {
          background: none;
          padding: 0;
          box-shadow: none;
        }
        .mapboxgl-popup-close-button {
          right: 8px;
          top: 8px;
          color: rgba(255,255,255,0.8);
          font-size: 16px;
        }
        .mapboxgl-popup-close-button:hover {
          color: white;
          background: none;
        }
      `}</style>
      <Map
        {...viewState}
        {...mapConfig}
        cursor={currentMode.type === "adding-marker" ? "crosshair" : "grab"}
        onMove={(evt) => mapStore.setViewState(evt.viewState)}
        onClick={handleMapClick}
        ref={mapRef}
      >
        {currentMarker && (
          <Marker
            longitude={currentMarker.longitude}
            latitude={currentMarker.latitude}
            anchor="bottom"
            draggable
            onDrag={onMarkerDrag}
            color="blue"
          >
            <Target
              weight="fill"
              className="w-10 h-10 text-pink-800 hover:text-pink-500"
            />
          </Marker>
        )}
        {mapMarkers?.map((marker) => (
          <Marker
            key={marker.id}
            longitude={marker.longitude}
            latitude={marker.latitude}
            anchor="bottom"
            color="white"
            onClick={(e) => {
              e.originalEvent?.stopPropagation();
              setPopupInfo(marker);
              mapRef.current?.flyTo({
                center: [marker.longitude, marker.latitude],
                zoom: 14,
                duration: 1500,
              });
            }}
          >
            <Newspaper
              weight="fill"
              className={`w-6 h-6 text-slate-600 hover:text-slate-900 transition-all duration-300`}
            />
          </Marker>
        ))}

        {popupInfo && (
          <Popup
            latitude={popupInfo.latitude}
            longitude={popupInfo.longitude}
            onClose={() => setPopupInfo(null)}
            closeButton
            className="bg-opacity-90"
          >
            <PopupContent popupInfo={popupInfo} />
          </Popup>
        )}
      </Map>
    </>
  );
}

const mapConfig = {
  style: { width: "100%", height: "100%" },
  mapStyle: "mapbox://styles/mapbox/streets-v12",
  mapboxAccessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
};

export const PopupContent = (props: { popupInfo: MapPointData }) => {
  const { popupInfo } = props;
  return (
    <div className="bg-slate-800 bg-opacity-85 rounded-lg max-h-[20vh] max-w-[25vw] p-4 border border-slate-300">
      <p className="font-semibold text-white mb-1">{popupInfo.title}</p>
      <p className="text-xs text-gray-200">{popupInfo.description}</p>
      <div className="text-xs text-gray-400 mt-2">
        {format(new Date(popupInfo.updatedAt), "MMM d, yyyy")}
      </div>
    </div>
  );
};
