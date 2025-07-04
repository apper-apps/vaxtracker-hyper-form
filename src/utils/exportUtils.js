export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export const exportInventoryReport = (lots, vaccines) => {
  const reportData = lots.map(lot => {
    const vaccine = vaccines.find(v => v.Id === lot.vaccineId);
    return {
      'Vaccine Name': vaccine?.name || 'Unknown',
      'Vaccine Family': vaccine?.family || 'Unknown',
      'Manufacturer': vaccine?.manufacturer || 'Unknown',
      'Lot Number': lot.lotNumber,
      'Expiration Date': new Date(lot.expirationDate).toLocaleDateString(),
      'Quantity Received': lot.quantityReceived,
      'Quantity On Hand': lot.quantityOnHand,
      'Date Received': new Date(lot.dateReceived).toLocaleDateString(),
      'Passed Inspection': lot.passedInspection,
      'Failed Inspection': lot.failedInspection
    };
  });

  const filename = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
  exportToCSV(reportData, filename);
};

export const exportAdministrationReport = (administrations, lots, vaccines) => {
  const reportData = administrations.map(admin => {
    const lot = lots.find(l => l.Id === admin.lotId);
    const vaccine = vaccines.find(v => v.Id === lot?.vaccineId);
    return {
      'Vaccine Name': vaccine?.name || 'Unknown',
      'Lot Number': lot?.lotNumber || 'Unknown',
      'Age Group': admin.ageGroup,
      'Doses Administered': admin.dosesAdministered,
      'Date Administered': new Date(admin.dateAdministered).toLocaleDateString(),
      'Administered By': admin.administeredBy,
      'Expiration Date': lot ? new Date(lot.expirationDate).toLocaleDateString() : 'Unknown'
    };
  });

  const filename = `administration-report-${new Date().toISOString().split('T')[0]}.csv`;
  exportToCSV(reportData, filename);
};

export const exportExpirationReport = (lots, vaccines) => {
  const today = new Date();
  const reportData = lots
    .filter(lot => {
      const expDate = new Date(lot.expirationDate);
      const daysUntilExpiry = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 60; // Show items expiring within 60 days
    })
    .map(lot => {
      const vaccine = vaccines.find(v => v.Id === lot.vaccineId);
      const expDate = new Date(lot.expirationDate);
      const daysUntilExpiry = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
      return {
        'Vaccine Name': vaccine?.name || 'Unknown',
        'Lot Number': lot.lotNumber,
        'Expiration Date': expDate.toLocaleDateString(),
        'Quantity On Hand': lot.quantityOnHand,
        'Days Until Expiry': daysUntilExpiry,
        'Status': daysUntilExpiry < 0 ? 'Expired' : daysUntilExpiry <= 30 ? 'Expiring Soon' : 'Expiring',
        'Priority': daysUntilExpiry < 0 ? 'Critical' : daysUntilExpiry <= 7 ? 'High' : daysUntilExpiry <= 30 ? 'Medium' : 'Low'
      };
    })
    .sort((a, b) => a['Days Until Expiry'] - b['Days Until Expiry']);

  const filename = `expiration-report-${new Date().toISOString().split('T')[0]}.csv`;
  exportToCSV(reportData, filename);
};