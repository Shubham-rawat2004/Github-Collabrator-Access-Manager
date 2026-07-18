export function formatDateTimeIST(value: Date | string | null | undefined) {
  if (!value) {
    return "n/a";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "n/a";
  }

  return `${new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata"
  }).format(date)} IST`;
}
