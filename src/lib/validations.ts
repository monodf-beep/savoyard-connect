import { z } from 'zod';

// Base person fields (shared)
const personBaseFields = {
  firstName: z.string()
    .trim()
    .min(1, { message: "Le prénom est requis" })
    .max(100, { message: "Le prénom ne peut pas dépasser 100 caractères" }),
  
  lastName: z.string()
    .trim()
    .min(1, { message: "Le nom est requis" })
    .max(100, { message: "Le nom ne peut pas dépasser 100 caractères" }),
  
  email: z.string()
    .trim()
    .email({ message: "Email invalide" })
    .min(1, { message: "L'email est requis" })
    .max(255, { message: "L'email ne peut pas dépasser 255 caractères" }),
  
  phone: z.string()
    .trim()
    .max(20, { message: "Le numéro de téléphone ne peut pas dépasser 20 caractères" })
    .optional()
    .or(z.literal('')),
  
  role: z.string()
    .trim()
    .min(1, { message: "Le rôle est requis" })
    .max(200, { message: "Le rôle ne peut pas dépasser 200 caractères" }),
  
  description: z.string()
    .trim()
    .max(2000, { message: "La description ne peut pas dépasser 2000 caractères" })
    .optional(),
  
  linkedin: z.string()
    .trim()
    .max(500, { message: "Le lien LinkedIn ne peut pas dépasser 500 caractères" })
    .optional()
    .or(z.literal('')),
  
  adresse: z.string()
    .trim()
    .min(1, { message: "La ville est requise" })
    .max(500, { message: "L'adresse ne peut pas dépasser 500 caractères" }),
};

// Person validation schema for ADMIN (photo optional)
export const personSchema = z.object({
  ...personBaseFields,
  photo: z.string()
    .trim()
    .max(50000, { message: "La photo est trop grande" })
    .optional()
    .or(z.literal('')),
});

// Person validation schema for SELF-ONBOARDING (photo required)
export const personSelfSchema = z.object({
  ...personBaseFields,
  photo: z.string()
    .trim()
    .min(1, { message: "La photo est requise" })
    .refine(
      (v) => !v || v.length <= 50000 || /^data:image\/(png|jpe?g|webp);base64,/i.test(v),
      { message: "La photo doit être une URL courte ou une image en base64 (acceptée)." }
    ),
});

// Section validation schema
export const sectionSchema = z.object({
  title: z.string()
    .trim()
    .min(1, { message: "Le titre est requis" })
    .max(200, { message: "Le titre ne peut pas dépasser 200 caractères" }),
  
  type: z.enum(['bureau', 'conseil', 'commission', 'groupe'])
});

// Job posting validation schema
export const jobPostingSchema = z.object({
  title: z.string()
    .trim()
    .min(1, { message: "Le titre est requis" })
    .max(200, { message: "Le titre ne peut pas dépasser 200 caractères" }),
  
  department: z.string()
    .trim()
    .min(1, { message: "Le département est requis" })
    .max(200, { message: "Le département ne peut pas dépasser 200 caractères" }),
  
  description: z.string()
    .trim()
    .min(1, { message: "La description est requise" })
    .max(5000, { message: "La description ne peut pas dépasser 5000 caractères" }),
  
  location: z.string()
    .trim()
    .min(1, { message: "Le lieu est requis" })
    .max(200, { message: "Le lieu ne peut pas dépasser 200 caractères" }),
  
  applicationUrl: z.string()
    .trim()
    .url({ message: "URL invalide" })
    .max(1000, { message: "L'URL ne peut pas dépasser 1000 caractères" }),
  
  type: z.enum(['CDI', 'CDD', 'Stage', 'Freelance', 'Bénévolat', 'Alternance'])
});

// Vacant position validation schema
export const vacantPositionSchema = z.object({
  title: z.string()
    .trim()
    .min(1, { message: "Le titre est requis" })
    .max(200, { message: "Le titre ne peut pas dépasser 200 caractères" }),
  
  description: z.string()
    .trim()
    .max(2000, { message: "La description ne peut pas dépasser 2000 caractères" })
    .optional(),
  
  sectionId: z.string()
    .min(1, { message: "La section est requise" }),
  
  externalLink: z.string()
    .trim()
    .url({ message: "URL invalide" })
    .max(1000, { message: "L'URL ne peut pas dépasser 1000 caractères" })
    .optional()
    .or(z.literal(''))
});
