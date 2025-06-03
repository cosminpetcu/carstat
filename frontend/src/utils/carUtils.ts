export const parseImages = (images: string[] | string): string[] => {
    try {
        const parsed = typeof images === "string" ? JSON.parse(images) : images;
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export const getFirstImage = (images: string[] | string): string => {
    const parsed = parseImages(images);
    return parsed[0] || "/default-car.webp";
};