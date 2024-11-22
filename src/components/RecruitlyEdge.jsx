import { useState } from "react";
import { ConfigProvider, Drawer, Image, Layout, Menu } from "antd";
import { HashRouter as Router, Link, Route, Routes } from "react-router-dom";

import { EnvelopeSimple, GlobeHemisphereEast, Kanban } from "@phosphor-icons/react";

import ApiProvider from "../providers/AuthProvider.jsx";
import styleToken from "../styleToken.js";

import ApolloManagerView from "./ChromeManagerView/Apollo/index.jsx";
import ChromeManagerView from "./ChromeManagerView/index.jsx";
import GlobalPipeline from "./GlobalPipeline/index.jsx";
import JobPipelineView from "./JobPipeline/index.jsx";
import EmailBlacklistGrid from "./EmailBlacklistGrid.jsx";
import EmailBlacklistAG from "./EmailBlockListAG.jsx";
import EmailSenderAG from "./EmailSenderAG.jsx";

const { Content, Sider } = Layout;

const EmailBlacklistGridWithProvider = (props) => (
  <ConfigProvider theme={styleToken}>
    <EmailBlacklistGrid {...props} />
  </ConfigProvider>
);

const EmailBlacklistGridWithProviderAG = (props) => (
  <ConfigProvider theme={styleToken}>
    <EmailBlacklistAG {...props} />
  </ConfigProvider>
);

const EmailSenderGridWithProviderAG = (props) => (
  <ConfigProvider theme={styleToken}>
    <EmailSenderAG {...props} />
  </ConfigProvider>
);

const JobPipelineViewWithProvider = (props) => {
  return (
    <ApiProvider {...props}>
      <ConfigProvider theme={styleToken}>
        <JobPipelineView jobId={props.jobId} />
      </ConfigProvider>
    </ApiProvider>
  );
};

const GlobalPipelineViewWithProvider = (props) => {
  return (
    <ApiProvider {...props}>
      <ConfigProvider theme={styleToken}>
        <GlobalPipeline {...props} />
      </ConfigProvider>
    </ApiProvider>
  );
};

const JobPipelineViewSidebar = ({ title = "Job Pipeline", width = 1050, props = {} }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [drawerTitle, setDrawerTitle] = useState(title);

  return (
    <ApiProvider {...props}>
      <ConfigProvider theme={styleToken}>
        <Drawer
          title={drawerTitle || "Job Pipeline"}
          width={width || "large"}
          open={isOpen}
          bodyStyle={{ padding: "6px 12px" }}
          onClose={() => setIsOpen(false)}
          placement="right"
          maskClosable={false}
          destroyOnClose
        >
          {isOpen && <JobPipelineView {...props} setDrawerTitle={setDrawerTitle} />}
        </Drawer>
      </ConfigProvider>
    </ApiProvider>
  );
};

const ApolloManagerViewWithProvider = (props) => (
  <ApiProvider {...props}>
    <ConfigProvider theme={styleToken}>
      <ApolloManagerView {...props} />
    </ConfigProvider>
  </ApiProvider>
);

const ChromeManagerViewWithProvider = (props) => {
  return (
    <ApiProvider {...props}>
      <ConfigProvider theme={styleToken}>
        <ChromeManagerView />
      </ConfigProvider>
    </ApiProvider>
  );
};

const ChromeManagerViewSidebar = ({ title = "Chrome Extension Manager", width = 850, props = {} }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <ApiProvider {...props}>
      <ConfigProvider theme={styleToken}>
        <Drawer
          bodyStyle={{ padding: "6px 12px" }}
          maskClosable={false}
          title={title || "Chrome Extension Manager"}
          width={width || "large"}
          open={isOpen}
          onClose={() => setIsOpen(false)}
          placement="right"
          closeable
        >
          <ChromeManagerView {...props} />
        </Drawer>
      </ConfigProvider>
    </ApiProvider>
  );
};

