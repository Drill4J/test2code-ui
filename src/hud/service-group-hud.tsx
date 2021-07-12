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

import { useGroupRouteParams, useServiceGroup } from "hooks";
import { ServiceGroupSummary } from "types/service-group-summary";
import { PluginCard } from "./plugin-card";
import {
  CoverageSection, RisksSection, TestsSection, TestsToRunSection,
} from "./service-group-sections";

export interface GroupHudProps {
  customProps: { pluginPagePath: string; }
}

export const ServiceGroupHud = ({ customProps: { pluginPagePath } }: GroupHudProps) => {
  const { groupId } = useGroupRouteParams();
  const {
    aggregated: {
      scopeCount = 0,
      coverage = 0,
      methodCount = {},
      tests = [],
      testsToRun = {},
      riskCounts = {},
    } = {},
  } = useServiceGroup<ServiceGroupSummary>("/group/summary", groupId, "test2code") || {};

  return (
    <PluginCard pluginLink={pluginPagePath}>
      <CoverageSection totalCoverage={coverage} methodCount={methodCount} />
      <TestsSection testsType={tests} scopeCount={scopeCount} />
      <RisksSection risks={riskCounts} />
      <TestsToRunSection testsToRun={testsToRun} />
    </PluginCard>
  );
};
