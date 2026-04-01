/**
 * Utility to export an array of objects to a CSV file.
 * @param data Array of objects to export
 * @param filename Name of the file (without extension)
 */
export const exportToCSV = (data: any[], filename: string) => {
  if (!data || !data.length) {
    alert('No hay datos para exportar');
    return;
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Transform data to CSV rows
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle numbers, strings with commas, and objects (like order items)
        if (value === null || value === undefined) return '""';
        if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        const strValue = String(value).replace(/"/g, '""');
        return strValue.includes(',') ? `"${strValue}"` : strValue;
      }).join(',')
    )
  ];

  const csvContent = csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
