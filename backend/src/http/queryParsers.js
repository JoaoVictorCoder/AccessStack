export function parsePagination(query, { defaultPage = 1, defaultPageSize = 20, maxPageSize = 100 } = {}) {
  const page = Math.max(Number(query?.page || defaultPage), 1);
  const pageSize = Math.min(Math.max(Number(query?.pageSize || defaultPageSize), 1), maxPageSize);
  return { page, pageSize };
}

export function parseBoundedLimit(queryValue, { defaultLimit = 50, maxLimit = 500 } = {}) {
  const parsed = Number(queryValue || defaultLimit);
  if (!Number.isFinite(parsed)) {
    return defaultLimit;
  }
  return Math.min(Math.max(parsed, 1), maxLimit);
}

export function parseOptionalStringQuery(query, key) {
  const value = query?.[key];
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function buildPaginatedPayload({ items, page, pageSize, total }) {
  return {
    items,
    page,
    pageSize,
    total,
    totalPages: Math.max(Math.ceil(total / pageSize), 1)
  };
}
