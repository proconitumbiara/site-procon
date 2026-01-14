import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

//Usuários
export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  cpf: text("cpf").unique(),
  phoneNumber: text("phone_number").unique(),
  role: text("role").notNull().default("professional"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const accountsTable = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verificationsTable = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

//Tabela para armazenar notícias
export const newsTable = pgTable("news", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"), //Texto curto para o card da notícia
  content: text("content"), //Texto longo para a notícia
  coverImageUrl: text("cover_image_url"), //URL da imagem de capa da notícia
  publishedAt: timestamp("published_at"), //Data de publicação
  emphasis: boolean("emphasis").notNull().default(false), //Adicionado
  isPublished: boolean("is_published").notNull().default(false), //Se a notícia está publicada
  createdAT: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

//Tabela para armazenar projetos
export const projectsTable = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  summary: text("summary"), //Texto curto para o card do projeto
  description: text("description"), //Texto longo para o projeto
  coverImageUrl: text("cover_image_url"), //URL da imagem de capa do projeto
  emphasis: boolean("emphasis").notNull().default(false), //Se o projeto é em destaque
  createdAT: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

//Tabela para armazenar serviços
export const servicesTable = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"), //Descrição do serviço
  requirements: text("requirements"), //Requisitos para o serviço
  howToApply: text("how_to_apply"), //Como aplicar para o serviço
  contactEmail: text("contact_email"), //Email de contato para o serviço
  contactPhone: text("contact_phone"), //Telefone de contato para o serviço
  isActive: boolean("is_active").notNull().default(true), //Se o serviço está ativo
  emphasis: boolean("emphasis").notNull().default(false), //Se o serviço é em destaque
  createdAT: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

//Tabela para armazenar pesquisas de preços
export const priceSearchesTable = pgTable("price_searches", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  summary: text("summary"), //Texto curto para o card da pesquisa de preços
  description: text("description"), //Descrição da pesquisa de preços
  coverImageUrl: text("cover_image_url"), //URL da imagem de capa da pesquisa de preços
  emphasis: boolean("emphasis").notNull().default(false), //Se a pesquisa de preços é em destaque
  year: integer("year").notNull(), //Ano da pesquisa de preços
  collectionDate: date("collection_date"), //Data da coleta dos preços
  observation: text("observation"), //Observação da pesquisa de preços
  createdAT: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

//Tabela para armazenar fornecedores
export const suppliersTable = pgTable("suppliers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"),
  createdAT: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

//Tabela para armazenar categorias de produtos
export const categoriesTable = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAT: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

//Tabela para armazenar produtos (catálogo geral de produtos)
export const productsTable = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categoriesTable.id, { onDelete: "cascade" }),
  createdAT: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

//Tabela intermediária para relacionar pesquisa, produto, fornecedor e preço
export const priceSearchItemsTable = pgTable("price_search_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  price: integer("price").notNull(), //Preço em centavos (ex: R$2,00 = 200)
  priceSearchId: uuid("price_search_id")
    .notNull()
    .references(() => priceSearchesTable.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),
  supplierId: uuid("supplier_id")
    .notNull()
    .references(() => suppliersTable.id, { onDelete: "cascade" }),
  createdAT: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

//Tabela para armazenar códigos de registro
export const registrationCodesTable = pgTable("registration_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  usedAt: timestamp("used_at"),
});

//Relationships

//Price searches relationships
export const priceSearchesRelations = relations(
  priceSearchesTable,
  ({ many }) => ({
    items: many(priceSearchItemsTable),
  }),
);

//Categories relationships
export const categoriesRelations = relations(categoriesTable, ({ many }) => ({
  products: many(productsTable),
}));

//Products relationships
export const productsRelations = relations(productsTable, ({ one, many }) => ({
  category: one(categoriesTable, {
    fields: [productsTable.categoryId],
    references: [categoriesTable.id],
  }),
  priceSearchItems: many(priceSearchItemsTable),
}));

//Suppliers relationships
export const suppliersRelations = relations(suppliersTable, ({ many }) => ({
  priceSearchItems: many(priceSearchItemsTable),
}));

//Price search items relationships
export const priceSearchItemsRelations = relations(
  priceSearchItemsTable,
  ({ one }) => ({
    priceSearch: one(priceSearchesTable, {
      fields: [priceSearchItemsTable.priceSearchId],
      references: [priceSearchesTable.id],
    }),
    product: one(productsTable, {
      fields: [priceSearchItemsTable.productId],
      references: [productsTable.id],
    }),
    supplier: one(suppliersTable, {
      fields: [priceSearchItemsTable.supplierId],
      references: [suppliersTable.id],
    }),
  }),
);
