
export type UserResponse = {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
  is_admin: number;
  client_id: number;
};



export interface SingleUserWithPermissions {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  roles: Role[];
  all_permissions: ModulePermission[];
}

export interface Role {
  id: number;
  name: string;
  created_at: string;
}

export interface ModulePermission {
  module_id: number;
  module_name: string;
  permissions: Permission[];
}

export interface Permission {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  is_Admin: boolean;
  roles: string[];
  profile_image?:string
}

export interface UserCreateRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  roles: number[];
}



export interface UserListResponse {
  data: User[];
  total: number;
}




export type UserUpdateRequest = Partial<UserCreateRequest>;