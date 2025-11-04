export type Membership = {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  status: "Active" | "Inactive";
};
