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
import { ParentBuild } from "@drill4j/types-admin";
import "twin.macro";

import { useAgentRouteParams, useBuildVersion } from "hooks";
import { mockedData } from "./mocked-data";
import { RisksPageHeader } from "./risks-page-header";
import { RisksTable } from "./risks-table";

export const Risks = () => {
  const { buildVersion } = useAgentRouteParams();
  const { version: previousBuildVersion = "" } = useBuildVersion<ParentBuild>("/data/parent") || {};
  const notCoveredRisksCount = mockedData.filter(({ coverage = 0 }) => coverage > 0).length;

  return (
    <div>
      <RisksPageHeader
        buildVersion={buildVersion}
        previousBuildVersion={previousBuildVersion}
        notCoveredRisksCount={notCoveredRisksCount}
      />
      <div tw="mt-6 mb-2  font-bold text-12 leading-16 text-monochrome-default" data-test="risks-list:table-title">
        ALL RISK METHODS ({mockedData.length})
      </div>
      <RisksTable data={mockedData} />
    </div>
  );
};
