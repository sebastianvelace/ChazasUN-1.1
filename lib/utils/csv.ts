/** Escape CSV field per RFC 4180-style (Excel-friendly). */
export function escapeCsvCell(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function rowsToCsv(headers: string[], rows: string[][]): string {
  const line = (cells: string[]) => cells.map(escapeCsvCell).join(",")
  return [line(headers), ...rows.map((r) => line(r))].join("\r\n")
}
