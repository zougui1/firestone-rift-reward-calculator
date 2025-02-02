export const arrayToCsv = (data: Record<string, unknown>[]) => {
  if (!data.length) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add headers
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Escape double quotes and wrap in quotes if needed
      return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
    });

    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}
