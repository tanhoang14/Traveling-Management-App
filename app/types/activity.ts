// types/activity.ts

export interface Activity {
  activity_id:string,
  startTime: string;
  endTime: string;
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
  activity_id:"",
  startTime: "",
  endTime: "",
  name: "",
  cost: "",
  category_id: "",
  user_id:"",
};
