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
import { Tooltip } from "@drill4j/ui-kit";
import "twin.macro";

import { SingleBar, DashboardSection } from "components";
import { BuildCoverage } from "types/build-coverage";
import { capitalize, convertToPercentage } from "@drill4j/common-utils";
import { useBuildVersion } from "hooks";
import { TestTypeSummary } from "types/test-type-summary";
import { SectionTooltip, TestsTypeSummaryWithColor } from "./section-tooltip";

export const TestsSection = () => {
  const { byTestType = [], finishedScopesCount = 0 } = useBuildVersion<BuildCoverage>("/build/coverage") || {};
  const totalCoveredMethodCount = byTestType.reduce((acc, { summary: { testCount = 0 } }) => acc + testCount, 0);
  const testsByTypeWithColors = addColors(byTestType);

  return (
    <DashboardSection
      label="Tests"
      info={totalCoveredMethodCount}
      additionalInfo={`${finishedScopesCount} scopes`}
      graph={(
        <Tooltip message={<SectionTooltip data={testsByTypeWithColors} />}>
          <div tw="flex items-center w-full">
            {testsByTypeWithColors.map(({ type, summary, color }) => (
              <SingleBar
                key={type}
                width={64}
                height={128}
                color={color}
                percent={convertToPercentage(summary.testCount || 0, totalCoveredMethodCount)}
                icon={capitalize(type)}
              />
            ))}
          </div>
        </Tooltip>
      )}
    />
  );
};

function addColors(tests: TestTypeSummary[]):TestsTypeSummaryWithColor {
  const colors = [
    "#D599FF",
    "#88E2F3",
    "#F0876F",
    "#A3D381",
    "#E677C3",
    "#EE7785",
    "#5FEDCE",
    "#FF7FA8",
    "#E79B5F",
    "#6B7EED",
    "#FF9291",
    "#D6AF5C",
    "#B878DC",
    "#FFA983",
    "#BFC267",
    "#83E1A5",
    "#EDD78E",
  ];
  return tests.map((test, i) => ({ ...test, color: colors[i] }));
}
