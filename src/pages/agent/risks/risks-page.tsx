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
import { useHistory } from "react-router-dom";
import { FilterList } from "@drill4j/types-admin";
import "twin.macro";

import { useBuildVersion, useNavigation, useTestToCodeRouteParams } from "hooks";
import { Risk } from "types";
import { Tab, useQueryParams, useTableActionsState } from "@drill4j/ui-kit";
import { RisksPageHeader } from "./risks-page-header";
import { CurrentRisksTable, PreviousRisksTable } from "./risks-tables";

export const RisksPage = () => {
  const { search, sort } = useTableActionsState();
  const { buildVersion } = useTestToCodeRouteParams();
  const { activeTab } = useQueryParams<{activeTab?: string; }>();
  const { push } = useHistory();
  const { getPagePath } = useNavigation();
  const {
    items: risks = [],
  } = useBuildVersion<FilterList<Risk>>("/build/risks", { filters: search, orderBy: sort, output: "LIST" }) || {};

  const currentRisks: Risk[] = [];
  const previousRisks: Risk[] = [];

  risks.forEach((risk:Risk) => (risk.previousCovered?.buildVersion ? previousRisks.push(risk) : currentRisks.push(risk)));

  return (
    <div tw="flex flex-col flex-grow">
      <RisksPageHeader />
      <div tw="px-6 flex flex-col flex-grow">
        <div tw="flex gap-x-6 mt-4 mb-8 border-b border-monochrome-medium-tint">
          <Tab
            active={!activeTab || activeTab === "current"}
            onClick={() => push(getPagePath({ name: "risks", params: { buildVersion }, queryParams: { activeTab: "current" } }))}
            data-test="risks:tab:current"
          >
            Current Risks
          </Tab>
          <Tab
            active={activeTab === "previously"}
            onClick={() => push(getPagePath({ name: "risks", params: { buildVersion }, queryParams: { activeTab: "previously" } }))}
            data-test="risks:tab:previously"
          >
            Previously Covered
          </Tab>
        </div>
        <div tw="flex flex-col flex-grow">
          {(!activeTab || activeTab === "current") && <CurrentRisksTable data={currentRisks} /> }
          {activeTab === "previously" && <PreviousRisksTable data={previousRisks} />}
        </div>
      </div>
    </div>
  );
};
