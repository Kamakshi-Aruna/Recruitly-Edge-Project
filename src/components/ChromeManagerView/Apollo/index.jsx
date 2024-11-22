import { Avatar, Button, Card, Col, Flex, Popconfirm, Row, Spin, Statistic, Tabs, Typography } from "antd";

import { DeleteOutlined } from "@ant-design/icons";
import { useFetchAnalytics, useFetchCompanyRequests, useFetchPeopleRequests } from "@hooks/api/useChromeManagerApi";
import { useDeleteImport } from "@hooks/api/useChromeManagerApi";
import { Buildings, CalendarDots, Users } from "@phosphor-icons/react";

import { IMPORT_TYPES } from "../constants";
import StatusTag from "../StatusTag";

import { getStatusBadge, TAB_ITEMS } from "./utils";

const { Text } = Typography;

const ApolloManagerView = () => {
  const { data: peopleData, isLoading: isPeopleLoading } = useFetchPeopleRequests();

  const { data: companiesData, isLoading: isCompaniesLoading } = useFetchCompanyRequests();

  const { data: importSummaryData, isLoading: isSummaryLoading } = useFetchAnalytics();

  const { mutate: deleteImport } = useDeleteImport();

  const renderListItem = (record, type) => (
    <div
      style={{
        marginBottom: "16px",
        paddingBottom: "16px",
        borderBottom: "1px solid #efefef",
      }}
    >
      <Flex gap="middle" justify="space-between" align={"center"}>
        <div>
          <Text size={"small"}>
            <Flex align={"center"} gap={"small"}>
              <Avatar style={{ backgroundColor: "#efefef" }} icon={<CalendarDots color={"darkslategray"} />}></Avatar> Initiated by {record.userEmail} on{" "}
              {new Date(record.requestedDate).toLocaleDateString()}
              {type === IMPORT_TYPES.people_import && <> to import as {record.recordType}</>}
            </Flex>
          </Text>
        </div>
      </Flex>
      <div style={{ marginTop: "10px" }}>
        <Flex justify="start" gap={"small"} align={"center"}>
          {getStatusBadge(record.overallStatus || record.status)}
          <StatusTag label="Total Requested" value={record.totalRequested} />
          <StatusTag label="Extracted" value={record.totalSynched} />
          <StatusTag label="In Progress" value={record.totalInProgress} />
          <StatusTag label="Imported" value={record.totalImported} />
          <StatusTag label="Skipped" value={record.totalSkipped} />
          <StatusTag label="Failed" value={record.totalErrors} />
          <div>
            <Popconfirm
              placement="leftBottom"
              title="Confirm Delete"
              onConfirm={() =>
                deleteImport({
                  requestId: record._id,
                  type,
                })
              }
              okText="Yes"
              cancelText="No"
            >
              <Button color="danger" variant={"text"} size="small">
                <DeleteOutlined /> Delete
              </Button>
            </Popconfirm>
          </div>
        </Flex>
      </div>
    </div>
  );

  return (
    <Flex gap="middle" vertical>
      <Card size={"small"} style={{ backgroundColor: "#fafafa" }}>
        <Row gutter={16}>
          <Col span={8}>
            <Spin spinning={isSummaryLoading}>
              <Statistic
                title={
                  <Flex align="center" gap="small">
                    <Users /> People Imported
                  </Flex>
                }
                value={importSummaryData?.peopleImported}
                precision={0}
                valueStyle={{ fontWeight: "bold", fontSize: "32px" }}
              />
            </Spin>
          </Col>
          <Col span={8}>
            <Spin spinning={isSummaryLoading}>
              <Statistic
                title={
                  <Flex align="center" gap="small">
                    <Buildings /> Companies Imported
                  </Flex>
                }
                value={importSummaryData?.companiesImported}
                precision={0}
                valueStyle={{ fontWeight: "bold", fontSize: "32px" }}
              />
            </Spin>
          </Col>
        </Row>
      </Card>

      <Card size="small">
        <Tabs
          defaultActiveKey="1"
          items={TAB_ITEMS({
            isCompaniesLoading,
            isPeopleLoading,
            companiesData,
            peopleData,
            renderListItem,
          })}
        />
      </Card>
    </Flex>
  );
};

export default ApolloManagerView;
