import { Flex, Spin, Tag } from "antd";

import { LoadingOutlined } from "@ant-design/icons";
import { Buildings, Users } from "@phosphor-icons/react";

import { IMPORT_TYPES } from "../constants";

import TabContent from "./TabContent";

const statusMapping = {
  DATA_READY: () => (
    <Tag color="green">
      <Spin indicator={<LoadingOutlined spin />} size="small" style={{ marginRight: 5, color: "#4acf24" }} />
      Importing
    </Tag>
  ),
  DATA_PENDING: () => (
    <Tag color="geekblue">
      <Spin indicator={<LoadingOutlined spin />} size="small" style={{ marginRight: 5, color: "blue" }} />
      Extracting Data
    </Tag>
  ),
  PENDING: () => (
    <Tag color="geekblue">
      <Spin indicator={<LoadingOutlined spin />} size="small" style={{ marginRight: 5, color: "blue" }} />
      Extracting Data
    </Tag>
  ),
  IN_PROGRESS: () => <Tag color="orange">In Progress</Tag>,
  COMPLETED: () => <Tag color="green">Success</Tag>,
  SKIPPED: () => <Tag color="green">Skipped</Tag>,
  FAILED: () => <Tag color="red">Failed</Tag>,
};

/**
 * Function to get the status badge based on the provided value.
 *
 * @param {string} value - The status value to determine the badge.
 * @returns {JSX.Element} The corresponding badge component or a default badge.
 */
export const getStatusBadge = (value) => {
  const BadgeComponent = statusMapping[value] || (() => <Tag color="gray">Unknown</Tag>);
  return <BadgeComponent />;
};

export const TAB_ITEMS = ({ isPeopleLoading, peopleData, isCompaniesLoading, companiesData, renderListItem }) => [
  {
    key: "1",
    label: (
      <Flex align="center" gap="small">
        <Users /> People Requests
      </Flex>
    ),
    children: <TabContent loading={isPeopleLoading} data={peopleData} renderItem={renderListItem} importType={IMPORT_TYPES.people_import} />,
  },
  {
    key: "2",
    label: (
      <Flex align="center" gap="small">
        <Buildings /> Company Requests
      </Flex>
    ),
    children: <TabContent loading={isCompaniesLoading} data={companiesData} renderItem={renderListItem} importType={IMPORT_TYPES.company_import} />,
  },
];
