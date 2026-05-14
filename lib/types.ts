export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
};

export type Club = {
  id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  invite_token: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ClubMember = {
  id: string;
  club_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  profiles?: Profile;
};

export type Book = {
  id: string;
  club_id: string;
  title: string;
  author: string | null;
  cover_image_url: string | null;
  page_count: number | null;
  status: 'current' | 'past';
  started_at: string | null;
  finished_at: string | null;
  created_by: string | null;
  created_at: string;
};

export type ReadingProgress = {
  id: string;
  club_id: string;
  book_id: string;
  user_id: string;
  current_page: number;
  note: string | null;
  updated_at: string;
  profiles?: Profile;
};

export type Meeting = {
  id: string;
  club_id: string;
  title: string;
  description: string | null;
  location: string | null;
  status: 'polling' | 'confirmed' | 'cancelled';
  confirmed_at: string | null;
  book_id: string | null;
  target_page: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  meeting_date_options?: MeetingDateOption[];
};

export type MeetingDateOption = {
  id: string;
  meeting_id: string;
  proposed_at: string;
  is_confirmed: boolean;
  created_at: string;
  meeting_votes?: MeetingVote[];
};

export type MeetingVote = {
  id: string;
  option_id: string;
  user_id: string;
  available: boolean;
  created_at: string;
  profiles?: Profile;
};

export type Post = {
  id: string;
  club_id: string;
  author_id: string;
  content: string;
  post_type: 'general' | 'progress' | 'announcement';
  page_number: number | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  comments?: Comment[];
};

export type Comment = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
};
