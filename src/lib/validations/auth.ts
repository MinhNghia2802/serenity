import { z } from "zod";

export const emailSchema = z.string().trim().email("Email không hợp lệ.");

export const passwordSchema = z
  .string()
  .min(8, "Mật khẩu cần có ít nhất 8 ký tự.")
  .regex(/[A-Za-z]/, "Mật khẩu cần có ít nhất một chữ cái.")
  .regex(/[0-9]/, "Mật khẩu cần có ít nhất một chữ số.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Vui lòng nhập mật khẩu."),
});

export const registerSchema = z
  .object({
    displayName: z.string().trim().min(2, "Tên hiển thị cần có ít nhất 2 ký tự.").max(60, "Tên hiển thị tối đa 60 ký tự."),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận chưa khớp.",
    path: ["confirmPassword"],
  });

export function getFirstAuthValidationError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Thông tin chưa hợp lệ.";
}
