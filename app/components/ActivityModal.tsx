"use client";
import React, { useEffect, useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Save, X } from "lucide-react";
import { Toast } from "primereact/toast";
import { supabase } from "@/lib/supbabaseClient";
import { Activity, CategoryOption, CategoryRow } from "../types/activity";

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityData: Activity;
  onSubmit: (data: Activity, isEdit: boolean, index: number | null) => void;
  isEdit: boolean;
  editIndex: number | null;
}

export default function ActivityModal({
  isOpen,
  onClose,
  activityData: initialData,
  onSubmit,
  isEdit,
  editIndex,
}: ActivityModalProps) {
  const [formData, setFormData] = useState<Activity>(initialData);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const toast = useRef<Toast>(null);

  // ✅ Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("activity_category")
        .select("activity_category_id, category_name");
      if (error) {
        console.error("Error fetching categories:", error.message);
        return;
      }
      if (data) {
        const mapped: CategoryOption[] = data.map((x: CategoryRow) => ({
          label: x.category_name,
          value: x.activity_category_id,
        }));
        setCategoryOptions(mapped);
      }
    };
    fetchCategories();
  }, []);

  // Sync form data when opening modal
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.startTime) {
      toast.current?.show({
        severity: "warn",
        summary: "Missing Field",
        detail: "Please enter start time.",
        life: 2500,
      });
      return;
    }

    if (!formData.name?.trim()) {
      toast.current?.show({
        severity: "warn",
        summary: "Missing Field",
        detail: "Please enter an activity name.",
        life: 2500,
      });
      return;
    }

    if (!formData.category_id) {
      toast.current?.show({
        severity: "warn",
        summary: "Missing Field",
        detail: "Please select a category.",
        life: 2500,
      });
      return;
    }

    onSubmit(formData, isEdit, editIndex);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex justify-center items-center p-4">
      <Toast ref={toast} position="top-right" />
      <div className="bg-brown-700 p-6 rounded-xl shadow-2xl w-full max-w-md border border-gray-700/50">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
          <h3 className="text-xl font-bold">
            {isEdit ? "Edit Activity" : "Add New Activity"}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <input
              type="time"
              value={formData.startTime || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, startTime: e.target.value }))
              }
              className="w-full p-2 rounded"
            />
          </div>

          {/* Activity Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Activity Name</label>
            <InputText
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full border border-gray-600 focus:outline-none"
            />
          </div>

          {/* 🔗 Link Field */}
          <div>
            <label className="block text-sm font-medium mb-1">Reference Link (Optional)</label>
            <InputText
              value={formData.link ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, link: e.target.value }))
              }
              className="w-full border border-gray-600 focus:outline-none"
            />
          </div>

          {/* Cost */}
          <div>
            <label className="block text-sm font-medium mb-1">Cost</label>
            <InputNumber
              value={Number(formData.cost) || 0}
              onValueChange={(e) =>
                setFormData((prev) => ({ ...prev, cost: e.value ?? "" }))
              }
              mode="currency"
              currency="USD"
              locale="en-US"
              className="w-full border border-gray-600 focus:outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <Dropdown
              value={formData.category_id}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category_id: e.value }))
              }
              options={categoryOptions}
              placeholder="Select Category"
              className="w-full text-base"
              panelClassName="bg-brown-700 border border-gray-700 shadow-lg"
            />
          </div>

              {/* 📝 Note Field */}
          <div>
            <label className="block text-sm font-medium mb-1">Note (Optional)</label>
            <InputTextarea
              value={formData.note ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, note: e.target.value }))
              }
              rows={4}
              autoResize
              placeholder="Add additional details or reminders..."
              className="w-full p-2 rounded border border-gray-600 focus:outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-neo-moss hover:bg-blue-500 rounded-lg font-semibold transition-colors mt-6 text-white"
          >
            <Save className="w-5 h-5" />
            {isEdit ? "Update Activity" : "Add Activity"}
          </button>
        </form>
      </div>
    </div>
  );
}
