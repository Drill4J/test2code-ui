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
import React, { useRef } from "react";
import {
  MainProgressBar, AdditionalProgressBar, StripedProgressBar, Tooltip, useElementSize,
} from "@drill4j/ui-kit";
import { percentFormatter } from "@drill4j/common-utils";
import tw, { styled } from "twin.macro";
import {
  useActiveBuild, useActiveScope, useActiveSessions, useAgentRouteParams, useFilteredData, useTestToCodeRouteParams,
} from "hooks";
import { BUILD_STATUS } from "common";
import { BuildCoverage } from "types/build-coverage";

const Message = styled.div`
  ${tw`text-center`}
`;

export const MultiProgressBar = () => {
  const { agentId } = useAgentRouteParams();
  const { buildVersion } = useTestToCodeRouteParams();
  const node = useRef<HTMLDivElement>(null);
  const { width } = useElementSize(node);
  const { buildStatus } = useActiveBuild(agentId) || {};
  const activeSessions = useActiveSessions("Agent", agentId, buildVersion);
  const active = Boolean(activeSessions?.length) && buildStatus === BUILD_STATUS.ONLINE;
  const scope = useActiveScope();
  const buildCoverage = useFilteredData<BuildCoverage>("/build/coverage");
  const {
    coverage: {
      percentage: coveragePercentage = 0,
      overlap: { percentage: overlappingCode = 0 } = {},
    } = {},
  } = scope || {};
  const uniqueCodeCoverage = percentFormatter(coveragePercentage) - percentFormatter(Number(overlappingCode));

  return (
    <div tw="relative w-full h-8 rounded bg-monochrome-light-tint" ref={node}>
      {buildCoverage && scope && (
        <>
          <Tooltip
            message={(
              <Message>
                <span tw="font-bold">{percentFormatter(Number(buildCoverage?.percentage))}%</span> of current build has <br />
                already been covered by tests
              </Message>
            )}
          >
            <MainProgressBar value={`${Number(buildCoverage?.percentage) * (width / 100)}px`} testContext="build-coverage" />
          </Tooltip>
          <div
            tw="flex absolute bottom-1/2 transform translate-y-1/2"
            style={{ left: `${Number(buildCoverage?.percentage) - overlappingCode}%` }}
          >
            <Tooltip
              message={(
                <Message>
                  <span tw="font-bold">
                    {percentFormatter(overlappingCode)}%
                  </span> of current build coverage <br /> has been overlapped in active scope
                </Message>
              )}
            >
              <div
                tw="flex"
                data-test="multi-progress-bar:overlapping-code-progress-bar"
                style={{ width: `${overlappingCode * (width / 100)}px`, transform: "scale(-1)" }}
              >
                {active
                  ? <StripedProgressBar type="secondary" value={`${overlappingCode * (width / 100)}px`} />
                  : <AdditionalProgressBar type="secondary" value={`${overlappingCode * (width / 100)}px`} />}
              </div>
            </Tooltip>
            <Tooltip
              message={(
                <Message>
                  Active scope additionally covered <span tw="font-bold">+{percentFormatter(uniqueCodeCoverage)}%</span>. <br />
                  Finish your scope to add it to your total build coverage.
                </Message>
              )}
            >
              {active
                ? <StripedProgressBar type="primary" value={`${uniqueCodeCoverage * (width / 100)}px`} />
                : (
                  <AdditionalProgressBar
                    type="primary"
                    value={`${uniqueCodeCoverage * (width / 100)}px`}
                    testContext="unique-code-progress-bar"
                  />
                )}
            </Tooltip>
          </div>
        </>
      )}
    </div>
  );
};
