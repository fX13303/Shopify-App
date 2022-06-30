import React from "react";
import { Button, Modal, TextContainer } from "@shopify/polaris";
import { useState, useCallback } from "react";
import { useRecoilValue, useRecoilState } from "recoil";
import { authenticatedFetch } from "@shopify/app-bridge-utils";
import { useAppBridge } from "@shopify/app-bridge-react";
import modalDeleteState from "../store/ModalStore";
import pages from "../store/Pages";
import { useNavigate } from "react-router-dom";
import modalDeletePage from "../store/ModalDeletePage";
import pageIdCurrent from "../store/PageIdCurrent";
import currentPageInfo from "../store/CurrentPage";
import modalToastDelete from "../store/ModalToastDelete";

function ModalDeletePage() {
  const app = useAppBridge();
  const fetchFunction = authenticatedFetch(app);
  let navigate = useNavigate();
  const [toastDeleteActive, setToastDeleteActive] =
    useRecoilState(modalToastDelete);

  const [activeDeletePage, setActiveDeletePage] =
    useRecoilState(modalDeletePage);
  const [pageId, setPageIdCurrent] = useRecoilState(pageIdCurrent);
  const [currentPage, setCurrentPage] = useRecoilState(currentPageInfo);

  const handleChange = () => setActiveDeletePage(false);
  const handleDeletePage = async () => {
    const res = await fetchFunction(`/pages/${pageId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    setActiveDeletePage(false);
    setToastDeleteActive(true);
    
    setTimeout(() => navigate('/main'), 3000)
    setTimeout(() => setToastDeleteActive(false), 3000)
  };
  return (
    <div style={{ height: "500px" }}>
      <Modal
        open={activeDeletePage}
        onClose={handleChange}
        title={`Delete ${currentPage.title}`}
        primaryAction={{
          content: `Delete`,
          destructive: true,
          onAction: handleDeletePage,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: handleChange,
          },
        ]}
      >
        <Modal.Section>
          <TextContainer>
            <p>
              Delete "<strong>{currentPage.title}</strong>"? This can't be
              undone.
            </p>
          </TextContainer>
        </Modal.Section>
      </Modal>
    </div>
  );
}

export default ModalDeletePage;
