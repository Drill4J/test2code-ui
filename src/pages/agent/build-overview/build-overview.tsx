/*
 * Copyright 2020 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { useState } from "react";
import { Icons, Tab } from "@drill4j/ui-kit";
import tw, { styled } from "twin.macro";

import { CoveragePluginHeader } from "./coverage-plugin-header";
import { BuildMethodsInfo } from "./build-methods-info";
import { BuildTestsInfo } from "./build-tests-info";

const TabIconWrapper = styled.div`
  ${tw`flex items-center mr-2 text-monochrome-black`}
`;

export const BuildOverview = () => {
  const [activeTab, setActiveTab] = useState("methods");
  return (
    <>
      <CoveragePluginHeader />
      <div tw="flex mb-4 border-b border-monochrome-medium-tint">
        <Tab active={activeTab === "methods"} onClick={() => setActiveTab("methods")}>
          <TabIconWrapper>
            <Icons.Function />
          </TabIconWrapper>
          Build methods
        </Tab>
        <Tab active={activeTab === "tests"} onClick={() => setActiveTab("tests")}>
          <TabIconWrapper>
            <Icons.Test width={16} />
          </TabIconWrapper>
          Build tests
        </Tab>
      </div>
      {activeTab === "methods" ? <BuildMethodsInfo /> : <BuildTestsInfo />}
    </>
  );
};
