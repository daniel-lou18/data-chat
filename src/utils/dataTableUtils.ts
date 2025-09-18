export const formatFilterValue = (filterValue: any): string => {
  if (typeof filterValue === "object" && filterValue.type) {
    const { type, value, secondValue } = filterValue;
    switch (type) {
      case "contains":
        return `contains "${value}"`;
      case "startsWith":
        return `starts with "${value}"`;
      case "endsWith":
        return `ends with "${value}"`;
      case "equals":
        return `= ${value}`;
      case "greaterThan":
        return `> ${value}`;
      case "lessThan":
        return `< ${value}`;
      case "greaterThanOrEqual":
        return `≥ ${value}`;
      case "lessThanOrEqual":
        return `≤ ${value}`;
      case "between":
        return `${value} - ${secondValue}`;
      default:
        return `= ${value}`;
    }
  }
  return Array.isArray(filterValue)
    ? filterValue.join(", ")
    : String(filterValue);
};
