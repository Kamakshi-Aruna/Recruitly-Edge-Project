import { useShallow } from "zustand/react/shallow";

import useEdgeInitializer from "@stores/useEdgeInitializer";
import useJobPipelineStore from "@stores/useJobPipelineStore";

import { PIPELINE_DATA_TYPE } from "../../GlobalPipeline/constants";

/**
 * A custom hook to manage the selection of items in a job pipeline.
 *
 * @param {Object} params - The parameters for the hook.
 * @param {Array} [params.columnItems=[]] - An array of items in the current column.
 * @param {Object} [params.item={}] - The current item being processed.
 *
 * @returns {Object} An object containing the following properties:
 * @returns {Function} onSelectAll - A function to select or deselect all items in the column.
 * @returns {Function} handleSelectItem - A function to select or deselect an individual item.
 * @returns {boolean} isColumnChecked - A boolean indicating if all items in the column are selected.
 * @returns {boolean} isCardChecked - A boolean indicating if the current item is selected.
 * @returns {Array} allSelectedItemIds - An array of IDs of all selected items.
 * @returns {Array} selectedItems - An array of currently selected items.
 *
 * @example
 * const { onSelectAll, handleSelectItem, isColumnChecked, isCardChecked } = useSelectItems({
 *   columnItems: [{ id: 1 }, { id: 2 }],
 *   item: { id: 1 }
 * });
 */
const useSelectItems = ({ columnItems = [], item = {} }) => {
  const { selectedItems, setSelectedItems } = useJobPipelineStore(
    useShallow((state) => ({
      selectedItems: state.selectedItems,
      setSelectedItems: state.setSelectedItems,
    })),
  );

  const { jobId, pipelineDataType } = useEdgeInitializer(useShallow((state) => ({ jobId: state.jobId, pipelineDataType: state.pipelineDataType })));

  const id = jobId || pipelineDataType || PIPELINE_DATA_TYPE.all_my_open_jobs;

  const onSelectAll = (isSelected) => {
    if (isSelected) {
      const currentSelectedItems = selectedItems[id] || [];

      const existingItemIds = new Set(currentSelectedItems);

      const newItems = columnItems.filter((item) => !existingItemIds.has(item.id)).map(({ id }) => id);

      setSelectedItems([...currentSelectedItems, ...newItems], id);
      return;
    }
    const columnItemIds = columnItems.map(({ id }) => id);

    setSelectedItems(
      (selectedItems[id] || [])?.filter((item) => !columnItemIds.includes(item)),
      id,
    );
  };

  const handleSelectItem = (e) => {
    const currentItem = e.target.value;
    const isSelected = e.target.checked;

    let updatedSelectedItems = [];

    if (isSelected) {
      updatedSelectedItems = [...(selectedItems[id] || []), currentItem.id];
    } else {
      updatedSelectedItems = (selectedItems[id] || [])?.filter((id) => id !== currentItem?.id);
    }
    setSelectedItems(updatedSelectedItems, id);
  };

  const isColumnChecked = columnItems?.length && columnItems?.every((item) => selectedItems?.[id]?.includes(item.id));
  const IsColumnIndeterminate = !isColumnChecked && columnItems?.some((item) => selectedItems?.[id]?.includes(item.id));

  const isCardChecked = Array.isArray(selectedItems[id]) && (selectedItems[id] || []).includes(item.id);

  return {
    onSelectAll,
    handleSelectItem,
    isColumnChecked,
    IsColumnIndeterminate,
    isCardChecked,
    selectedItems,
  };
};

export default useSelectItems;
