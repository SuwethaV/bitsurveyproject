import React, { useState } from 'react';
import { Add, Delete, ContentCopy } from '@mui/icons-material'; // MUI icons for add/delete/copy

const EditableTable = () => {
  const [data, setData] = useState([
    { label: 'Doorstep pickup/dropoff', checked: [false, false, false, false] },
    { label: 'Outbound/inbound transfers', checked: [false, false, false, false] },
    { label: 'Departure/arrival lounges', checked: [false, false, false, false] },
    { label: 'Flights', checked: [false, false, false, false] },
    { label: 'Resort food/beverage options', checked: [false, false, false, false] },
    { label: 'Resort facilities', checked: [false, false, false, false] },
    { label: 'Room', checked: [false, false, false, false] },
    { label: 'Excursions', checked: [false, false, false, false] },
    { label: 'Evening entertainment', checked: [false, false, false, false] },
  ]);

  const [columns, setColumns] = useState([1, 2, 3, 4]); // Column headers

  // Handle checkbox change (only one checkbox per row can be checked)
  const handleCheckboxChange = (rowIndex, colIndex) => {
    const newData = [...data];
    newData[rowIndex].checked = newData[rowIndex].checked.map(() => false); // Uncheck all
    newData[rowIndex].checked[colIndex] = !newData[rowIndex].checked[colIndex]; // Toggle clicked
    setData(newData);
  };

  // Add a new row
  const addRow = () => {
    const newRow = { label: 'New Row', checked: new Array(columns.length).fill(false) };
    setData([...data, newRow]);
  };

  // Delete a row
  const deleteRow = (rowIndex) => {
    const newData = data.filter((_, index) => index !== rowIndex);
    setData(newData);
  };

  // Add a new column
  const addColumn = () => {
    const newColumns = [...columns, columns.length + 1];
    setColumns(newColumns);
    const newData = data.map((row) => ({
      ...row,
      checked: [...row.checked, false], // Add a new checkbox for each row
    }));
    setData(newData);
  };

  // Delete a column
  const deleteColumn = (colIndex) => {
    const newColumns = columns.filter((_, index) => index !== colIndex);
    setColumns(newColumns);
    const newData = data.map((row) => ({
      ...row,
      checked: row.checked.filter((_, index) => index !== colIndex), // Remove the checkbox
    }));
    setData(newData);
  };

  // Update row label
  const updateRowLabel = (rowIndex, newLabel) => {
    const newData = [...data];
    newData[rowIndex].label = newLabel;
    setData(newData);
  };

  // Update column label
  const updateColumnLabel = (colIndex, newLabel) => {
    const newColumns = [...columns];
    newColumns[colIndex] = newLabel;
    setColumns(newColumns);
  };

  // Copy the entire table
  const copyTable = () => {
    const newData = data.map((row) => ({
      ...row,
      checked: [...row.checked], // Deep copy of checked states
    }));
    setData([...data, ...newData]); // Append the copied table
  };

  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5', // Light grey background
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
          backgroundColor: 'white', // White background for the table
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap', // Ensure buttons wrap on smaller screens
          }}
        >
          <h2 style={{ color: '#7e57c2' }}>Editable Table</h2> {/* Light violet heading */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={addRow}
              style={{
                backgroundColor: '#7e57c2',
                color: 'white',
                border: 'none',
                padding: '10px',
                borderRadius: '5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Add style={{ marginRight: '5px' }} /> Add Row
            </button>
            <button
              onClick={addColumn}
              style={{
                backgroundColor: '#7e57c2',
                color: 'white',
                border: 'none',
                padding: '10px',
                borderRadius: '5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Add style={{ marginRight: '5px' }} /> Add Column
            </button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Row</th>
                {columns.map((col, colIndex) => (
                  <th
                    key={colIndex}
                    style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}
                  >
                    <input
                      type="text"
                      value={col}
                      onChange={(e) => updateColumnLabel(colIndex, e.target.value)}
                      style={{
                        width: '50px',
                        padding: '5px',
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        textAlign: 'center',
                      }}
                    />
                    <button
                      onClick={() => deleteColumn(colIndex)}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        marginLeft: '10px',
                        color: '#ff5252', // Red color for delete icon
                      }}
                    >
                      <Delete />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <React.Fragment key={rowIndex}>
                  {rowIndex > 0 && rowIndex % 9 === 0 && ( // Add a separator after every 9 rows
                    <tr>
                      <td colSpan={columns.length + 1} style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd', backgroundColor: '#f0f0f0' }}>
                        Copied Table
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={row.label}
                          onChange={(e) => updateRowLabel(rowIndex, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '5px',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            marginRight: '10px',
                          }}
                        />
                        <button
                          onClick={() => deleteRow(rowIndex)}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#ff5252', // Red color for delete icon
                          }}
                        >
                          <Delete />
                        </button>
                      </div>
                    </td>
                    {row.checked.map((isChecked, colIndex) => (
                      <td
                        key={colIndex}
                        style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}
                      >
                        <label style={{ display: 'block', position: 'relative', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCheckboxChange(rowIndex, colIndex)}
                            style={{ position: 'absolute', opacity: 0, cursor: 'pointer' }}
                          />
                          <span
                            style={{
                              display: 'inline-block',
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              border: '2px solid #7e57c2', // Light violet border
                              backgroundColor: isChecked ? '#7e57c2' : 'transparent',
                            }}
                          ></span>
                        </label>
                      </td>
                    ))}
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            onClick={copyTable}
            style={{
              backgroundColor: '#7e57c2',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              margin: '0 auto',
            }}
          >
            <ContentCopy style={{ marginRight: '5px' }} /> Copy Table
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditableTable;