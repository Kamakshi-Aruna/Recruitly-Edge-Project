import { useState } from "react";
import { Avatar, Card, Drawer, Flex, Input, List, Menu, Popover, Timeline, Tooltip, Typography } from "antd";
import { FiMapPin, FiUser } from "react-icons/fi";
import { TbCheck, TbCurrencyDollar, TbFileText, TbPhone, TbSearch, TbSend, TbUserCheck } from "react-icons/tb";
import { useShallow } from "zustand/react/shallow";

import { BuildingOffice } from "@phosphor-icons/react";
import { getDateMoment } from "@utils/dateUtil.js";

import useEdgeInitializer from "../../stores/useEdgeInitializer";
import JobPipelineView from "../JobPipeline";

import { useFetchAllOpenJobs, useFetchJobStats, useFetchMyJobs } from "./hooks/api/useJobsApi";
import useUserActivityStore, { ACTIVITY_TYPES } from "./stores/userActivityStore";
import { JOB_TYPES, JOB_TYPES_OPTIONS, PIPELINE_DATA_TYPE } from "./constants";
import { renderInitials } from "./utils";

const { Text } = Typography;
const { Search } = Input;

const GlobalPipeline = (props) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [jobType, setJobType] = useState(JOB_TYPES.my_jobs);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: myJobs, isLoading: isMyJobsLoading } = useFetchMyJobs({
    searchTerm,
    enabled: jobType === JOB_TYPES.my_jobs,
  });

  const { data: allOpenJobs, isLoading: isOpenJobsLoading } = useFetchAllOpenJobs({
    searchTerm,
    enabled: jobType === JOB_TYPES.all_jobs,
  });
  const { setLastViewed } = useUserActivityStore();

  const params = {
    jobType,
    jobIds: jobType === JOB_TYPES.my_jobs ? myJobs?.map(({ id }) => id) : allOpenJobs?.map(({ id }) => id),
  };

  const { data: jobStats } = useFetchJobStats(params);

  const [selectedJobId, setSelectedJobId] = useState(props?.jobId || "");

  const [selectedJobIdDummy, setSelectedJobIdDummy] = useState(selectedJobId);

  const [pipelineDataType, setPipelineDataType] = useState(!selectedJobId ? PIPELINE_DATA_TYPE.all_my_open_jobs : null);

  const [pipelineDataTypeDummy, setPipelineDataTypeDummy] = useState(!selectedJobId ? PIPELINE_DATA_TYPE.all_my_open_jobs : null);

  const { setEdgePipelineDataType, setJobId } = useEdgeInitializer(
    useShallow((state) => ({
      setJobId: state.setJobId,
      setEdgePipelineDataType: state.setPipelineDataType,
    })),
  );

  const handleJobChange = (jobId) => {
    setPipelineDataTypeDummy(null);
    setSelectedJobId(jobId);
    setJobId(jobId);
    setPipelineDataType(null);
    setLastViewed({ type: ACTIVITY_TYPES.job, id: jobId });
  };

  const handlePipelineDataTypeChange = (value) => {
    setPipelineDataType(value);
    setEdgePipelineDataType(value);
    setSelectedJobIdDummy(null);
    setJobId(null);
    setSelectedJobId(null);
    setLastViewed({ type: ACTIVITY_TYPES.pipeline_data, id: value });
  };

  const currentJobStats = (id) => jobStats?.find(({ jobId }) => id === jobId);

  const renderLogo = (job) => {
    const website = job.company?.website;
    let logoSrc = "";

    if (website) {
      const url = new URL(website);
      const domain = url.hostname.replace("www.", "");
      logoSrc = `https://logo.clearbit.com/${domain}`;
    }
    return (
      <Tooltip zIndex={9999} title={website} overlayStyle={{ fontSize: "12px" }}>
        <Avatar
          shape="square"
          size={35}
          src={logoSrc}
          style={{ backgroundColor: "#ededed" }}
          onClick={(e) => {
            e.stopPropagation();
            if (job.company.website) {
              window.open(job.company.website, "_blank");
            }
          }}
        >
          <Text
            ellipsis
            style={{
              fontSize: "small",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              width: "100%",
            }}
          >
            {renderInitials(job.company?.name)}
          </Text>
        </Avatar>
      </Tooltip>
    );
  };

  const handleJobsTypeSelect = ({ key }) => {
    setIsDrawerOpen(false);

    setPipelineDataTypeDummy(key);
    setTimeout(() => {
      handlePipelineDataTypeChange(key);
    }, 200);
  };

  const handleJobSelect = (job) => {
    setIsDrawerOpen(false);

    setSelectedJobIdDummy(job.id);
    setTimeout(() => {
      handlePipelineDataTypeChange(job.id);
      handleJobChange(job.id);
    }, 50);
  };

  const renderJobLocation = (item) => {
    return [item.location.cityName, item.location.regionName, item.location.countryName]
      .filter(Boolean) // Removes any empty values
      .join(", ");
  };

  const renderJobTitle = (job) => {
    return (
      <>
        <Flex justify="flex-start" align="center" style={{ gap: "4px" }}>
          <Text ellipsis style={{ fontSize: "14px", fontWeight: 500 }}>
            {job.title}
          </Text>
        </Flex>
        <Flex vertical={false} justify={"start"} align={"center"} style={{ width: "100%" }}>
          <Text
            ellipsis
            title={job.company?.name}
            type={"secondary"}
            style={{
              fontSize: "12px",
              fontWeight: "normal",
              display: "flex",
              alignItems: "center",
              paddingRight: 0,
              paddingLeft: 0,
            }}
          >
            <BuildingOffice size={10} style={{ marginRight: 4 }} />
            {job.company?.name}
          </Text>
        </Flex>
      </>
    );
  };

  const getPipelineStatusIcon = (statusCode) => {
    const statusMap = {
      SOURCED: <TbSearch size={15} color="#8e8e8e" />,
      APPLIED: <TbSend size={15} color="#1890ff" />,
      SHORTLIST: <TbUserCheck size={15} color="#52c41a" />,
      CV_SENT: <TbFileText size={15} color="#faad14" />,
      INTERVIEW: <TbPhone size={15} color="#fa8c16" />,
      OFFER: <TbCurrencyDollar size={15} color="#13c2c2" />,
      PLACED: <TbCheck size={15} color="#52c41a" />,
    };

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "25px",
          height: "25px",
          borderRadius: "50%",
          backgroundColor: "#f0f0f0", // Background color for the circle
        }}
      >
        {statusMap[statusCode] || null}
      </div>
    );
  };

  const renderPopoverContent = (job) => {
    const currentStats = currentJobStats(job.id);

    const renderTimelineContent = (stats) => {
      return (
        <div>
          <Flex vertical={true}>{stats.name}</Flex>
          <Flex vertical={true}>
            <Text type={"secondary"} style={{ fontSize: 12 }}>
              Candidates : {stats.count}
            </Text>
          </Flex>
          <Flex vertical={true}>
            <Text type={"secondary"} style={{ fontSize: 12 }}>
              Last updated : {getDateMoment(stats.recentCandidate.updatedOn)}
            </Text>
          </Flex>
        </div>
      );
    };

    return (
      <Card key={job.id} type={"inner"} style={{ border: 0, padding: 0, margin: 0 }}>
        <Flex vertical justify={"start"} align={"center"}>
          <Flex align="center" gap={10} style={{ marginBottom: "auto", width: "100%" }}>
            {renderLogo(job)}
            <Flex vertical align="start" justify="center" style={{ flexGrow: 1 }} gap={0}>
              <Text
                type={"secondary"}
                style={{
                  fontSize: "10px",
                  color: "#6b7483",
                }}
              >
                {job.reference}
              </Text>
              <Text
                className="recruitly-popover-jobtitle"
                style={{ fontSize: "14px", fontWeight: "500", cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  // executePipelineAction({ key: PIPELINE_ACTION_NAMES.VIEW_JOB, selectedItems: [job.id], queryClient });
                }}
              >
                {job?.title}
              </Text>
              {(job.location?.countryCode || job.location?.regionName) && (
                <Tooltip title={renderJobLocation(job)} overlayStyle={{ fontSize: 12 }}>
                  <Flex align="center" gap="small">
                    <FiMapPin size={12} style={{ marginRight: 4 }} />
                    <Text ellipsis color="secondary" style={{ fontSize: 11, color: "#52525b" }}>
                      {renderJobLocation(job)}
                    </Text>
                  </Flex>
                </Tooltip>
              )}
            </Flex>
          </Flex>

          <Flex vertical={true} style={{ marginTop: 10, marginBottom: 10, width: "100%" }} gap={5} justify="flex-start">
            {job.recruitingTeam?.members.length > 0 && (
              <Flex align="center" gap={5}>
                <Card bordered style={{ padding: 0, border: 0 }} styles={{ body: { padding: 0 } }}>
                  <Avatar.Group>
                    {job.recruitingTeam?.members.map((member) => (
                      // eslint-disable-next-line react/jsx-key
                      <Tooltip zIndex={9999999} title={member.role} overlayStyle={{ fontSize: 12 }}>
                        <Avatar key={member._id} src={member.profileImageUrl}>
                          {renderInitials(member.name)}
                        </Avatar>
                      </Tooltip>
                    ))}
                  </Avatar.Group>
                </Card>
              </Flex>
            )}

            {job.company?.name && (
              <Flex align="center" gap={5}>
                <BuildingOffice size={12} style={{ marginRight: 4, color: "#52525b" }} />
                <Text ellipsis color="secondary" style={{ fontSize: 12, color: "#52525b" }}>
                  {job.company?.name}
                </Text>
              </Flex>
            )}

            {job.contact && (
              <Flex align="center" gap={5}>
                <FiUser size={12} style={{ marginRight: 4, color: "#52525b" }} />
                <Text ellipsis color="secondary" style={{ fontSize: 12, color: "#52525b" }}>
                  {job.contact?.firstName}
                </Text>
              </Flex>
            )}
          </Flex>
          <Flex vertical={true} style={{ marginTop: 10, marginBottom: 10, width: "100%" }} gap={5} justify="flex-start">
            {currentStats ? (
              <Timeline
                items={currentStats.counts.map((stats) => ({
                  children: renderTimelineContent(stats),
                  dot: <Tooltip title={stats.count}>{getPipelineStatusIcon(stats.statusCode)}</Tooltip>,
                }))}
              />
            ) : (
              "No candidates yet."
            )}
          </Flex>
        </Flex>
      </Card>
    );
  };

  return (
    <>
      <Drawer title="Jobs" placement="left" closable={true} onClose={() => setIsDrawerOpen(false)} open={isDrawerOpen} key="left">
        <Flex className={"globalpipeline-jobs-drawer"} vertical gap="middle" style={{ marginRight: 12 }}>
          <Menu
            mode="vertical"
            selectedKeys={[pipelineDataTypeDummy]}
            items={[
              {
                key: PIPELINE_DATA_TYPE.all_my_open_jobs,
                value: PIPELINE_DATA_TYPE.all_my_open_jobs,
                label: "All my open jobs",
              },
              {
                key: PIPELINE_DATA_TYPE.all_users_open_jobs,
                value: PIPELINE_DATA_TYPE.all_users_open_jobs,
                label: "All users open jobs",
              },
            ]}
            onSelect={handleJobsTypeSelect}
          />
          <Card
            bordered={false}
            tabProps={{
              size: "middle",
              onTabClick: setJobType,
            }}
            style={{ border: 0, boxShadow: "none" }}
            styles={{ body: { padding: 0, border: 0, boxShadow: "none" } }}
            tabList={JOB_TYPES_OPTIONS}
          >
            <Search placeholder="Search jobs" allowClear onSearch={setSearchTerm} style={{ width: "100%", paddingBottom: 10, paddingTop: 10 }} />
            <List
              style={{ overflow: "scroll", maxHeight: "68vh", border: 0, boxShadow: "none" }}
              itemLayout="horizontal"
              loading={isOpenJobsLoading || isMyJobsLoading}
              dataSource={jobType === JOB_TYPES.my_jobs ? myJobs : allOpenJobs}
              renderItem={(job) => (
                <Popover overlayStyle={{ padding: 0 }} content={renderPopoverContent(job)} style={{ width: "280px" }} placement={"right"} key={job.id} title={"Job Info"} showArrow={true}>
                  <List.Item
                    style={{
                      cursor: "pointer",
                      backgroundColor: selectedJobIdDummy === job.id ? "#e6f2ff" : "white",
                    }}
                    onClick={() => handleJobSelect(job)}
                  >
                    <List.Item.Meta style={{ margin: 0 }} avatar={renderLogo(job)} description={renderJobTitle(job)} />
                  </List.Item>
                </Popover>
              )}
            />
          </Card>
        </Flex>
      </Drawer>
      <JobPipelineView pipelineDataType={pipelineDataType} jobId={selectedJobId} setIsJobsListDrawerOpen={setIsDrawerOpen} {...props} isGlobalPipeline />
    </>
  );
};

export default GlobalPipeline;
