import React from "react";
import { Link } from "react-router-dom";
import { Card, Tabs } from "@shopify/polaris";
import { useState } from "react";
import { useEffect } from "react";

export const TabContext = React.createContext(null);

const defaultTabs = [
  {
    id: "tab-1",
    content: "All",
  },
]

function Tab({ children }) {
  const [tabs, setTabs] = useState(defaultTabs);
  const [selected, setSelected] = useState(0);
  const [visibility, setVisibility] = useState([]);

  useEffect(() => {
    if(visibility.includes(true)) {
      setTabs([...tabs, {
        id: 'tab-2',
        content: "Custom Search"
      }])
      setSelected(1)
    } else {
      setTabs(defaultTabs)
    }
  }, [visibility])
  console.log("visibility", visibility);

  const handleTabChange = (index) => {
    setSelected(index);
  };
  return (
    <TabContext.Provider value={{ visibility, setVisibility }}>
      <Tabs tabs={tabs} selected={selected}>
        {children}
      </Tabs>
    </TabContext.Provider>
  );
}

export default Tab;


