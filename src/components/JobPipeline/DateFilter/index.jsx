import { useEffect, useState } from "react";
import { Button, DatePicker, Flex, Form, Input, Popover, Select, Space, Typography } from "antd";

const { RangePicker } = DatePicker;

import dayjs from "dayjs";
import { CiCalendarDate } from "react-icons/ci";
import { useShallow } from "zustand/react/shallow";

import { JOB_PIPELINE_FILTERS } from "@components/JobPipeline/constants.jsx";
import useJobPipelineStore from "@stores/useJobPipelineStore.js";
import { dateRangesList, dateUtcTimeStamp } from "@utils/dateUtil.js";

const { Text } = Typography;

import { DATE_FILTER_FIELD_OPTIONS_LIST } from "./constants";

const getOptions = DATE_FILTER_FIELD_OPTIONS_LIST;

const DateFilter = () => {
  const { filters, setFilters } = useJobPipelineStore(
    useShallow((state) => ({
      setFilters: state.setFilters,
      filters: state.filters,
    })),
  );
  const [localFilters, setLocalFilters] = useState({});

  const handleRangeSelect = (filterObj) => {
    setLocalFilters((localFilter) => ({ ...localFilter, filterData: filterObj, type: filterObj.dateRange }));
    setTimeout(() => {
      setFilters(JOB_PIPELINE_FILTERS.dateFilter, { filterData: filterObj, type: filterObj.dateRange });
    }, 200);
  };

  useEffect(() => {
    setLocalFilters(filters.dateFilter);
  }, [filters.dateFilter]);

  const [form] = Form.useForm();
  const [initialDateRangeValue, setInitialDateRangeValue] = useState([dayjs(), dayjs()]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [popoverVisible, setPopoverVisible] = useState(false);

  const handleFormSubmit = (values) => {
    if (!values || !values.filterBy || values.filterBy.length === 0 || !values.dateRange || !values.dateRange.length === 0) {
      console.error("Invalid date range");
      return false;
    }

    if (values.dateRange === "CUSTOM") {
      if (!values.customDateRange || values.customDateRange.length === 0) {
        console.error("Select Custom Date Range");
        return false;
      }

      const { startDate, endDate } = {
        startDate: values.customDateRange[0]["$d"],
        endDate: values.customDateRange[1]["$d"],
      };

      values["customDate"] = {
        start: dateUtcTimeStamp(startDate),
        end: dateUtcTimeStamp(endDate),
      };

      setInitialDateRangeValue(values.customDateRange);
    } else {
      setInitialDateRangeValue([dayjs(), dayjs()]);
    }

    setPopoverVisible(false);
    handleRangeSelect(values);
  };

  const renderContent = () => (
    <Flex vertical style={{ width: "350px", padding: "10px" }} gap="middle">
      <Text strong>Date Filter</Text>
      <Form
        form={form}
        layout="vertical"
        requiredMark={"optional"}
        onFinish={handleFormSubmit}
        initialValues={{
          filterBy: localFilters && localFilters.filterData && localFilters.filterData.filterBy ? localFilters.filterData.filterBy : [],
          customDateRange: initialDateRangeValue,
        }}
      >
        <Flex vertical gap="middle">
          <Space style={{ width: "100%" }} direction="vertical" size={"small"}>
            <Form.Item name="dateRange" initialValue="CUSTOM" style={{ display: "none" }}>
              <Input type={"hidden"} />
            </Form.Item>
            <Form.Item label="Filter By" required tooltip="Choose the date fields that needs to be filtered" rules={[{ required: true, message: "Please select a filter type" }]} name="filterBy">
              <Select
                mode="multiple"
                showSearch
                allowClear
                style={{ width: "100%" }}
                placeholder="Select fields"
                open={dropdownOpen}
                onDropdownVisibleChange={(open) => {
                  setDropdownOpen(open);
                }}
                onSelect={() => {
                  setDropdownOpen(false);
                }}
                options={getOptions}
              />
            </Form.Item>

            <Form.Item label="Custom Date Range" name="customDateRange" rules={[{ required: true, message: "Please select a custom date range" }]}>
              <RangePicker placement={"bottomCenter"} presets={dateRangesList} format={"DD/MM/YYYY"} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item wrapperCol={2}>
              <Flex justify={"flex-end"} align={"center"}>
                <Button size={"small"} type="primary" htmlType="submit">
                  Apply
                </Button>
              </Flex>
            </Form.Item>
          </Space>
        </Flex>
      </Form>
    </Flex>
  );

  return (
    <Popover
      content={renderContent()}
      open={popoverVisible}
      onOpenChange={() => {
        setPopoverVisible(false);
      }}
      closable={true}
      showArrow={false}
      trigger="click"
      style={{ width: "200px" }}
    >
      <Button
        size="small"
        type={localFilters && localFilters.type ? "primary" : "default"}
        icon={<CiCalendarDate size={18} />}
        onClick={() => {
          setPopoverVisible(!popoverVisible);
        }}
      >
        Date Filter
      </Button>
    </Popover>
  );
};

export default DateFilter;
