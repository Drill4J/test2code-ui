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
import { Tooltip, Typography } from "@drill4j/ui-kit";
import { NavLink, useLocation } from "react-router-dom";
import tw, { styled } from "twin.macro";

import { percentFormatter } from "@drill4j/common-utils";
import { BuildSummary } from "types/build-summary";
import { Methods } from "types/methods";
import { COVERAGE_TYPES_COLOR } from "common/constants";
import { ParentBuild } from "types/parent-build";
import { SingleBar, CoverageSectionTooltip, DashboardSection } from "components";
import { useBuildVersion, usePreviousBuildCoverage } from "hooks";

interface Props {
  buildVersion?: string;
}

export const CoverageSection = ({ buildVersion }: Props) => {
  const { pathname } = useLocation();
  const { version: previousBuildVersion = "" } = useBuildVersion<ParentBuild>("/data/parent", { buildVersion }) || {};
  const { percentage: previousBuildCodeCoverage = 0 } = usePreviousBuildCoverage(previousBuildVersion) || {};
  const { coverage: buildCodeCoverage = 0, scopeCount = 0 } = useBuildVersion<BuildSummary>("/build/summary", { buildVersion }) || {};
  const {
    all: {
      total: allMethodsTotalCount = 0,
      covered: allMethodsCoveredCount = 0,
    } = {},
    new: {
      total: newMethodsTotalCount = 0,
      covered: newMethodsCoveredCount = 0,
    } = {},
    modified: {
      total: modifiedMethodsTotalCount = 0,
      covered: modifiedMethodsCoveredCount = 0,
    } = {},
  } = useBuildVersion<Methods>("/build/methods") || {};
  const tooltipData = {
    totalCovered: {
      total: allMethodsTotalCount,
      covered: allMethodsCoveredCount,
    },
    new: {
      total: newMethodsTotalCount,
      covered: newMethodsCoveredCount,
    },
    modified: {
      total: modifiedMethodsTotalCount,
      covered: modifiedMethodsCoveredCount,
    },
  };
  const buildDiff = percentFormatter(buildCodeCoverage) - percentFormatter(previousBuildCodeCoverage);
  const isFirstBuild = !previousBuildVersion;

  return (
    <div>
      <DashboardSection
        label="Build Coverage"
        info={`${percentFormatter(buildCodeCoverage)}%`}
        graph={(
          <Tooltip message={<CoverageSectionTooltip data={tooltipData} />}>
            <div tw="relative">
              <SingleBar
                width={108}
                height={128}
                color={COVERAGE_TYPES_COLOR.TOTAL}
                percent={percentFormatter(buildCodeCoverage)}
              />
              {!isFirstBuild && (
                <div
                  tw="absolute w-27 border-t border-dashed border-monochrome-shade"
                  style={{ bottom: `${previousBuildCodeCoverage}%` }}
                />
              )}
            </div>
          </Tooltip>
        )}
        additionalInfo={(
          Boolean(buildDiff) && !isFirstBuild && scopeCount > 0 && (
            <BuildInfo tw="w-full">
              <span tw="whitespace-nowrap">{`${buildDiff > 0 ? "+" : "-"} ${percentFormatter(Math.abs(buildDiff))}% vs`}</span>
              <Typography.MiddleEllipsis tw="inline">
                <NavLink
                  tw="whitespace-nowrap link font-bold leading-16 no-underline max-w-[210px]"
                  to={`${pathname}/plugins/test2code/builds/${previousBuildVersion}/overview`}
                  title={`Build ${previousBuildVersion}`}
                >
                    &nbsp;Build&nbsp;
                  <span className="ellipseMe">
                    {previousBuildVersion}
                  </span>
                </NavLink>
              </Typography.MiddleEllipsis>
            </BuildInfo>
          ))}
      />
    </div>
  );
};

const BuildInfo = styled.div`
  ${tw`grid items-center`}
  & {
    grid-template-columns: max-content 1fr;
  }
`;
