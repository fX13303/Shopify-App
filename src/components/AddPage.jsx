import {
  Page,
  Badge,
  Card,
  FormLayout,
  Stack,
  TextField,
  ButtonGroup,
  Button,
  Layout,
  PageActions,
  Frame,
  ContextualSaveBar,
  ChoiceList,
  TextContainer,
  Heading,
  Select,
  Loading,
} from "@shopify/polaris";
import React, { useState, useCallback, useRef } from "react";
import { authenticatedFetch } from "@shopify/app-bridge-utils";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import modalDiscardState from "../store/ModalDiscard";
import ModalDiscard from "./ModalDiscard";
import pageInfo from "../store/PageInfo";
import modalCancelState from "../store/ModalCancel";
import ModalCancel from "./ModalCancel";
import {Editor} from "@tinymce/tinymce-react"

function AddPage() {
  const app = useAppBridge();
  const fetchFunction = authenticatedFetch(app);
  const [selected, setSelected] = useState(["hidden"]);
  const handleChange = useCallback((value) => setSelected(value), []);
  const [selectedLabel, setSelectedLabel] = useState("Default page");
  const handleSelectChange = (value) => setSelectedLabel(value);
  const [displayText, setDisplayText] = useState("");
  const [newPage, setNewPage] = useRecoilState(pageInfo);
  const [active, setActive] = useRecoilState(modalDiscardState);
  const [activeModalCancel, setActiveCancelModal] = useRecoilState(modalCancelState)
  const navigate = useNavigate();
  const [isDirty, setIsDirty] = useState(false);

  const handleCancel = () => {
    console.log("hello")
    if (newPage.title == "" && newPage.content == "") {
      navigate('/main');
    } else {
      setActiveCancelModal(true)
    }
  }
  const handleDiscard = () => {
    if (newPage.title == "" && newPage.content == "") {
      setIsDirty(false);
      navigate("/main");
    } else {
      setActive(true);
    }
  };

  const handleSave = async () => {
    console.log("here");
    const res = await fetchFunction("/newpage", {
      method: "POST",
      body: JSON.stringify(newPage),
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });
    setNewPage({
      title: '',
      content: ''
    })
    // defaultState.current.titleFieldValue = titleFieldValue;
    // defaultState.current.contentFieldValue = body;
    // console.log(defaultState.current)
    setIsDirty(false);
    setTimeout(() => navigate("/main"));
    // setPageName(defaultState.current.titleFieldValue);
  };

  const handleTitleFieldChange = (value) => {
    setNewPage({ ...newPage, title: value });
    value && setIsDirty(true);
  };

  const logo = {
    width: 124,
    topBarSource:
      "https://cdn.shopify.com/shopifycloud/web/assets/v1/317261b82650a68141f98ad2b08254b653aaff9e2404558fe47747da00293df5.svg",
    contextualSaveBarSource:
      "https://cdn.shopify.com/shopifycloud/web/assets/v1/f5416ec27e17f00a67f8c2d6603088baa6635c7bc2071b4f6533c8d260fc8644.svg",
    url: "https://cdn.shopify.com/shopifycloud/web/assets/v1/317261b82650a68141f98ad2b08254b653aaff9e2404558fe47747da00293df5.svg",
    accessibilityLabel: "Phuc XO",
  };

  const contextualSaveBarMarkup = isDirty ? (
    <ContextualSaveBar
      message="Unsaved changes"
      saveAction={{
        onAction: handleSave,
      }}
      discardAction={{
        onAction: handleDiscard,
      }}
    />
  ) : null;
  console.log(newPage);
  const options = [
    { label: "Default page", value: "default" },
    { label: "contact", value: "contact" },
  ];
  return (
    <Frame logo={logo}>
      {contextualSaveBarMarkup}
      <Page breadcrumbs={[{ content: "Back", onAction() {navigate('/main')} }]} title="Add page">
        <Layout>
          <Layout.Section>
            <Card sectioned>
              <FormLayout>
                <TextField
                  label="Title"
                  placeholder="e.g. Contact us, Sizing chart, FAQs"
                  value={newPage.title}
                  onChange={handleTitleFieldChange}
                  // name='title' value={newPage.title}
                ></TextField>
                <p>Content</p>
                <Editor
                  value={newPage.content}
                  onEditorChange={(newValue, editor) => {
                    // setContentValue(newValue);
                    // setDisplayText(editor.getContent({ format: "text" }));
                    setNewPage({ ...newPage, content: newValue });
                    setIsDirty(true);
                  }}
                  onInit={(evt, editor) =>
                    setDisplayText(editor.getContent({ format: "text" }))
                  }
                  init={{
                    height: 150,
                    menubar: false,
                    plugins: [
                      "image",
                      "code",
                      "table",
                      "link",
                      "media",
                      "codesample",
                    ],
                    toolbar:
                      "blocks | " +
                      "bold italic underline | backcolor | alignleft aligncenter " +
                      "alignright alignjustify | bullist numlist outdent indent |" +
                      "code",
                    content_style:
                      "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                  }}
                />
              </FormLayout>
            </Card>
            <Card
              title="Search engine listing preview"
              sectioned
              actions={[{ content: "Edit Website SEO" }]}
            >
              {newPage.title != "" && newPage.content != "" ? (
                <>
                  <p className="rUXT_">{newPage.title}</p>
                  <p className="XNE1s">
                    https://phucddh.store.myshopify.com/pages/
                    {newPage.title.replace(/\s/g, "-")}
                  </p>
                  <div
                    className="JZCmJ"
                    dangerouslySetInnerHTML={{
                      __html: `${newPage.content ? newPage.content : ""}`,
                    }}
                  />
                </>
              ) : newPage.title == "" && newPage.content == "" ? (
                <p>
                  Add a title and description to see how this Page might appear
                  in a search engine listing
                </p>
              ) : newPage.title != "" && newPage.content == "" ? (
                <p>
                  Add a description to see how this Page might appear in a
                  search engine listing
                </p>
              ) : (
                <p>
                  Add a title to see how this Page might appear in a search
                  engine listing
                </p>
              )}
            </Card>
          </Layout.Section>
          <Layout.Section secondary>
            <Card sectioned title="Visibility">
              <ChoiceList
                choices={[
                  { label: "Visible", value: "visible" },
                  { label: "Hidden", value: "hidden" },
                ]}
                selected={selected}
                onChange={handleChange}
              />
              <br />
              <Button plain>Set visibility date</Button>
            </Card>
            <Card title="Online store" sectioned>
              <TextContainer spacing="tight">
                <Select
                  label="Theme template"
                  options={options}
                  onChange={handleSelectChange}
                  value={selectedLabel}
                />
                <p>Assign a template from your current theme to define how the page is displayed.</p>
              </TextContainer>
            </Card>
          </Layout.Section>
        </Layout>
        <PageActions
          primaryAction={{content: 'Save' , onAction: handleSave}}
              // defaultState.current.titleFieldValue = titleFieldValue;
              // defaultState.current.contentFieldValue = body;
              // console.log(defaultState.current)
          secondaryActions={[
            {
              content: "Cancel",
              onAction: handleCancel,
            },
          ]}
        ></PageActions>
        <ModalDiscard />
        <ModalCancel />
      </Page>
    </Frame>
  );
}

export default AddPage;
