import { z } from "zod";

const PARTICIPANT_CATEGORY = ["student", "employee"] as const;
const STUDENT_PERIODS = ["8º Ano", "9º Ano"] as const;
const SCHOOLS = [
  "CEPI Adoniro Martins de Andrade",
  "CEPI Dom Veloso",
  "CEPI Dr. José Feliciano Ferreira",
  "CEPI Homero Orlando Ribeiro",
] as const;
const CLOTHING_SIZES = [
  "PP BabyLook",
  "P BabyLook",
  "M BabyLook",
  "G BabyLook",
  "GG BabyLook",
  "XG BabyLook",
  "PP",
  "P",
  "M",
  "G",
  "GG",
  "XG",
] as const;

export const createFormRegistrationSchema = z
  .object({
    formId: z.string().uuid("Informe um formulário válido."),
    participantFullName: z
      .string()
      .trim()
      .min(1, "Por favor, informe seu nome completo"),
    participantPhone: z
      .string()
      .trim()
      .min(1, "Por favor, informe seu telefone para contato"),
    participantBirthDate: z
      .string()
      .min(1, "Por favor, informe sua data de nascimento")
      .refine(
        (val) => !Number.isNaN(Date.parse(val)),
        "Informe uma data válida",
      ),
    participantSchool: z.enum(SCHOOLS, {
      message: "Por favor, selecione a escola em que estuda ou trabalha",
    }),
    participantCategory: z.enum(PARTICIPANT_CATEGORY, {
      message: "Por favor, informe se você é aluno ou profissional",
    }),
    studentPeriod: z.enum(STUDENT_PERIODS).optional(),
    employeePosition: z.string().trim().optional(),
    clothingSize: z.enum(CLOTHING_SIZES, {
      message: "Por favor, selecione o tamanho da camiseta",
    }),
    acceptTermsAndPrivacy: z.literal(true, {
      message:
        "Para finalizar, marque que você aceita os termos de uso e a política de privacidade",
    }),
    acceptImageUse: z.literal(true, {
      message:
        "Para finalizar, marque que você aceita o uso de imagens nos eventos",
    }),
    pageUrl: z.string().optional(),
    locale: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.participantCategory === "student") {
        return data.studentPeriod != null && data.studentPeriod.length > 0;
      }
      return true;
    },
    {
      message: "Por favor, selecione a série em que você estuda",
      path: ["studentPeriod"],
    },
  )
  .refine(
    (data) => {
      if (data.participantCategory === "employee") {
        return (
          data.employeePosition != null &&
          data.employeePosition.trim().length > 0
        );
      }
      return true;
    },
    {
      message: "Por favor, informe seu cargo ou função na escola",
      path: ["employeePosition"],
    },
  );

export type CreateFormRegistrationInput = z.infer<
  typeof createFormRegistrationSchema
>;

export { PARTICIPANT_CATEGORY, STUDENT_PERIODS, SCHOOLS, CLOTHING_SIZES };
