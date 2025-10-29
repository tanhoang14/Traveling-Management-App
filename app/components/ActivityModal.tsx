"use client";
import React, { useEffect, useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
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

  // ✅ Load category options from Supabase
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

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.startTime) {
      toast.current?.show({
        detail: "Please enter start times.",
        life: 2500,
      });
      return;
    }

    onSubmit(formData, isEdit, editIndex);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <Toast ref={toast} position="top-right" />
      <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-xl shadow-2xl w-full max-w-md border border-gray-700/50">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
          <h3 className="text-xl font-bold">
            {isEdit ? "Edit Activity" : "Add New Activity"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-white-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Start Time */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-white-300 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={formData.startTime || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startTime: e.target.value,
                  }))
                }
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
          </div>

          {/* Activity Name */}
          <div>
            <label className="block text-sm font-medium text-white-300 mb-1">
              Activity Name
            </label>
            <InputText
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full"
            />
          </div>

          {/* Cost & Category */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-white-300 mb-1">
                Cost
              </label>
              <InputNumber
                value={Number(formData.cost) || 0}
                onValueChange={(e) =>
                  setFormData((prev) => ({ ...prev, cost: e.value ?? "" }))
                }
                mode="currency"
                currency="USD"
                locale="en-US"
                className="w-full"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-white-300 mb-1">
                Category
              </label>
              <Dropdown
                value={formData.category_id}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category_id: e.value }))
                }
                options={categoryOptions}
                placeholder="Select Category"
                className="w-full text-base"
                panelClassName="bg-gray-800 text-white border border-gray-700 shadow-lg"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors mt-6"
          >
            <Save className="w-5 h-5" />
            {isEdit ? "Update Activity" : "Add Activity"}
          </button>
        </form>
      </div>
    </div>
  );
}
