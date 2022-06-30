import React from "react";
import { Page, Layout, Card, Frame} from "@shopify/polaris";
import Tab from "./Tabs";
import Filter from "./Filters";
import AddButton from "./AddButton";

function Main() {

  return (
    <Frame>
      <div>
      <Page fullWidth title="Pages" primaryAction={<AddButton />} >
        <Layout>
          <Layout.Section>
            <Card>
              <Tab>
                <Filter />
                {/* <Pages /> */}
              </Tab>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </div>
    </Frame>
  );
}

export default Main;
