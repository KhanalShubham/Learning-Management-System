export interface CsvColumn<T> {
  label: string;
  value: (row: T) => string | number;
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const escape = (v: string | number) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const headerRow = columns.map((c) => escape(c.label)).join(',');
  const dataRows = rows.map((row) => columns.map((c) => escape(c.value(row))).join(','));
  return [headerRow, ...dataRows].join('\n');
}

export function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
