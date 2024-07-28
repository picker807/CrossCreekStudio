

export interface Admin {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface AdminCredentials {
  email: string;
  password: string;
}

export interface PasswordChangeRequest {
  oldPassword: string;
  newPassword: string;
}

export interface CreateAdminDto {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: string;
}
