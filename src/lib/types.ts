export type Donation = {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  imageHint: string;
  contact: string; // Email, phone number, etc.
  user: {
    id: string;
    name: string;
  };
  createdAt: string; // Should be ISO string date
};
