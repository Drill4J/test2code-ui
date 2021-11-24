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

import { SingleBar, DashboardSection } from "components";
import { capitalize, convertToPercentage } from "@drill4j/common-utils";
import { SectionTooltip, TestType } from "./section-tooltip";

interface Props {
  testsColors: Record<string, string>;
  data: TestType[];
  testsToRunCount?: number;
}

export const TestsToRunSection = ({ testsColors, data, testsToRunCount = 0 }: Props) => (
  <DashboardSection
    label="Tests to run"
    info={testsToRunCount}
    graph={(
      <Tooltip message={<SectionTooltip data={data} hideValue testsColors={testsColors} />}>
        <div className="flex items-center w-full">
          {data.map(({
            testCount = 0, type = "",
          }) => (
            <SingleBar
              key={type}
              width={64}
              height={128}
              color={testsColors[type]}
              percent={convertToPercentage(testCount, testsToRunCount)}
              icon={capitalize(type)}
            />
          ))}
        </div>
      </Tooltip>
    )}
  />
);
