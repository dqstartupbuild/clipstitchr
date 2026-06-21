import { allCaseStudies } from "content-collections";
import { sortContentByDateDescending } from "./sortContentByDateDescending";

function getAllCaseStudies() {
  return sortContentByDateDescending(allCaseStudies);
}

export function getPublishedCaseStudies() {
  return getAllCaseStudies().filter((caseStudy) => !caseStudy.draft);
}

export function getFeaturedCaseStudies() {
  return getPublishedCaseStudies().filter((caseStudy) => caseStudy.featured);
}

export function getCaseStudyBySlug(slug: string) {
  return getPublishedCaseStudies().find((caseStudy) => caseStudy.slug === slug);
}

export function getCaseStudyCategories() {
  return Array.from(
    new Set(getPublishedCaseStudies().map((caseStudy) => caseStudy.category)),
  ).sort();
}
