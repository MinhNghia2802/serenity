import { z } from "zod";
import { emotionSlugs } from "@/types/domain";

export const contentSetSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).default(""),
});

export const setStatusSchema = z.object({ status: z.enum(["draft", "published", "archived"]) });

export const artworkSchema = z.object({
  imageUrl: z.string().url().max(2000),
  altText: z.string().trim().min(5).max(300),
  license: z.string().trim().min(2).max(200),
  emotionTags: z.array(z.enum(emotionSlugs)).min(1),
});

export const questionSchema = z.object({
  questionKey: z.string().trim().regex(/^[a-z][a-z0-9_]*$/).max(80),
  prompt: z.string().trim().min(5).max(500),
  inputType: z.enum(["single_select", "scale", "textarea"]),
  isRequired: z.boolean(),
});
