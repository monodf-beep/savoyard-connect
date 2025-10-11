import { z } from 'zod';

// Person validation schema
export const personSchema = z.object({
  firstName: z.string()
    .trim()
    .min(1, { message: "Le prénom est requis" })
    .max(100, { message: "Le prénom ne peut pas dépasser 100 caractères" }),
  
  lastName: z.string()
    .trim()
    .max(100, { message: "Le nom ne peut pas dépasser 100 caractères" })
    .optional(),
  
  email: z.string()
    .trim()
    .email({ message: "Email invalide" })
    .max(255, { message: "L'email ne peut pas dépasser 255 caractères" })
    .optional()
    .or(z.literal('')),
  
  phone: z.string()
    .trim()
    .max(20, { message: "Le numéro de téléphone ne peut pas dépasser 20 caractères" })
    .optional()
    .or(z.literal('')),
  
  role: z.string()
    .trim()
    .max(200, { message: "Le rôle ne peut pas dépasser 200 caractères" })
    .optional(),
  
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
    .max(500, { message: "L'adresse ne peut pas dépasser 500 caractères" })
    .optional(),
  
  photo: z.string()
    .trim()
    .max(2000, { message: "L'URL de la photo ne peut pas dépasser 2000 caractères" })
    .optional()
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
  
  type: z.enum(['CDI', 'CDD', 'Stage', 'Freelance'])
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
