/**
 * Returns true if `date` is strictly before `dateToCompare`.
 */
export function dateIsBefore(date: Date, dateToCompare: Date): boolean {
  return date.getTime() < dateToCompare.getTime();
}

/**
 * Returns a new Date that is `seconds` seconds after the given `date`.
 */
export function dateAddSeconds(date: Date, seconds: number): Date {
  return new Date(date.getTime() + seconds * 1000);
}

/**
 * Formats a Date as 'HH:mm dd/MM/yyyy'.
 */
export function dateFormat(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');

  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();

  return `${hours}:${minutes} ${day}/${month}/${year}`;
}
