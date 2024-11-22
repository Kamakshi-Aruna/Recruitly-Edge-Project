import { useEffect, useState } from "react";
import { Button, Flex, Input, message, Popconfirm, Spin, Table } from "antd";
import ky from "ky";
import PropTypes from "prop-types";
import * as XLSX from "xlsx";

import { DownloadOutlined, RollbackOutlined } from "@ant-design/icons";

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
  const [sortField, setSortField] = useState("blacklistDate"); // Default sort field
  const [sortOrder, setSortOrder] = useState("asc"); // Default sort order
  const [appliedSearchTerm, setAppliedSearchTerm] = useState(""); // State for applied search term

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

  const handleExportData = () => {
    // Convert the state variable 'data' to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Convert the worksheet to a CSV format
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

    // Create a blob and download the CSV file
    const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "blacklist_records.csv"); // Name of the exported file
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
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: true, // Enable sorting
    },
    {
      title: "Blacklist Date",
      dataIndex: "blacklistDate",
      key: "blacklistDate",
      render: (text) => (text ? new Date(text).toLocaleDateString() : ""),
      sorter: true, // Enable sorting
    },
    {
      title: "Blacklist Type",
      dataIndex: "blacklistType",
      key: "blacklistType",
      sorter: true, // Enable sorting
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      sorter: true, // Enable sorting
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Popconfirm
          placement="leftBottom"
          title="Confirm Unblock"
          description={`Remove ${record.email} from the blacklist?`}
          onConfirm={() => {
            handleDelete(record.id);
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
      width: 100,
    },
  ];

  const handleTableChange = (pagination, filters, sorter) => {
    setPage(pagination.current);
    setPageSize(pagination.pageSize);
    // Get the sorting field and order from sorter
    if (sorter.field) {
      setSortField(sorter.field);
      setSortOrder(sorter.order === "ascend" ? "asc" : "desc");
    } else {
      setSortField("blacklistDate"); // Reset to default if not sorting
      setSortOrder("asc");
    }
  };

  return (
    <div>
      <Flex style={{ marginBottom: 16 }} align="middle" justify="space-between">
        <Search
          allowClear
          placeholder="Search..."
          onSearch={(val) => {
            setAppliedSearchTerm(val);
          }}
          style={{ width: 200 }}
        />
        <div>
          <Button size="small" type="primary" icon={<DownloadOutlined />} onClick={handleExportData}>
            Export to Excel
          </Button>
        </div>
      </Flex>

      <Spin spinning={isLoading}>
        <Table
          bordered
          columns={columns}
          dataSource={data}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: totalRecords,
          }}
          onChange={handleTableChange} // Use onChange for pagination and sorting
          rowKey={(record) => record.id} // Ensure unique row keys
        />
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
