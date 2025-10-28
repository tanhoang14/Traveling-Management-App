// types/activity.ts

export interface Activity {
  activity_id: string;
  startTime: string;
  name: string;
  cost: number | "";
  category_id: string;
  user_id: string;
}

export interface CategoryOption {
  label: string;
  value: string;
}

export interface CategoryRow {
  activity_category_id: string;
  category_name: string;
}

// Initial state for a new activity
export const initialActivityState: Activity = {
  activity_id: "",
  startTime: "",
  name: "",
  cost: "",
  category_id: "",
  user_id: "",
};

export interface Trip {
  trip_id: string;
  location: string;
  trip_start_date: string;
  trip_end_date: string;
  trip_duration: number;
  budget: number;
  note?: string;
}

export interface Traveler {
  id: string;
  name: string;
  avatar: string;
}
