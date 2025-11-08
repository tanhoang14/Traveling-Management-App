// types/activity.ts

export interface Activity {
  activity_id: string;
  startTime: string;
  name: string;
  cost: number | "";
  category_id: string;
  user_id: string;
  link?: string;
  note: string;
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
  link: "",
  note: "",
};

export interface Trip {
  trip_id: string;
  location: string;
  trip_start_date: string;
  trip_end_date: string;
  trip_duration: number;
  budget: number;
  note?: string;
  trip_code: string;
  image_url?: string;
}

export interface Traveler {
  id: string;
  name: string;
  avatar: string;
}

export interface CategoryData {
  name: string;
  value: number;
  [key: string]: any;
}

export type StayBooking = {
  id: string;
  name: string;
  logo_url: string;
  color: string;
  website_url: string;
};

export type FlightBooking = {
  id: string;
  name: string;
  logo_url: string;
  color: string;
  website_url: string;
};

export interface Destination {
  name: string;
  description?: string;
  image: string;
  articles?: string;
}
