import { sql } from "drizzle-orm";

import { db } from "@/db";
import {
  formsTable,
  newsTable,
  priceSearchesTable,
  projectsTable,
  servicesTable,
} from "@/db/schema";

export type NewsRecord = typeof newsTable.$inferSelect;
export type ProjectRecord = typeof projectsTable.$inferSelect;
export type ServiceRecord = typeof servicesTable.$inferSelect;
export type PriceSearchRecord = typeof priceSearchesTable.$inferSelect;

export async function getPublishedNews() {
  return db.query.newsTable.findMany({
    where: (news, { eq }) => eq(news.isPublished, true),
    orderBy: (news, { desc }) => [desc(news.publishedAt), desc(news.createdAT)],
  });
}

export async function getNewsBySlug(slug: string) {
  const news = await db.query.newsTable.findFirst({
    where: (news, helpers) =>
      helpers.and(
        helpers.eq(news.slug, slug),
        helpers.eq(news.isPublished, true),
      ),
  });

  if (!news) {
    return null;
  }

  return news;
}

export async function getNewsById(id: string) {
  const news = await db.query.newsTable.findFirst({
    where: (news, { eq }) => eq(news.id, id),
  });

  if (!news) {
    return null;
  }

  return news;
}

export async function getAllProjects() {
  return db.query.projectsTable.findMany({
    orderBy: (project, { desc }) => [desc(project.createdAT)],
  });
}

export async function getProjectsWithForms() {
  return db.query.projectsTable.findMany({
    with: { forms: true },
    orderBy: (project, { desc }) => [desc(project.createdAT)],
  });
}

export async function getProjectBySlug(slug: string) {
  const project = await db.query.projectsTable.findFirst({
    where: (project, { eq }) => eq(project.slug, slug),
  });

  if (!project) {
    return null;
  }

  return project;
}

export async function getProjectById(id: string) {
  const project = await db.query.projectsTable.findFirst({
    where: (project, { eq }) => eq(project.id, id),
  });

  if (!project) {
    return null;
  }

  return project;
}

export type FormRecord = typeof formsTable.$inferSelect;

export async function getFormById(id: string) {
  const form = await db.query.formsTable.findFirst({
    where: (form, { eq }) => eq(form.id, id),
    with: { project: true },
  });

  if (!form) {
    return null;
  }

  return form;
}

export async function getFormBySlug(slug: string) {
  const form = await db.query.formsTable.findFirst({
    where: (form, { eq }) => eq(form.slug, slug),
    with: { project: true },
  });

  if (!form) {
    return null;
  }

  return form;
}

export async function getFormsByProjectId(projectId: string) {
  return db.query.formsTable.findMany({
    where: (form, { eq }) => eq(form.projectId, projectId),
    orderBy: (form, { asc }) => [asc(form.name)],
  });
}

export async function getActiveServices() {
  return db.query.servicesTable.findMany({
    where: (service, { eq }) => eq(service.isActive, true),
    orderBy: (service, { asc }) => [asc(service.title)],
  });
}

export async function getServiceBySlug(slug: string) {
  const service = await db.query.servicesTable.findFirst({
    where: (service, helpers) =>
      helpers.and(
        helpers.eq(service.slug, slug),
        helpers.eq(service.isActive, true),
      ),
  });

  if (!service) {
    return null;
  }

  return service;
}

export async function getServiceById(id: string) {
  const service = await db.query.servicesTable.findFirst({
    where: (service, { eq }) => eq(service.id, id),
  });

  if (!service) {
    return null;
  }

  return service;
}

export async function searchNews(query: string) {
  if (!query.trim()) {
    return [];
  }

  const searchTerm = `%${query.trim()}%`;

  return db.query.newsTable.findMany({
    where: (news, { and, eq, or }) =>
      and(
        eq(news.isPublished, true),
        or(
          sql`${news.title} ILIKE ${searchTerm}`,
          sql`${news.excerpt} ILIKE ${searchTerm}`,
          sql`${news.content} ILIKE ${searchTerm}`,
        ),
      ),
    orderBy: (news, { desc }) => [desc(news.publishedAt), desc(news.createdAT)],
  });
}

export async function searchProjects(query: string) {
  if (!query.trim()) {
    return [];
  }

  const searchTerm = `%${query.trim()}%`;

  return db.query.projectsTable.findMany({
    where: (project, { or }) =>
      or(
        sql`${project.title} ILIKE ${searchTerm}`,
        sql`${project.summary} ILIKE ${searchTerm}`,
        sql`${project.description} ILIKE ${searchTerm}`,
      ),
    orderBy: (project, { desc }) => [desc(project.createdAT)],
  });
}

export async function searchServices(query: string) {
  if (!query.trim()) {
    return [];
  }

  const searchTerm = `%${query.trim()}%`;

  return db.query.servicesTable.findMany({
    where: (service, { and, eq, or }) =>
      and(
        eq(service.isActive, true),
        or(
          sql`${service.title} ILIKE ${searchTerm}`,
          sql`${service.description} ILIKE ${searchTerm}`,
        ),
      ),
    orderBy: (service, { asc }) => [asc(service.title)],
  });
}

export async function getAllPriceSearches() {
  return db.query.priceSearchesTable.findMany({
    orderBy: (priceSearch, { desc }) => [
      desc(priceSearch.year),
      desc(priceSearch.createdAT),
    ],
  });
}

export async function getPriceSearchBySlug(slug: string) {
  const priceSearch = await db.query.priceSearchesTable.findFirst({
    where: (priceSearch, { eq }) => eq(priceSearch.slug, slug),
    with: {
      items: {
        with: {
          product: {
            with: {
              category: true,
            },
          },
          supplier: true,
        },
      },
    },
  });

  if (!priceSearch) {
    return null;
  }

  return priceSearch;
}
