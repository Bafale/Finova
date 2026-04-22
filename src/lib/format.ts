// Canadian French currency: "12 450 $"
export function formatCAD(value: number, decimals = 0): string {
  const rounded = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
  const [intPart, decPart] = rounded.split(".");
  const withSpaces = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return decPart ? `${withSpaces},${decPart} $` : `${withSpaces} $`;
}

export function formatDateFR(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" });
}
