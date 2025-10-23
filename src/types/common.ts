

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PaginatedClientUserResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}




export interface ApiResponse<T> {
  data: T;
  links?: PaginationLinks;
  meta?: PaginationMeta;
  success: boolean;
  status: number;
  message: string;
  error?:any
  errors?:any
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  links: PageLink[];
  path: string;
  per_page: number;
  to: number;
  total: number;
}

export interface PageLink {
  url: string | null;
  label: string;
  active: boolean;
}


export interface RolesAndPermission {
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
