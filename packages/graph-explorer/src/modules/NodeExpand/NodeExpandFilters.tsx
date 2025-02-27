import { clone } from "lodash";
import { useCallback, useEffect } from "react";
import {
  AddIcon,
  DeleteIcon,
  IconButton,
  InfoTooltip,
  Input,
  Select,
  SelectOption,
} from "../../components";
import { useConfiguration } from "../../core";
import useTextTransform from "../../hooks/useTextTransform";
import useTranslations from "../../hooks/useTranslations";

export type NodeExpandFilter = {
  name: string;
  value: string;
};
export type NodeExpandFiltersProps = {
  neighborsOptions: SelectOption[];
  selectedType: string;
  onSelectedTypeChange(type: string): void;
  filters: Array<NodeExpandFilter>;
  onFiltersChange(filters: Array<NodeExpandFilter>): void;
  limit: number | null;
  onLimitChange(limit: number | null): void;
};

const NodeExpandFilters = ({
  neighborsOptions,
  selectedType,
  onSelectedTypeChange,
  filters,
  onFiltersChange,
  limit,
  onLimitChange,
}: NodeExpandFiltersProps) => {
  const config = useConfiguration();
  const t = useTranslations();
  const textTransform = useTextTransform();

  const vtConfig = config?.getVertexTypeConfig(selectedType);
  const searchableAttributes =
    config?.getVertexTypeSearchableAttributes(selectedType);

  const onFilterAdd = useCallback(() => {
    onFiltersChange([
      ...filters,
      {
        name: vtConfig?.attributes?.[0].name || "",
        value: "",
      },
    ]);
  }, [filters, onFiltersChange, vtConfig?.attributes]);

  const onFilterDelete = useCallback(
    (filterIndex: number) => {
      const updatedFilters = filters.filter((_, i) => i !== filterIndex);
      onFiltersChange(updatedFilters);
    },
    [filters, onFiltersChange]
  );

  const onFilterChange = useCallback(
    (filterIndex: number, name?: string, value?: string) => {
      const currFilters = clone(filters);
      currFilters[filterIndex].name = name || currFilters[filterIndex].name;
      currFilters[filterIndex].value = value ?? currFilters[filterIndex].value;
      onFiltersChange(currFilters);
    },
    [filters, onFiltersChange]
  );

  useEffect(() => {
    onFiltersChange([]);
  }, [onFiltersChange, selectedType]);

  return (
    <div className={"filters-section"}>
      <div className={"title"}>{t("node-expand.neighbors-of-type")}</div>
      <Select
        aria-label={"neighbor type"}
        value={selectedType}
        onChange={v => {
          onSelectedTypeChange(v as string);
        }}
        options={neighborsOptions}
      />
      {!!vtConfig?.attributes?.length && (
        <div className={"title"}>
          <div>Filter to narrow results</div>
          <IconButton
            icon={<AddIcon />}
            variant={"text"}
            size={"small"}
            onPress={onFilterAdd}
          />
        </div>
      )}
      {!!searchableAttributes?.length && (
        <div className={"filters"}>
          {filters.map((filter, filterIndex) => (
            <div key={filterIndex} className={"single-filter"}>
              <Select
                aria-label={"Attribute"}
                value={filter.name}
                onChange={value => {
                  onFilterChange(filterIndex, value as string, filter.value);
                }}
                options={searchableAttributes?.map(attr => ({
                  label: attr.displayLabel || textTransform(attr.name),
                  value: attr.name,
                }))}
                hideError={true}
                noMargin={true}
              />
              <Input
                aria-label={"Filter"}
                className={"input"}
                value={filter.value}
                onChange={value => {
                  onFilterChange(filterIndex, filter.name, value);
                }}
                hideError={true}
                noMargin={true}
              />
              <IconButton
                icon={<DeleteIcon />}
                variant={"text"}
                color={"error"}
                size={"small"}
                tooltipText={"Remove Filter"}
                onPress={() => onFilterDelete(filterIndex)}
              />
            </div>
          ))}
        </div>
      )}
      <div className={"title"}>
        <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
          Limit returned neighbors to
          <InfoTooltip>
            Please use full expansion if all the expected nodes are not returned
            from limited expansion.
          </InfoTooltip>
        </div>
        <IconButton
          icon={<AddIcon />}
          variant={"text"}
          size={"small"}
          onPress={() => onLimitChange(1)}
        />
      </div>
      {limit !== null && (
        <div className={"limit"}>
          <Input
            aria-label={"limit"}
            className={"input"}
            type={"number"}
            min={1}
            step={1}
            value={limit}
            onChange={(v: number | null) => onLimitChange(v ?? 0)}
            hideError={true}
            noMargin={true}
          />
          <IconButton
            icon={<DeleteIcon />}
            variant={"text"}
            color={"error"}
            size={"small"}
            tooltipText={"Remove Limit"}
            onPress={() => onLimitChange(null)}
          />
        </div>
      )}
    </div>
  );
};

export default NodeExpandFilters;
