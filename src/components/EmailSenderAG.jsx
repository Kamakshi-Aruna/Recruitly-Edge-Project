import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import ky from 'ky'; // Ensure that ky is installed via npm or yarn
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const EmailSenderAG = () => {


  // Column definitions for the table
  const columnDefs = [
    { headerName: 'S.No', field: 'sNo' },
    { headerName: 'From Name', field: 'fromName' },
    { headerName: 'From Email', field: 'fromEmail' },
    { headerName: 'Reply To', field: 'replyTo' },
    { headerName: 'Created By', field: 'createdBy' },
    { headerName: 'Created On', field: 'createdOn' },
    { headerName: 'Domain Verified', field: 'domainVerified' },
    { headerName: 'Action', field: 'action' }
  ];

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await ky
          .get(`${apiServer}/api/marketing/senders`, {
            searchParams: {
              page,
              limit: pageSize,
              sort: sortField,
              order: sortOrder,
            },
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
          })
          .json();

        // Assuming the response is an object with a 'data' array
        setRowData(response.data); // Set the response data in state
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false); // Stop loading once the API call is finished
      }
    };

    fetchData();
  }, [apiServer, apiKey, page, pageSize, sortField, sortOrder]);

  return (
    <div>
      <h1>Email Senders</h1>

      {/* Loading Spinner */}
      {loading && <div>Loading...</div>}

      {/* AG Grid Table */}
      <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
        <AgGridReact
          columnDefs={columnDefs}
          rowData={rowData}
          pagination={true}
          domLayout="autoHeight"
        />
      </div>
    </div>
  );
};

export default EmailSenderAG;
