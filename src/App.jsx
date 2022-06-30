import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import React from "react";
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
} from "recoil";
import {
  Provider as AppBridgeProvider,
  useAppBridge,
} from "@shopify/app-bridge-react";
import { authenticatedFetch } from "@shopify/app-bridge-utils";
import { Redirect } from "@shopify/app-bridge/actions";
import {
  AppProvider as PolarisProvider,
  Card,
  Layout,
  Page,
} from "@shopify/polaris";
import translations from "@shopify/polaris/locales/en.json";
import "@shopify/polaris/build/esm/styles.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import AddPage from "./components/AddPage";
import Main from "./components/Main";
import EditPage from "./components/EditPage";
export default function App() {
  return (
    <BrowserRouter>
      <RecoilRoot>
        <PolarisProvider i18n={translations}>
          <AppBridgeProvider
            config={{
              apiKey: process.env.SHOPIFY_API_KEY,
              host: new URL(location).searchParams.get("host"),
              forceRedirect: true,
            }}
          >
            <Routes>
              <Route path="/" element={<Main />} />
              <Route path="/new" element={<AddPage />} />
              <Route path="/main" element={<Main />} />
              <Route path='/edit/:id' element={<EditPage />} />
            </Routes>
          </AppBridgeProvider>
        </PolarisProvider>
      </RecoilRoot>
    </BrowserRouter>
  );
}

function MyProvider({ children }) {
  const app = useAppBridge();

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      credentials: "include",
      fetch: userLoggedInFetch(app),
    }),
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

export function userLoggedInFetch(app) {
  const fetchFunction = authenticatedFetch(app);

  return async (uri, options) => {
    const response = await fetchFunction(uri, options);

    if (
      response.headers.get("X-Shopify-API-Request-Failure-Reauthorize") === "1"
    ) {
      const authUrlHeader = response.headers.get(
        "X-Shopify-API-Request-Failure-Reauthorize-Url"
      );

      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.APP, authUrlHeader || `/auth`);
      return null;
    }

    return response;
  };
}
