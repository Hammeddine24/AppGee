export type Donation = {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  imageHint: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  createdAt: string; // Should be ISO string date
};
