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
import React, { useMemo } from "react";
import { ParentBuild } from "@drill4j/types-admin";
import { TableActionsProvider, useQueryParams } from "@drill4j/ui-kit";

import tw, { styled } from "twin.macro";

import { BuildMethodsCard } from "components";
import { ActiveScopeInfo } from "modules";
import { Methods } from "types/methods";
import { BuildCoverage } from "types/build-coverage";
import {
  useActiveScope, useAgent, useAgentRouteParams, useBuildVersion, usePreviousBuildCoverage,
} from "hooks";
import { AGENT_STATUS } from "common/constants";
import { PreviousBuildInfo } from "./previous-build-info-types";
import { BuildCoverageInfo } from "./build-coverage-info";
import { ActiveBuildCoverageInfo } from "./active-build-coverage-info";
import { MethodsTable } from "../../methods-table";

const Info = styled.div`
  ${tw`grid gap-8`}
  grid-template-columns: 1fr 320px;
  @media screen and (min-width: 1024px) {
    grid-template-columns: auto max-content;
  }
`;

const Cards = styled.div<{isShowActiveScopeInfo?: boolean}>`
  ${tw`grid gap-2 col-start-1 grid-flow-row lg:grid-cols-3`}
  ${({ isShowActiveScopeInfo }) => !isShowActiveScopeInfo && tw`col-span-2 grid-cols-3`}
`;

const ActiveBuildTestsBar = styled.div<{isShowActiveScopeInfo?: boolean}>`
  ${tw`col-start-1 col-span-2 lg:col-span-1`}
  ${({ isShowActiveScopeInfo }) => !isShowActiveScopeInfo && tw`col-span-2 lg:col-span-2`}
`;

export const BuildMethodsInfo = () => {
  const { agentId = "" } = useAgentRouteParams();
  const scope = useActiveScope();
  const {
    all, new: newMethods, modified, deleted, risks,
  } = useBuildVersion<Methods>("/build/methods") || {};
  const { version: previousBuildVersion = "" } = useBuildVersion<ParentBuild>("/data/parent") || {};
  const buildCoverage = useBuildVersion<BuildCoverage>("/build/coverage") || {};
  const {
    percentage: previousBuildCodeCoverage = 0,
  } = usePreviousBuildCoverage(previousBuildVersion) || {};
  const { status } = useAgent(agentId) || {};
  const { percentage: buildCodeCoverage = 0 } = buildCoverage;
  const isShowActiveScopeInfo = scope?.active && status === AGENT_STATUS.ONLINE;
  const previousBuildInfo: PreviousBuildInfo = { previousBuildVersion, previousBuildCodeCoverage };

  return (
    <>
      <Info>
        <ActiveBuildTestsBar isShowActiveScopeInfo={isShowActiveScopeInfo}>
          {(scope?.active && status === AGENT_STATUS.ONLINE) ? (
            <ActiveBuildCoverageInfo
              buildCoverage={buildCoverage}
              previousBuildInfo={previousBuildInfo}
              scope={scope}
              status={status}
            />
          ) : (
            <BuildCoverageInfo
              buildCodeCoverage={buildCodeCoverage}
              previousBuildInfo={previousBuildInfo}
            />
          )}
        </ActiveBuildTestsBar>
        <Cards isShowActiveScopeInfo={isShowActiveScopeInfo}>
          <BuildMethodsCard
            totalCount={all?.total}
            covered={all?.covered}
            label="TOTAL METHODS"
            testContext="deleted-methods"
          >
            {deleted?.total} <span tw="font-regular">deleted</span>
          </BuildMethodsCard>
          <BuildMethodsCard
            totalCount={newMethods?.total}
            covered={newMethods?.covered}
            label="NEW"
          >
            {Boolean(risks?.new) && (
              <span data-test="build-project-methods:link-button:new:risks">
                {risks?.new} risks
              </span>
            )}
          </BuildMethodsCard>
          <BuildMethodsCard
            totalCount={modified?.total}
            covered={modified?.covered}
            label="MODIFIED"
          >
            {Boolean(risks?.modified) && (
              <span data-test="build-project-methods:link-button:modified:risks">
                {risks?.modified} risks
              </span>
            )}
          </BuildMethodsCard>
        </Cards>
        {isShowActiveScopeInfo && (
          <div tw="lg:col-start-2 lg:row-start-1 lg:row-end-3">
            <ActiveScopeInfo scope={scope} />
          </div>
        )}
      </Info>
      <MethodsTable
        topic="/build/coverage/packages"
        classesTopicPrefix="build"
        showCoverageIcon={Boolean(buildCoverage?.finishedScopesCount)}
      />
    </>
  );
};
