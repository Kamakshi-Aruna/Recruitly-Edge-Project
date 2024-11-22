import { useState } from "react";
import { Button, Card, Flex, Layout, Segmented, Typography } from "antd";
import { IoExtensionPuzzle } from "react-icons/io5";

import { ChromeFilled, LinkedinFilled } from "@ant-design/icons";
import { ApolloIcon } from "@assets/ApolloIcon.jsx";

import ChromeOnboardingView from "../ChromeOnboardingView.jsx";

import ApolloManagerView from "./Apollo/index.jsx";
import { RECRUITLY_EXTENSION_CHROME_LINK, VIEW_TYPES } from "./constants.js";
import LinkedInManagerView from "./LinkedIn.jsx";

const { Paragraph, Text } = Typography;
const { Content } = Layout;

const ChromeManagerView = () => {
  const [selectedMenuKey, setSelectedMenuKey] = useState(VIEW_TYPES.apolloChrome);

  const items = [
    {
      label: (
        <Flex gap="small" align="center">
          <LinkedinFilled /> LinkedIn
        </Flex>
      ),
      value: VIEW_TYPES.linkedinChrome,
    },
    {
      label: (
        <Flex gap="small" align="center">
          <ApolloIcon height="16" /> Apollo.io
        </Flex>
      ),
      value: VIEW_TYPES.apolloChrome,
    },
  ];

  const views = {
    apolloChrome: () => <ApolloManagerView />,
    linkedinChrome: () => <LinkedInManagerView />,
    default: () => <ChromeOnboardingView />,
  };

  return (
    <Flex vertical gap="large">
      <Card
        style={{
          padding: 0,
          background: "linear-gradient(135deg, #001f3f, #1e3a8a, #3b82f6)",
          color: "#fff",
        }}
      >
        <Typography>
          <Flex gap="middle" align="start">
            <ChromeFilled style={{ fontSize: 34, marginTop: 5, color: "white" }} />
            <Flex vertical align="start">
              <Text strong style={{ fontSize: 22, fontWeight: "bold", color: "white" }}>
                Recruitly Chrome Extension
              </Text>
              <Paragraph style={{ fontSize: "14px", color: "whitesmoke" }}>A game-changer for recruiters is here! Our extension brings a new, revolutionary way of working.</Paragraph>
              <Button
                variant="solid"
                color="danger"
                icon={<IoExtensionPuzzle />}
                size={"small"}
                onClick={() => {
                  window.open(RECRUITLY_EXTENSION_CHROME_LINK, "_blank");
                }}
              >
                Install Extension
              </Button>
            </Flex>
          </Flex>
        </Typography>
      </Card>
      <div>
        <Segmented size="middle" options={items} value={selectedMenuKey} onChange={setSelectedMenuKey} />
      </div>
      <Content>{views[selectedMenuKey]() || views.default()}</Content>
    </Flex>
  );
};

export default ChromeManagerView;
