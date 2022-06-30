import React, { useState, useCallback, useEffect } from "react";
import dateFormat, { masks } from "dateformat";
import {
  Card,
  ResourceList,
  Filters,
  Icon,
  Button,
  Avatar,
  ResourceItem,
  TextStyle,
  ChoiceList,
  ButtonGroup,
  Popover,
  ActionList,
  Stack,
} from "@shopify/polaris";
import { StarFilledMinor, SortMinor } from "@shopify/polaris-icons";
import { useContext } from "react";
import { TabContext } from "./Tabs";
import { authenticatedFetch } from "@shopify/app-bridge-utils";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useRecoilState } from "recoil";
import modalDeleteState from "../store/ModalStore";
import ModalDelete from "./ModalDelete";
import pages from "../store/Pages";
import { useNavigate } from "react-router-dom";
import pageIdCurrent from "../store/PageIdCurrent";
import Example from "./Loading";
import SpinnerExample from "./Loading";
function Filter() {
  const app = useAppBridge();
  const fetchFunction = authenticatedFetch(app);

  const [activeModalDelete, setActiveModalDelete] =
    useRecoilState(modalDeleteState);

  const [items, setItems] = useState(null);
  useEffect(async () => {
    const res = await fetchFunction("/pages");
    const data = await res.json();
    setItems(data.body.pages);
    setDefaultItems(data.body.pages)
  }, []);

  let navigate = useNavigate();

  const context = useContext(TabContext);
  const { visibility, setVisibility } = context;
  const [queryValue, setQueryValue] = useState(null);
  const [selectedItems, setSelectedItems] = useRecoilState(pages);
  const [pageId, setPageIdCurrent] = useRecoilState(pageIdCurrent);
  const [popoverActive, setPopoverActive] = useState(false);
  const [defaultItems, setDefaultItems] = useState([]);

  // const togglePopoverActive =
  //   () => setPopoverActive((popoverActive) => !popoverActive);
  const handleVisibilityChange = (value) => {
    setVisibility(value);
  };
  const handleFiltersQueryChange = (value) => {
    setQueryValue(value);
    if (value) {
      const result = defaultItems.filter(
        (item) => item.title.match(value) || item.body_html.match(value)
      );
      if (result) {
        setItems(result);
      } else {
        setItems(null);
      }
    } else {
      setItems(defaultItems)
    }
  };
  const [selected, setSelected] = useState(["newest"]);

  const handleChange = useCallback((value) => setSelected(value), []);

  // const handleVisibilityRemove = () => setVisibility(false);
  const handleQueryValueRemove = () => setQueryValue(null);
  const handleClearAll = () => {
    console.log("hello world");
    setVisibility(false);
    setQueryValue(null);
  };

  const resourceName = {
    singular: "page",
    plural: "pages",
  };

  const filters = [
    {
      key: "visibility",
      label: "Visibility",
      filter: (
        <ChoiceList
          title="Visibility"
          titleHidden
          choices={[
            { label: "Visible", value: true },
            { label: "Hidden", value: false },
          ]}
          selected={visibility || []}
          onChange={handleVisibilityChange}
          autoComplete="off"
          labelHidden
        />
      ),
      shortcut: true,
    },
  ];

  const appliedFilters = !isEmpty(visibility)
    ? [
        {
          key: "visibility1",
          label: disambiguateLabel("visibility1", visibility),
          // onRemove: handleVisibilityRemove,
        },
      ]
    : [];

  const filterControl = (
    <Filters
      queryValue={queryValue}
      filters={filters}
      appliedFilters={appliedFilters}
      onQueryChange={handleFiltersQueryChange}
      onQueryClear={handleQueryValueRemove}
      onClearAll={handleClearAll}
    >
      <div style={{ paddingLeft: "8px" }}>
        <ButtonGroup>
          <Button
            icon={StarFilledMinor}
            disabled
            onClick={() => console.log("New filter saved")}
          >
            Saved
          </Button>
          <Popover
            autofocusTarget="first-node"
            activator={
              <Button
                icon={SortMinor}
                onClick={() => setPopoverActive(!popoverActive)}
              >
                Sort
              </Button>
            }
            active={popoverActive}
            // onClose={togglePopoverActive}
          >
            <Card sectioned>
              <ChoiceList
                title="Sort by"
                choices={[
                  { label: "Newest update", value: "newest" },
                  { label: "Oldest update", value: "oldest" },
                  { label: "Title A-Z", value: "ascend" },
                  { label: "Title Z-A", value: "descend" },
                ]}
                selected={selected}
                onChange={handleChange}
              />
            </Card>
          </Popover>
        </ButtonGroup>
      </div>
    </Filters>
  );

  const bulkActions = [
    {
      content: "Make selected pages visible",
      onAction: () => console.log("Todo: MAKE SELECTED PAGES VISIBLE"),
    },
    {
      content: "Hide selected pages",
      onAction: () => console.log("Todo: HIDE SELECTED PAGES"),
    },
    {
      content: "Delete pages",
      destructive: true,
      onAction: () => setActiveModalDelete(true),
    },
  ];

  const shortcutActions = [
    {
      content: "View page",
      url: `phucddhstore.myshopify.com/pages/`,
    },
  ];

  const handleClickItem = (event) => {
    setPageIdCurrent(event);
    console.log(pageId);
    navigate(`/edit/${event}`);
  };
  return (
    <>
        {items ? (
          <ResourceList
            resourceName={resourceName}
            items={items}
            renderItem={renderItem}
            selectedItems={selectedItems}
            onSelectionChange={setSelectedItems}
            selectable
            filterControl={filterControl}
            bulkActions={bulkActions}
          />
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "300px",
            }}
          >
            <SpinnerExample />
          </div>
        )}
      <ModalDelete></ModalDelete>
    </>
  );

  function renderItem(item) {
    const { id, title, body_html, created_at } = item;

    return (
      <ResourceItem
        id={id}
        shortcutActions={shortcutActions}
        onClick={handleClickItem}
      >
        <h3>
          <TextStyle variation="strong">{title}</TextStyle>
        </h3>
        <div
          dangerouslySetInnerHTML={{ __html: `${body_html ? body_html : ""}` }}
        />
        <div>{dateFormat(created_at, "shortTime")}</div>
      </ResourceItem>
    );
  }

  function disambiguateLabel(key, value) {
    switch (key) {
      case "visibility1":
        return `Visibility ${value}`;
      default:
        return value;
    }
  }

  function isEmpty(value) {
    if (Array.isArray(value)) {
      return value.length === 0;
    } else {
      return value === "" || value == null;
    }
  }
}

export default Filter;
