export type Users = {
  id: string;
  name: string;
  lastname: string;
  email: string;
  phone: string;
  document: string;
  date: string;
  gender: string;
  rol: string;
  status: "active" | "inactive" | "maintenance";
  uacceso?: string;
};

export interface BranchAdmin {
  id: string;
  firstName: string;
  lastName: string;
  roleId: string;
  roleName: string;
}

export interface ApiBranchAdmin {
  user_id: string;
  first_name: string;
  last_name: string;
  role_id: string;
  role_name: string;
}

export interface ApiResponse {
  data: ApiBranchAdmin[];
}
