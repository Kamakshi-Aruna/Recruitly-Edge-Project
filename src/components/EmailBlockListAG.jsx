import { useEffect, useState,useRef } from "react";
import { Button, Input, message, Popconfirm, Spin,Flex } from "antd";
import ky from "ky";
import PropTypes from "prop-types";
import * as XLSX from "xlsx";
import { DownloadOutlined, RollbackOutlined } from "@ant-design/icons";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
 
const { Search } = Input;
 
const fetchEmailBlacklist = async (page, pageSize, sortField, sortOrder, searchTerm, apiServer, apiKey) => {
  return await ky
    .get(`${apiServer}/api/marketing/email_blacklist`, {
      searchParams: {
        page,
        limit: pageSize,
        sort: sortField,
        order: sortOrder, // 'asc' or 'desc'
        search: searchTerm, // Include the search term in the API request
      },
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })
    .json();
};
 
const EmailBlacklistGrid = ({ apiServer, apiKey }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortField, setSortField] = useState("blacklistDate");
  const [sortOrder, setSortOrder] = useState("asc");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const gridApiRef = useRef(null);  // Ref to store the grid API
 
  // Fetch data from API with pagination, sorting, and search term
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const result = await fetchEmailBlacklist(page, pageSize, sortField, sortOrder, appliedSearchTerm, apiServer, apiKey);
      if (result && result.data) {
        setData(result.data);
        setTotalRecords(result.totalRecords || 0);
      } else {
        setData([]);
      }
      setIsError(false);
    } catch (ex) {
      console.error(ex);
      setIsError(true);
      message.error("Failed to load email blacklist data");
    } finally {
      setIsLoading(false);
    }
  };
 
  useEffect(() => {
    fetchData();
  }, [page, pageSize, sortField, sortOrder, appliedSearchTerm, apiServer, apiKey]);
 
  useEffect(() => {
    // Resize columns to fit after data is loaded
    if (gridApiRef.current) {
      gridApiRef.current.sizeColumnsToFit();
    }
  }, [data]);  
 
  const handleExportData = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "blacklist_records.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success("Data exported successfully");
  };
 
  const handleDelete = async (id) => {
    try {
      await ky.delete(`${apiServer}/api/marketing/email_blacklist?id=${id}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });
      message.success("Email successfully deleted");
      fetchData(page, pageSize, sortField, sortOrder, appliedSearchTerm);
    } catch (ex) {
      console.error(ex);
      message.error("Failed to delete email");
    }
  };
 
  const columns = [
    {
      headerName: "Email",
      field: "email",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Blacklist Date",
      field: "blacklistDate",
      sortable: true,
      valueFormatter: (params) => (params.value ? new Date(params.value).toLocaleDateString() : ""),
      filter: true,
    },
    {
      headerName: "Blacklist Type",
      field: "blacklistType",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Reason",
      field: "reason",
      sortable: true,
      filter: true,
    },
    {
    headerName: "Action",
    field: "action",
    cellRenderer: (params) => (
      <Popconfirm
        placement="leftBottom"
        title="Confirm Unblock"
        description={`Remove ${params.data.email} from the blacklist?`}
        onConfirm={() => {
          handleDelete(params.data.id);
        }}
        okText="Yes"
        cancelText="No"
      >
        <Button style={{ gap: "7px" }} color="default" variant="filled" size="small">
          <RollbackOutlined size="sm" />
          Unblock
        </Button>
      </Popconfirm>
    ),
    width: 150,
  },
  ];
 
  const onGridReady = (params) => {
    gridApiRef.current = params.api;  
    params.api.sizeColumnsToFit();
  };
 
  const handleSearch = (val) => {
    setAppliedSearchTerm(val);
  };
 
  const handlePaginationChange = (newPage, newPageSize) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };
 
  return (
    <div>
      <Flex style={{ marginBottom: 16 }} align="middle" justify="space-between">
        <Search
          allowClear
          placeholder="Search..."
          onSearch={handleSearch}
          style={{ width: 200 }}
        />
        <div>
          <Button size="small" type="primary" icon={<DownloadOutlined />} onClick={handleExportData}>
            Export to Excel
          </Button>
        </div>
      </Flex>
 
      <Spin spinning={isLoading}>
        <div className="ag-theme-alpine" style={{ height: "400px", width: "100%" }}>
          <AgGridReact
            columnDefs={columns}
            rowData={data}
            pagination={true}
            paginationPageSize={pageSize}
            onGridReady={onGridReady}
            onPaginationChanged={(e) => {
              const pagination = e.api.paginationGetCurrentPage();
              const size = e.api.paginationGetPageSize();
              handlePaginationChange(pagination + 1, size);
            }}
            onSortChanged={(e) => {
              const sortModel = e.api.getSortModel();
              if (sortModel.length > 0) {
                setSortField(sortModel[0].colId);
                setSortOrder(sortModel[0].sort);
              }
            }}
            rowSelection="single"
            domLayout="autoHeight"
            suppressCellSelection={true}
          />
        </div>
      </Spin>
      {isError && <p style={{ color: "red" }}>Failed to load email blacklist data</p>}
    </div>
  );
};
 
// Define prop types for component
EmailBlacklistGrid.propTypes = {
  apiServer: PropTypes.string.isRequired,
  apiKey: PropTypes.string.isRequired,
};
 
export default EmailBlacklistGrid;