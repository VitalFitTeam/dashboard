export type Users = {
  id: string;
  name: string;
  email: string;
  rol: string;
  status: "active" | "inactive" | "maintenance";
  uacceso?: string;
};
