import React from "react";
import { Button, Modal, TextContainer } from "@shopify/polaris";
import { useState, useCallback} from "react";
import { useRecoilValue, useRecoilState } from "recoil";
import { authenticatedFetch } from "@shopify/app-bridge-utils";
import { useAppBridge } from "@shopify/app-bridge-react";
import modalDeleteState from "../store/ModalStore";
import pages from "../store/Pages";
import { useNavigate } from "react-router-dom";
import modalDiscardState from "../store/ModalDiscard";
import pageInfo from "../store/PageInfo";



function ModalDiscard() {
    const [pageInf, setPageInfo] = useRecoilState(pageInfo)
    const app = useAppBridge();

    const [active, setActive] = useRecoilState(modalDiscardState)

    const handleChange = () => setActive(false);
    const handleDiscard = () => {
        setActive(false)
        setPageInfo({
            title: '',
            content: ''
        })    
        
    }
    return(
        <div style={{ height: "500px" }}>
        <Modal
          open={active}
          onClose={handleChange}
          title='Discard all unsaved changes'
          primaryAction={{
            content: 'Discard changes',
            destructive: true,
            onAction: handleDiscard,
          }}
          secondaryActions={[
            {
              content: "Continue editing",
              onAction: handleChange,
            },
          ]}
        >
          <Modal.Section>
            <TextContainer>
              <p>
              If you discard changes, you'll delete any edits you made since you last saved.
              </p>
            </TextContainer>
          </Modal.Section>
        </Modal>
      </div>
    )
}

export default ModalDiscard