const RecruitlyEdgeApp = ({ apiServer, jobId, apiKey, edgeUtil, pusher, userId, tenantId }) => {
  const siderStyle = {
    overflow: "auto",
    height: "100vh",
    insetInlineStart: 0,
    top: 0,
    bottom: 0,
    scrollbarWidth: "thin",
    scrollbarColor: "unset",
  };
  const [collapsed, setCollapsed] = useState(false);

  const MENU_ITEMS = [
    {
      key: "1",
      icon: <EnvelopeSimple size={20} />,
      label: <Link to="/email-blacklist">Email Blacklist</Link>,
    },
    {
      key: "2",
      icon: <Kanban size={20} />,
      label: <Link to="/job-pipeline">Job Pipeline</Link>,
    },
    {
      key: "3",
      icon: <Kanban size={20} />,
      label: <Link to="/chrome-manager">Chrome Extensions</Link>,
    },
    {
      key: "4",
      icon: <GlobeHemisphereEast size={20} />,
      label: <Link to="/global-pipeline">Global pipeline</Link>,
    },
    {
      key: "5",
      icon: <EnvelopeSimple size={20} />,
      label: <Link to="/email-blacklistag">Email Blacklist(AG)</Link>,
    },
    {
      key: "6",
      icon: <EnvelopeSimple size={20} />,
      label: <Link to="/email-sender">Email Sender(AG)</Link>,
    }
  ];
  return (
    <Router>
      <Layout
        style={{
          background: "transparent",
          minHeight: "100vh",
          padding: 0,
          margin: 0,
        }}
      >
        <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} style={siderStyle}>
          <Content
            style={{
              padding: "1rem",
              marginLeft: 0,
              marginRight: 0,
              marginTop: "auto",
              marginBottom: "auto",
              textAlign: collapsed ? "center" : "left",
            }}
          >
            <Image src="https://recruitlycdn.com/logos/2024/recruitly-bgblack-trans.png" style={{ height: "25px" }} />
          </Content>
          <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]} style={{ borderRight: 0, height: "auto" }} items={MENU_ITEMS} />
        </Sider>
        <Layout style={{ background: "white" }}>
          <Content style={{ padding: "16px", fontSmooth: "auto" }}>
            <Routes>
              <Route
                path="/"
                element={
                  <EmailBlacklistGridWithProvider
                    {...{
                      apiServer,
                      jobId,
                      apiKey,
                      edgeUtil,
                      pusher,
                      userId,
                      tenantId,
                    }}
                  />
                }
              />
              <Route
                path="/email-blacklist"
                element={
                  <EmailBlacklistGridWithProvider
                    {...{
                      apiServer,
                      jobId,
                      apiKey,
                      edgeUtil,
                      pusher,
                      userId,
                      tenantId,
                    }}
                  />
                }
              />

              <Route
                path="/job-pipeline"
                element={
                  <JobPipelineViewWithProvider
                    {...{
                      apiServer,
                      jobId,
                      apiKey,
                      edgeUtil,
                      pusher,
                      userId,
                      tenantId,
                    }}
                  />
                }
              />
              <Route
                path="/global-pipeline"
                element={
                  <GlobalPipelineViewWithProvider
                    {...{
                      apiServer,
                      apiKey,
                    }}
                  />
                }
              />
              <Route path="/chrome-manager" element={<ChromeManagerViewWithProvider apiServer={apiServer} apiKey={apiKey} />} />
              <Route
                path="/email-blacklistag"
                element={
                  <EmailBlacklistGridWithProviderAG
                    {...{
                      apiServer,
                      jobId,
                      apiKey,
                      edgeUtil,
                      pusher,
                      userId,
                      tenantId,
                    }}
                  />
                }
              />
              <Route
                path="/email-sender"
                element={
                  <EmailSenderGridWithProviderAG
                    {...{
                      apiServer,
                      jobId,
                      apiKey,
                      edgeUtil,
                      pusher,
                      userId,
                      tenantId,
                    }}
                  />
                }
              />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
};

window.ChromeManagerView = ChromeManagerViewWithProvider;
window.ChromeManagerViewSidebar = ChromeManagerViewSidebar;
window.JobPipelineView = JobPipelineViewWithProvider;
window.GlobalPipelineView = GlobalPipelineViewWithProvider;
window.JobPipelineViewSidebar = JobPipelineViewSidebar;
window.EmailBlacklistGrid = EmailBlacklistGridWithProvider;
window.ApolloManagerView = ApolloManagerViewWithProvider;
window.RecruitlyEdgeApp = RecruitlyEdgeApp;

export default RecruitlyEdgeApp;
