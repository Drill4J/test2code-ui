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
import { FilterList, ParentBuild } from "@drill4j/types-admin";
import "twin.macro";

import { useAgentRouteParams, useBuildVersion } from "hooks";
import { Risk } from "types";
import { useTableActionsState } from "@drill4j/ui-kit";
import { RisksPageHeader } from "./risks-page-header";
import { RisksTable } from "./risks-table";

export const RisksPage = () => {
  const { search, sort } = useTableActionsState();
  const { buildVersion } = useAgentRouteParams();
  const { version: previousBuildVersion = "" } = useBuildVersion<ParentBuild>("/data/parent") || {};
  const {
    items: risks = [],
    filteredCount = 0,
  } = useBuildVersion<FilterList<Risk>>("/build/risks", { filters: search, orderBy: sort, output: "LIST" }) || {};
  const notCoveredRisksCount = risks.filter(({ coverage = 0 }) => coverage === 0).length;
  return (
    <div tw="space-y-6">
      <RisksPageHeader
        buildVersion={buildVersion}
        previousBuildVersion={previousBuildVersion}
        notCoveredRisksCount={notCoveredRisksCount}
      />
      <div tw="flex-grow">
        <RisksTable data={risks} filteredCount={filteredCount} />
      </div>
    </div>
  );
};
