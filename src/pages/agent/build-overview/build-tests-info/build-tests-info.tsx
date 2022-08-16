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
import tw, { styled } from "twin.macro";
import { TableActionsProvider } from "@drill4j/ui-kit";
import { BuildTestsCard } from "components";
import { TestTypeSummary } from "types/test-type-summary";
import { TestsInfo } from "types/tests-info";
import {
  useActiveBuild, useActiveScope, useAgentRouteParams, useFilteredData,
} from "hooks";
import { BUILD_STATUS } from "common/constants";
import { ActiveScopeInfo } from "modules";
import { ActiveBuildTestsInfo } from "./active-build-tests-info";
import { BuildTestsTable } from "./build-tests-table";

const Info = styled.div`
  ${tw`grid gap-8`}
  grid-template-columns: 1fr 320px;
  @media screen and (min-width: 1024px) {
    grid-template-columns: auto max-content;
  }
`;

const ActiveBuildTestsBar = styled.div<{isShowActiveScopeInfo?: boolean}>`
  ${tw`col-start-1 col-span-2 lg:col-span-1`}
  ${({ isShowActiveScopeInfo }) => !isShowActiveScopeInfo && tw`col-span-2 lg:col-span-2`}
`;

const Cards = styled.div<{isShowActiveScopeInfo?: boolean}>`
  ${tw`flex gap-2 flex-col lg:flex-row col-start-1 lg:grid-cols-2`}
  ${({ isShowActiveScopeInfo }) => !isShowActiveScopeInfo && tw`col-span-2`}
  & > div {
    ${({ isShowActiveScopeInfo }) => isShowActiveScopeInfo && tw`lg:h-full`}
  }
`;

export const BuildTestsInfo = () => {
  const { agentId } = useAgentRouteParams();
  const testsByType = useFilteredData<TestTypeSummary[]>("/build/summary/tests/by-type") || [];
  const testsInfo: TestsInfo = testsByType.reduce((test, testType) => ({ ...test, [testType.type]: testType }), {});
  const scope = useActiveScope();
  const { buildStatus } = useActiveBuild(agentId) || {};
  const isShowActiveScopeInfo = scope?.active && buildStatus === BUILD_STATUS.ONLINE;

  return (
    <>
      <Info>
        <ActiveBuildTestsBar isShowActiveScopeInfo={isShowActiveScopeInfo}>
          <ActiveBuildTestsInfo testsInfo={testsInfo} />
        </ActiveBuildTestsBar>
        <Cards isShowActiveScopeInfo={isShowActiveScopeInfo}>
          {testsByType.map(({ type, summary }) => <BuildTestsCard key={type} label={type} testTypeSummary={summary} />)}
        </Cards>
        {isShowActiveScopeInfo && (
          <div tw="lg:col-start-2 lg:row-start-1 lg:row-end-3">
            <ActiveScopeInfo scope={scope} />
          </div>
        )}
      </Info>
      <TableActionsProvider>
        <BuildTestsTable />
      </TableActionsProvider>
    </>
  );
};
