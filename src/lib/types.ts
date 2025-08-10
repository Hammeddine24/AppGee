export type Donation = {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  imageHint: string;
  user: {
    name: string;
    avatarUrl: string;
  };
  createdAt: string;
};
