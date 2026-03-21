import React from 'react';

const DataTable = ({ columns, data }) => {
  return (
    <div className="table-responsive">
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {columns.map((col, idx) => (
              <th key={idx} style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontSize: '13px', fontWeight: '600' }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {columns.map((col, colIdx) => (
                <td key={colIdx} style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', color: '#2d3748' }}>
                  {typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;