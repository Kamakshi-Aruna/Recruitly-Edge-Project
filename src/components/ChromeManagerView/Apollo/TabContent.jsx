import { List, Spin } from "antd";

const TabContent = ({ loading, data, renderItem, importType }) => (
  <Spin spinning={loading}>
    <List
      style={{
        paddingTop: 12,
        maxHeight: window.innerHeight - 450,
        overflowY: "scroll",
      }}
      itemLayout="vertical"
      dataSource={data}
      renderItem={(item) => renderItem(item, importType)}
    />
  </Spin>
);

export default TabContent;
