import React from "react";
import { Button, Modal, TextContainer } from "@shopify/polaris";
import { useRecoilValue, useRecoilState } from "recoil";
import pageInfo from "../store/PageInfo";
import modalCancelState from "../store/ModalCancel";
import { useNavigate } from "react-router-dom";



function ModalCancel() {
    let navigate = useNavigate();
    const [pageInf, setPageInfo] = useRecoilState(pageInfo)

    const [activeCancelModal, setActiveCancelModal] = useRecoilState(modalCancelState)

    const handleCancel = () => setActiveCancelModal(!activeCancelModal);
    const handleLeave = () => {
        setActiveCancelModal(!activeCancelModal)
        navigate('/main')
        setPageInfo({
            title: '',
            content: ''
        })    
        
    }
    return(
        <div style={{ height: "500px" }}>
        <Modal
          open={activeCancelModal}
          onClose= {handleCancel}
          title='You have unsaved changes'
          primaryAction={{
            content: 'Leave page',
            destructive: true,
            onAction: handleLeave,
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: handleCancel,
            },
          ]}
        >
          <Modal.Section>
            <TextContainer>
              <p>
              If you leave this page, all unsaved changes will be lost.
              </p>
            </TextContainer>
          </Modal.Section>
        </Modal>
      </div>
    )
}

export default ModalCancel