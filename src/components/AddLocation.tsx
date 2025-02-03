import { mapStore } from "@/store/mapStore";
import { uiStore } from "@/store/uiStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useSnapshot } from "valtio";

type MapPointData = {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
};

export const AddLocation = () => {
  const { currentMarker } = useSnapshot(mapStore);

  const [formData, setFormData] = useState({
    title: "",
    articleUrl: "",
    description: "",
  });

  const [errors, setErrors] = useState({
    title: "",
    articleUrl: "",
  });

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: (data: MapPointData) =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/map-points`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to create point");
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mapPoints"] });
      // Reset form
      uiStore.toggleAddMode();
      setFormData({
        title: "",
        articleUrl: "",
        description: "",
      });
    },
  });

  const validateForm = () => {
    const newErrors = {
      title: "",
      articleUrl: "",
    };

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (formData.articleUrl && !formData.articleUrl.startsWith("http")) {
      newErrors.articleUrl = "URL must start with http:// or https://";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!currentMarker) {
      alert("Please select a location on the map");
      return;
    }

    const mapPointData = {
      name: formData.title, // using title as name
      description: formData.description,
      latitude: currentMarker.latitude,
      longitude: currentMarker.longitude,
    };

    const newMarker = {
      id: Date.now().toString(),
      coordinates: currentMarker,
      metadata: formData,
    };

    // CREATE MAP POINT
    mutate(mapPointData);

    // WARNING: updates markers valtio state temporarily; once backend fetch endpoint is built,
    // switch to that and refetch after pushing

    mapStore.markers.push(newMarker);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="max-h-[400px] w-[300px] bg-white/90 border border-slate-300 rounded-lg">
      <div className="flex h-full w-full flex-col p-4">
        <div className="font-semibold border-b border-slate-400 pb-2">
          Add Location
        </div>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:border-blue-500"
              placeholder="Enter title"
            />
            {errors.title && (
              <span className="text-red-500 text-xs">{errors.title}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Article URL
            </label>
            <input
              type="text"
              name="articleUrl"
              value={formData.articleUrl}
              onChange={handleChange}
              className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:border-blue-500"
              placeholder="https://..."
            />
            {errors.articleUrl && (
              <span className="text-red-500 text-xs">{errors.articleUrl}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:border-blue-500 resize-none"
              rows={3}
              placeholder="Optional description..."
            />
          </div>

          <button
            type="submit"
            className="mt-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
          >
            Add Marker
          </button>
        </form>
      </div>
    </div>
  );
};
