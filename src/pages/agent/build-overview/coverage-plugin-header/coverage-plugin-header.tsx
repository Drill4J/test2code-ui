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
import React, { useCallback, useEffect, useState } from "react";
import {
  Button, Icons, Autocomplete, HeadlessSelect,
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
import {
  Risk, Filter, TestTypeSummary, BetweenOp,
} from "types";
import { PageHeader } from "components";
import { useFilterState, useSetFilterDispatch } from "common";
import { ActionSection } from "./action-section";
import { QualityGate } from "./quality-gate";
import { ConfigureFilter } from "./configure-filter";

enum FILTER_STATE {
  CREATING = "CREATING",
  EDITING = "EDITING",
}

type ConfigureFilterSate = FILTER_STATE.EDITING | FILTER_STATE.CREATING | null

export const CoveragePluginHeader = () => {
  const [configureFilterState, setConfigureFilter] = useState<ConfigureFilterSate>(null);
  const { agentId = "" } = useAgentRouteParams();
  const { buildVersion } = useTestToCodeRouteParams();
  const { getPagePath } = useNavigation();

  const { buildVersion: activeBuildVersion = "", buildStatus } = useActiveBuild(agentId) || {};
  const { risks: risksCount = 0, tests: testToRunCount = 0 } = useFilteredData<Metrics>("/data/stats") || {};
  const initialRisks = useFilteredData<Risk[]>("/build/risks") || [];
  const { version: previousBuildVersion = "" } = useFilteredData<ParentBuild>("/data/parent") || {};
  const { byTestType: previousBuildTests = [] } = usePreviousBuildCoverage(previousBuildVersion) || {};
  const filters = useTestToCodeData<Filter[]>("/build/filters") || [];
  const testsByType = useTestToCodeData<TestTypeSummary[]>("/build/summary/tests/by-type") || [];

  const closeConfigureFilter = useCallback(() => setConfigureFilter(null), [setConfigureFilter]);
  const setFilter = useSetFilterDispatch();
  const { filterId } = useFilterState();

  const hasTestsInBuild = Boolean(testsByType.length);

  return (
    <>
      <Header>
        <div tw="col-span-4 lg:col-span-1 mr-6 font-light text-24 leading-32" data-test="coverage-plugin-header:plugin-name">Test2Code</div>
        <div tw="flex items-center gap-x-4 py-2 px-6 border-l border-monochrome-medium-tint ">
          {Boolean(filters.length) && (
            <HeadlessSelect
              tw="w-[320px]"
              options={filters.map(({ name = "", id = "" }) => ({ label: name, value: id }))}
            >
              {({
                options, selectedOption, isOpen, selectValue, setIsOpen,
              }) => {
                useEffect(() => {
                  selectValue(filterId || "");
                }, [filterId]);

                return (
                  <>
                    <HeadlessSelect.Input>
                      {selectedOption
                        ? <HeadlessSelect.SelectedValue>{selectedOption.label}</HeadlessSelect.SelectedValue>
                        : <HeadlessSelect.Placeholder>Select filter</HeadlessSelect.Placeholder>}
                    </HeadlessSelect.Input>
                    {isOpen && (
                      <HeadlessSelect.Body>
                        <HeadlessSelect.ContainerWithScroll>
                          {options.map(({ label, value }) => (
                            <HeadlessSelect.Option
                              selected={value === selectedOption?.value}
                              onClick={() => {
                                selectValue(value);
                                setFilter(value as any);
                                setConfigureFilter(null);
                                setIsOpen(false);
                              }}
                            >
                              {label}
                            </HeadlessSelect.Option>
                          ))}
                        </HeadlessSelect.ContainerWithScroll>
                      </HeadlessSelect.Body>
                    )}
                  </>
                );
              }}
            </HeadlessSelect>
          )}
          <Button
            tw="flex items-center gap-x-2"
            secondary
            size="large"
            disabled={!hasTestsInBuild}
            onClick={() => setConfigureFilter(FILTER_STATE.CREATING)}
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
        {filterId && (
          <ShowCriteria
            tw="absolute left-1/2 -translate-x-1/2 top-full flex items-center gap-x-1 px-2"
            onClick={() => setConfigureFilter(FILTER_STATE.EDITING)}
          >
            <Icons.Expander width={8} height={8} rotate={90} /> Show Criteria
          </ShowCriteria>
        )}
      </Header>
      {configureFilterState && (
        <ConfigureFilter
          closeConfigureFilter={closeConfigureFilter}
          filterId={configureFilterState === FILTER_STATE.EDITING ? filterId : null}
        />
      )}
    </>
  );
};

const Header = styled(PageHeader)`
  ${tw`relative grid grid-rows-2 lg:grid-rows-1 grid-cols-4 gap-2 w-full`}
  @media screen and (min-width: 1024px) {
    grid-template-columns: max-content auto max-content max-content max-content !important;
  }
`;

const Count = styled(Link)`
  ${tw`flex items-center w-full text-20 leading-32 cursor-pointer`}
  ${tw`text-monochrome-black hover:text-blue-medium-tint active:text-blue-shade`}
`;

const ShowCriteria = styled.button`
  ${tw`border border-monochrome-medium-tint bg-monochrome-white text-blue-default text-10 leading-14 font-bold`}
  border-radius: 0px 0px 8px 8px ;
`;
