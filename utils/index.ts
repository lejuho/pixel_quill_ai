
export const createPageUrl = (pageName: string): string => {
  if (!pageName) return '/';
  return `/${pageName.toLowerCase()}`;
};
