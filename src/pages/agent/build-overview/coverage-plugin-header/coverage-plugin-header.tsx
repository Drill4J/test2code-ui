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
import React, { useCallback, useState } from "react";
import {
  Button, Icons, LightDropdown,
} from "@drill4j/ui-kit";
import { Link } from "react-router-dom";
import tw, { styled } from "twin.macro";

import { BUILD_STATUS } from "common/constants";
import {
  useActiveBuild, useAgentRouteParams, useFilteredData, useNavigation,
  usePreviousBuildCoverage, useTestToCodeRouteParams, useTestToCodeData,
} from "hooks";
import { ParentBuild } from "types/parent-build";
import { Metrics } from "types/metrics";
import { Risk, Filter } from "types";
import { PageHeader } from "components";
import { useSetFilterDispatch } from "common";
import { ActionSection } from "./action-section";
import { QualityGate } from "./quality-gate";
import { ConfigureFilter } from "./configure-filter";

export const CoveragePluginHeader = () => {
  const [isConfigureFilter, setIsConfigureFilter] = useState(false);
  const { agentId = "" } = useAgentRouteParams();
  const { buildVersion } = useTestToCodeRouteParams();
  const { getPagePath } = useNavigation();
  const { buildVersion: activeBuildVersion = "", buildStatus } = useActiveBuild(agentId) || {};
  const { risks: risksCount = 0, tests: testToRunCount = 0 } = useFilteredData<Metrics>("/data/stats") || {};
  const initialRisks = useFilteredData<Risk[]>("/build/risks") || [];
  const { version: previousBuildVersion = "" } = useFilteredData<ParentBuild>("/data/parent") || {};
  const filters = useTestToCodeData<Filter[]>("/build/filters") || [];
  const { byTestType: previousBuildTests = [] } = usePreviousBuildCoverage(previousBuildVersion) || {};
  const closeConfigureFilter = useCallback(() => setIsConfigureFilter(false), [setIsConfigureFilter]);
  const setFilter = useSetFilterDispatch();

  return (
    <>
      <Header>
        <div tw="col-span-4 lg:col-span-1 mr-6 font-light text-24 leading-32" data-test="coverage-plugin-header:plugin-name">Test2Code</div>
        <div tw="flex items-center gap-x-4 py-2 px-6 border-l border-monochrome-medium-tint ">
          {Boolean(filters.length) && (
            <LightDropdown
              tw="w-[320px]"
              placeholder="Select filter"
              onChange={(filter) => setFilter(filter as any)}
              options={filters.map(({ name = "", id = "" }) => ({ label: name, value: id }))}
            />
          )}
          <Button
            tw="flex items-center gap-x-2"
            secondary
            size="large"
            onClick={() => setIsConfigureFilter(true)}
          >
            <Icons.Filter /> Add New Filter
          </Button>
        </div>
        {activeBuildVersion === buildVersion && buildStatus === BUILD_STATUS.ONLINE && <QualityGate />}
        <ActionSection
          label="risks"
          previousBuild={{ previousBuildVersion, previousBuildTests }}
        >
          {initialRisks.length
            ? (
              <Count
                to={getPagePath({ name: "risks", params: { buildVersion } })}
                className="flex items-center w-full"
                data-test="action-section:count:risks"
              >
                {risksCount}
                <Icons.Expander tw="ml-1 text-blue-default" width={8} height={8} />
              </Count>
            ) : <span data-test="action-section:no-value:risks">&ndash;</span>}
        </ActionSection>
        <ActionSection
          label="tests to run"
          previousBuild={{ previousBuildVersion, previousBuildTests }}
        >
          {previousBuildTests.length > 0 ? (
            <Count
              to={getPagePath({ name: "testsToRun", params: { buildVersion } })}
              className="flex items-center w-full"
              data-test="action-section:count:tests-to-run"
            >
              {testToRunCount}
              <Icons.Expander tw="ml-1 text-blue-default" width={8} height={8} />
            </Count>
          ) : (
            <div
              tw="text-20 leading-32 text-monochrome-black"
              data-test="action-section:no-value:tests-to-run"
            >
              &ndash;
            </div>
          )}
        </ActionSection>
      </Header>
      {isConfigureFilter && <ConfigureFilter closeConfigureFilter={closeConfigureFilter} />}
    </>
  );
};

const Header = styled(PageHeader)`
  ${tw`grid grid-rows-2 lg:grid-rows-1 grid-cols-4 gap-2 w-full`}
  @media screen and (min-width: 1024px) {
    grid-template-columns: max-content auto max-content max-content max-content !important;
  }
`;

const Count = styled(Link)`
  ${tw`flex items-center w-full text-20 leading-32 cursor-pointer`}
  ${tw`text-monochrome-black hover:text-blue-medium-tint active:text-blue-shade`}
`;
