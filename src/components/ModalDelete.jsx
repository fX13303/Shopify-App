import React from "react";
import { Button, Modal, TextContainer } from "@shopify/polaris";
import { useState, useCallback} from "react";
import { useRecoilValue, useRecoilState } from "recoil";
import { authenticatedFetch } from "@shopify/app-bridge-utils";
import { useAppBridge } from "@shopify/app-bridge-react";
import modalDeleteState from "../store/ModalStore";
import pages from "../store/Pages";
import { useNavigate } from "react-router-dom";



function ModalDelete() {
    let navigate = useNavigate()
    const app = useAppBridge();
    const fetchFunction = authenticatedFetch(app);
    const [page, setPage] = useRecoilState(pages)

    const [active, setActive] = useRecoilState(modalDeleteState)

    const handleChange = () => setActive(false);
    const handleDeletePages = async () => {
        const res = await fetchFunction("/delpages", {
            method: "DELETE",
            body: JSON.stringify(page),
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
        });
        setActive(false)
        setPage([])
        navigate('/new')
        navigate('/main')
    }
    return(
        <div style={{ height: "500px" }}>
        <Modal
          open={active}
          onClose={handleChange}
          title={(page.length)==1 ? `Delete 1 page?` : `Delete ${page.length} pages?`}
          primaryAction={{
            content: (page.length)==1 ? `Delete 1 page` : `Delete ${page.length} pages`,
            destructive: true,
            onAction: handleDeletePages,
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
              Deleted pages cannot be recovered. Do you still want to continue?
              </p>
            </TextContainer>
          </Modal.Section>
        </Modal>
      </div>
    )
}

export default ModalDelete