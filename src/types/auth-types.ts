import * as yup from 'yup';
import type { InferType } from 'yup';

export type RegisterResponse = {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
};


export const LoginSchema = yup.object({
  email: yup.string().required('Email is required').email('Must be a valid email'),
  password: yup.string().required('Password is required'),
  rememberMe: yup.boolean().default(false),
});


export type LoginResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  is_admin:number;
  stepper_count?: number;
  is_stepper_complete?: number;
  is_verified:number
};



export const RegistrationSchema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().required('Email is required').email('Must be a valid email'),
 phone: yup.string()
    .required('Phone is required')
    .matches(/^(013|014|015|016|017|018|019)\d{8}$/, 'Phone must be a valid Bangladeshi number with exactly 11 digits'),
  password: yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
  password_confirmation: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Password confirmation is required'),
});


export const resetPasswordSchema = yup.object({

  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),

  password_confirmation: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),

});

export interface AuthtUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  is_Admin: boolean;
  roles: string[];
  profile_image?:string
}

export type ResetPassword = InferType<typeof resetPasswordSchema>;
export type Registration = yup.InferType<typeof RegistrationSchema>;
export type Login = InferType<typeof LoginSchema>;
