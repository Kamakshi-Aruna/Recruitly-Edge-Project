import { useEffect, useState } from "react";
import { Button, Popover, Tree, Typography } from "antd";

const { Text } = Typography;

const FilterDropdown = ({ treeData, value, onSelect, icon: Icon, label, cascadeTreeData = [], isCascadeSelector = false, onCascaderSelect = () => {}, cascaderValue = [] }) => {
  const commonProps = {
    style: { width: "100%", height: "100%" },
    dropdownStyle: { maxHeight: 800, overflow: "auto" },
    treeDefaultExpandAll: true,
    checkable: true,
    defaultExpandAll: true,
    autoExpandParent: true,
    multiple: true,
    selectable: false,
    showIcon: true,
    defaultExpandParent: true,
  };
  const treeProps = {
    treeData,
    value,
    onCheck: onSelect,
    onSelect,
    checkedKeys: value,
    ...commonProps,
  };

  const cascadeTreeProps = {
    treeData: cascadeTreeData,
    value: cascaderValue,
    onSelect: onCascaderSelect,
    onCheck: onCascaderSelect,
    checkedKeys: cascaderValue,
    ...commonProps,
  };

  const filterCount = value?.filter((v) => v.includes("-")).length || 0;

  const [popoverHeight, setPopoverHeight] = useState(window.innerHeight * 0.6);

  useEffect(() => {
    const updatePopoverHeight = () => {
      const availableHeight = window.innerHeight * 0.6;

      if (availableHeight < 200) {
        setPopoverHeight(200);
      } else {
        setPopoverHeight(availableHeight);
      }
    };

    window.addEventListener("resize", updatePopoverHeight);

    updatePopoverHeight();

    return () => {
      window.removeEventListener("resize", updatePopoverHeight);
    };
  }, []);

  return (
    <Popover
      trigger="click"
      placement="bottom"
      showArrow
      overlayStyle={{
        minWidth: "200px",
        maxHeight: popoverHeight,
        overflow: "hidden", // Prevent the entire popover from scrolling
        overscrollBehavior: "contain",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      }}
      content={
        <div style={{ display: "flex", flexDirection: "column", minWidth: "250px", maxHeight: popoverHeight - 100 }}>
          <div style={{ flexGrow: 1, overflowY: "auto", paddingRight: "10px" }}>
            {isCascadeSelector ? (
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <Text strong>Search by</Text>
                  <Tree {...cascadeTreeProps} />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <Text strong>Owner</Text>
                  <Tree {...treeProps} />
                </div>
              </div>
            ) : (
              <Tree {...treeProps} />
            )}
          </div>
        </div>
      }
    >
      <Button size="small" type={value?.length ? "primary" : "default"} icon={<Icon size={12} />}>
        {`${label}: ${filterCount || "All"}`}
      </Button>
    </Popover>
  );
};

export default FilterDropdown;
