
export const mapCategoriesToIds = (categoryStrings: string[]): number[] => {
  return categoryStrings
    .map((cat) => {
      const id = parseInt(cat, 10);
      return isNaN(id) ? null : id;
    })
    .filter((id): id is number => id !== null);
};

