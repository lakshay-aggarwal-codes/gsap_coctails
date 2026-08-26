 const buildPaginationMeta = ({ page, limit, total }) => {
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };
};

export { buildPaginationMeta };