import { Avatar, Checkbox, Flex, Image, Typography } from "antd";
import { MdContentCopy } from "react-icons/md";
import { useQueryClient } from "react-query";

import { executePipelineAction } from "@components/JobPipeline/utils.jsx";

import { renderInitials } from "../../../GlobalPipeline/utils/index.jsx";
import { PIPELINE_ACTION_NAMES } from "../../constants";

import JobPipelineBoardCardActions from "./Actions.jsx";

const { Text } = Typography;

const CardHeader = ({ item, isCardChecked, handleSelectItem }) => {
  const renderCandidateAddress = (item) => {
    return [item.candidateAddress.cityName, item.candidateAddress.regionName, item.candidateAddress.countryName]
      .filter(Boolean) // Removes any empty values
      .join(", ");
  };

  const queryClient = useQueryClient();
  const profileImageProps = item.candidate?.profileImageUrl
    ? {
        src: <Image preview={{ mask: false }} height={40} width={40} src={item.candidate.profileImageUrl} />,
      }
    : {};

  return (
    <>
      <Flex align="center" gap={10} style={{ marginBottom: "auto" }}>
        <Avatar style={{ backgroundColor: "#ededed" }} shape="circle" size={40} {...profileImageProps}>
          {renderInitials(item.candidate?.name)}
        </Avatar>
        <Flex vertical align="start" justify="center" style={{ flexGrow: 1 }} gap={0}>
          <Text
            ellipsis
            className="recruitly-candidate-name"
            style={{ maxWidth: 200, fontSize: "14.5px", fontWeight: "500", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              executePipelineAction({
                key: PIPELINE_ACTION_NAMES.VIEW_RECORD,
                selectedItems: [item.id],
                queryClient,
              });
            }}
          >
            {item.candidate?.name}
          </Text>
          {(item.candidateAddress?.countryCode || item.candidateAddress?.regionName) && (
            <Text ellipsis color="secondary" style={{ marginBottom: 0, fontSize: 11, color: "#6b7483", width: 150 }}>
              {renderCandidateAddress(item)}
            </Text>
          )}
          {item.candidate?.phone && (
            <Text
              ellipsis
              color="secondary"
              copyable={{
                text: item.candidate?.phone,
                icon: [<MdContentCopy color={"secondary"} key="copy" />],
              }}
              style={{ marginBottom: 0, fontSize: 11, color: "#6b7483", width: 150 }}
            >
              {item.candidate.phone}
            </Text>
          )}
        </Flex>
      </Flex>
      <Flex align="center" justify="space-between" style={{ marginBottom: "auto" }} gap="small">
        <JobPipelineBoardCardActions item={item} />
        <Checkbox value={item} checked={isCardChecked} onChange={handleSelectItem} />
      </Flex>
    </>
  );
};

export default CardHeader;
