import {
  Page,
  Card,
  FormLayout,
  TextField,
  Button,
  Layout,
  PageActions,
  Frame,
  ContextualSaveBar,
  ChoiceList,
  TextContainer,
  Select,
  Toast,
} from "@shopify/polaris";
import React, { useState, useCallback, useEffect } from "react";
import { authenticatedFetch } from "@shopify/app-bridge-utils";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useNavigate } from "react-router-dom";
import { constSelector, useRecoilState } from "recoil";
import modalDiscardState from "../store/ModalDiscard";
import ModalDiscard from "./ModalDiscard";
import ModalDeletePage from "./ModalDeletePage";
import modalCancelState from "../store/ModalCancel";
import ModalCancel from "./ModalCancel";
import { Editor } from "@tinymce/tinymce-react";
import pageIdCurrent from "../store/PageIdCurrent";
import modalDeletePage from "../store/ModalDeletePage";
import currentPageInfo from "../store/CurrentPage";
import modalToastDelete from "../store/ModalToastDelete";

function EditPage() {
  const app = useAppBridge();
  const fetchFunction = authenticatedFetch(app);
  const [selected, setSelected] = useState(["hidden"]);
  const handleChange = useCallback((value) => setSelected(value), []);
  const [selectedLabel, setSelectedLabel] = useState("Default page");
  const handleSelectChange = (value) => setSelectedLabel(value);
  const [displayText, setDisplayText] = useState("");
  const [active, setActive] = useRecoilState(modalDiscardState);
  const [activeModalCancel, setActiveCancelModal] =
    useRecoilState(modalCancelState);
  const [pageId, setPageIdCurrent] = useRecoilState(pageIdCurrent);
  const [currentPage, setCurrentPage] = useRecoilState(currentPageInfo);
  const [defaultPage, setDefaultPage] = useState({});
  const navigate = useNavigate();
  const [isDirty, setIsDirty] = useState(false);
  const [toastActive, setToastActive] = useState(false);
  const [toastDeleteActive, setToastDeleteActive] = useRecoilState(modalToastDelete)
  const [activeDeletePage, setActiveDeletePage] =
    useRecoilState(modalDeletePage);

  const toggleActive = () => setToastActive((toastActive) => !toastActive);
  const toggleDeleteActive = () => setToastDeleteActive((toastDeleteActive) => !toastDeleteActive)

  useEffect(async () => {
    const res = await fetchFunction(`/page/${pageId}`);
    const data = await res.json();
    setCurrentPage(data);
    setDefaultPage(data);
  }, []);

  const handleDeletePage = () => {
    setActiveDeletePage(true);
  };
  const handleDiscard = () => {
    if (
      currentPage.title == defaultPage.title &&
      currentPage.body_html == defaultPage.body_html
    ) {
      setIsDirty(false);
      navigate("/main");
    } else {
      setActive(true);
      setCurrentPage(defaultPage);
    }
  };

  const handleSave = async () => {
    console.log("here");
    const res = await fetchFunction(`/pages/${pageId}`, {
      method: "PUT",
      body: JSON.stringify(currentPage),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    setIsDirty(false);
    console.log(toastActive);
    setToastActive(true);
  };

  const handleTitleFieldChange = (value) => {
    setCurrentPage({ ...currentPage, title: value });
    value && setIsDirty(true);
  };

  const toastMarkup = toastActive ? (
    <Toast content="Page was saved" onDismiss={toggleActive} />
  ) : null;
  const toastDelete = toastDeleteActive ? (
    <Toast content="Page was deleted" onDismiss={toggleDeleteActive} />
  ) : null;
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

  const options = [
    { label: "Default page", value: "default" },
    { label: "contact", value: "contact" },
  ];
  return (
    <Frame logo={logo}>
      {contextualSaveBarMarkup}
      <Page breadcrumbs={[{ content: "Back", onAction() {navigate('/main')} }]} title={currentPage.title}>
        <Layout>
          <Layout.Section>
            <Card sectioned>
              <FormLayout>
                <TextField
                  label="Title"
                  placeholder="e.g. Contact us, Sizing chart, FAQs"
                  value={currentPage.title}
                  onChange={handleTitleFieldChange}
                  // name='title' value={currentPage.title}
                ></TextField>
                <p>Content</p>
                <Editor
                  value={currentPage.body_html}
                  onEditorChange={(newValue, editor) => {
                    // setContentValue(newValue);
                    //   setDisplayText(editor.getContent({ format: "text" }));
                    setCurrentPage({ ...currentPage, body_html: newValue });
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
              {currentPage.title != "" && currentPage.body_html != "" ? (
                <>
                  <p className="rUXT_">{currentPage.title}</p>
                  <p className="XNE1s">
                    https://phucddh.store.myshopify.com/pages/
                    {!currentPage.title
                      ? currentPage.title
                      : currentPage.title.replace(/\s/g, "-")}
                  </p>
                  <div
                    className="JZCmJ"
                    dangerouslySetInnerHTML={{
                      __html: `${
                        currentPage.body_html ? currentPage.body_html : ""
                      }`,
                    }}
                  />
                </>
              ) : currentPage.title == "" && currentPage.content == "" ? (
                <p>
                  Add a title and description to see how this Page might appear
                  in a search engine listing
                </p>
              ) : currentPage.title != "" && currentPage.content == "" ? (
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
                <p>
                  Assign a template from your current theme to define how the
                  page is displayed.
                </p>
              </TextContainer>
            </Card>
          </Layout.Section>
        </Layout>
        <PageActions
          primaryAction={{
            content: "Save",
            onAction: handleSave
            // defaultState.current.titleFieldValue = titleFieldValue;
            // defaultState.current.contentFieldValue = body;
            // console.log(defaultState.current)
          }}
          secondaryActions={[
            {
              content: "Delete",
              destructive: true,
              onAction: handleDeletePage,
            },
          ]}
        ></PageActions>
        <br />
        {toastMarkup}
        <ModalDiscard />
        <ModalCancel />
        <ModalDeletePage />
      </Page>
    </Frame>
  );
}

export default EditPage;
