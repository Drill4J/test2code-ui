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
import React from "react";
import { Route } from "react-router-dom";
import { Icons } from "@drill4j/ui-kit";
import tw, { styled } from "twin.macro";

import { getAgentRoutePath } from "router";
import { getPagePath, routes } from "common";
import { Tab, TabsPanel } from "components";
import { CoveragePluginHeader } from "./coverage-plugin-header";
import { BuildMethodsInfo } from "./build-methods-info";
import { BuildTestsInfo } from "./build-tests-info";

const TabIconWrapper = styled.div`
  ${tw`flex items-center mr-2 text-monochrome-black`}
`;

export const BuildOverview = () => (
  <>
    <CoveragePluginHeader />
    <div tw="mb-4 border-b border-monochrome-medium-tint">
      <TabsPanel path={getAgentRoutePath("/:tab")}>
        <Tab name="methods" to={getPagePath({ name: "methods" })}>
          <TabIconWrapper>
            <Icons.Function />
          </TabIconWrapper>
          Build methods
        </Tab>
        <Tab name="tests" to={getPagePath({ name: "tests" })}>
          <TabIconWrapper>
            <Icons.Test width={16} />
          </TabIconWrapper>
          Build tests
        </Tab>
      </TabsPanel>
    </div>
    <Route path={getAgentRoutePath(routes.methods)} component={BuildMethodsInfo} />
    <Route path={getAgentRoutePath(routes.tests)} component={BuildTestsInfo} />
  </>
);
