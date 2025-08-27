   // Converter para CSV
   exports.convertToCSV = (data) => {
     if (!data || !data.length) return '';
     
     const headers = Object.keys(data[0]).join(',');
     const rows = data.map(item => {
       return Object.values(item).map(value => {
         if (typeof value === 'string' && value.includes(',')) {
           return `"${value}"`;
         }
         return value;
       }).join(',');
     });
     
     return [headers, ...rows].join('\n');
   };

   // Converter para Excel (XLSX)
   exports.convertToXLSX = (data) => {
     // Aqui você usaria uma biblioteca como xlsx
     // Por enquanto, vamos retornar o mesmo CSV
     return exports.convertToCSV(data);
   };
