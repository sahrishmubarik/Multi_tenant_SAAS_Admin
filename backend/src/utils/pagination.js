// src/utils/pagination.js

export async function paginateQuery(dynamicQuery, params = {}) {
  // CRITICAL FIX: Convert strings ("10", "1") explicitly into pure Numbers
  const page = Math.max(1, parseInt(params.page, 10) || 1);
  const limit = Math.max(1, parseInt(params.limit, 10) || 10);

  const offset = (page - 1) * limit;

  // Now Drizzle passes actual integers to PostgreSQL, forcing a limit partition
  const data = await dynamicQuery.limit(limit).offset(offset);

  return {
    data,
    meta: {
      currentPage: page,
      perPage: limit,
      count: data.length,
    },
  };
}
