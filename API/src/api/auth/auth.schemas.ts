import z from 'zod';
import { EnumRole } from '../../../typings/token';

export const registerSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email('Invalid email or password'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters long'),
  firstName: z
    .string({ required_error: 'First name is required' })
    .min(3, 'First name must be at least 2 characters long'),
  lastName: z
    .string({ required_error: 'Last name is required' })
    .min(3, 'Last name must be at least 2 characters long'),
  indexNumber: z
    .number({ required_error: 'Index number is required' })
    .refine(
      (value) => value.toString().length === 6,
      'Index number must be 6 characters long'
    ),
  groupId: z.number({ required_error: 'Group id is required' }),
  isAdmin: z.boolean({ required_error: 'isAdmin param is required' }),
  role: z.nativeEnum(EnumRole),
});

export const registerStudentSchema = registerSchema.omit({
  email: true,
  password: true,
  isAdmin: true,
  role: true,
});

export const registerManyStudentsSchema = z.object({
  lecturerId: z.number({ required_error: 'Lecturer id is required' }),
  groupName: z.string({ required_error: 'Group name is required' }),
  studentsToRegister: z.array(
    registerStudentSchema.omit({
      groupId: true,
    })
  ),
});

export const registerLecturerSchema = registerSchema.omit({
  role: true,
  indexNumber: true,
  groupId: true,
});

export const registerSuperUserSchema = registerSchema.omit({
  role: true,
  indexNumber: true,
  groupId: true,
});

export const registerQuerySchema = z.object({
  refreshTokenInCookie: z.enum(['true', 'false']).default('false'),
});

export type RegisterManyStudentsInput = z.infer<
  typeof registerManyStudentsSchema
>;
export type RegisterStudentInput = z.infer<typeof registerStudentSchema>;
export type RegisterLecturerInput = z.infer<typeof registerLecturerSchema>;
export type RegisterSuperUserInput = z.infer<typeof registerSuperUserSchema>;
export type RegisterQuerySchema = z.infer<typeof registerQuerySchema>;

export const loginSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email('Invalid email or password'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Invalid credentials'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const refreshTokenSchema = z.object({
  refresh_token: z.string().optional(),
});

export type RefreshInput = z.infer<typeof refreshTokenSchema>;
