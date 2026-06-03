export function generateSchoolDays(startDate: string, daysCount: number): string[] {
  const days: string[] = [];
  const start = new Date(startDate);
  let current = new Date(start);

  while (days.length < daysCount) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      const yyyy = current.getFullYear();
      const mm = String(current.getMonth() + 1).padStart(2, '0');
      const dd = String(current.getDate()).padStart(2, '0');
      days.push(`${yyyy}-${mm}-${dd}`);
    }
    current.setDate(current.getDate() + 1);
  }

  return days;
}
