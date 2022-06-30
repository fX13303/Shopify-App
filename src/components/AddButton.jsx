import { Button } from "@shopify/polaris";
import React from "react";
import { Link } from "react-router-dom";

function AddButton() {
    return(
        <Link to='/new' style={{textDecoration: 'none'}}>
            <Button primary>Add Pages</Button>
        </Link>
    )
}

export default AddButton