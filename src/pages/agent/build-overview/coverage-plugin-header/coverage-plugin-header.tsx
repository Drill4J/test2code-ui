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
  Button, HeadlessSelect, Icons, sendAlertEvent,
} from "@drill4j/ui-kit";
import { Link } from "react-router-dom";
import tw, { styled } from "twin.macro";

import { BUILD_STATUS } from "common/constants";
import {
  useActiveBuild,
  useAgentRouteParams,
  useFilteredData,
  useNavigation,
  usePreviousBuildCoverage,
  useTestToCodeData,
  useTestToCodeRouteParams,
} from "hooks";
import { ParentBuild } from "types/parent-build";
import { Metrics } from "types/metrics";
import { Filter, Risk, TestTypeSummary } from "types";
import { PageHeader } from "components";
import { useFilterState, useSetFilterDispatch } from "common";
import { applyFilter } from "pages/agent/api";
import { useResultFilterState } from "common/contexts";
import { ActionSection } from "./action-section";
import { QualityGate } from "./quality-gate";
import { ConfigureFilter } from "./global-filter";
import { ConfigureFilterSate, FILTER_STATE } from "./types";

export const CoveragePluginHeader = () => {
  const [configureFilterState, setConfigureFilter] = useState<ConfigureFilterSate>(null);
  const { agentId = "" } = useAgentRouteParams();
  const { buildVersion } = useTestToCodeRouteParams();
  const { getPagePath } = useNavigation();

  const { buildVersion: activeBuildVersion = "", buildStatus } = useActiveBuild(agentId) || {};
  const { risks: risksCount = 0, tests: testToRunCount = 0 } = useFilteredData<Metrics>("/data/stats") || {};
  const initialRisks = useFilteredData<Risk[]>("/build/risks") || [];
  const { version: previousBuildVersion = "" } = useTestToCodeData<ParentBuild>("/data/parent") || {};
  const { byTestType: previousBuildTests = [] } = usePreviousBuildCoverage(previousBuildVersion) || {};
  const filters = useTestToCodeData<Filter[]>("/build/filters") || [];
  const testsByType = useFilteredData<TestTypeSummary[]>("/build/summary/tests/by-type") || [];

  const closeConfigureFilter = useCallback(() => setConfigureFilter(null), [setConfigureFilter]);
  const setFilter = useSetFilterDispatch();
  const { filterId } = useFilterState();
  const { isEmptyFilterResult } = useResultFilterState();

  const hasTestsInBuild = Boolean(testsByType.length);

  const isActiveBuild = buildVersion === activeBuildVersion;

  useEffect(() => {
    if (filterId && !filters.filter(filter => filter.id === filterId).length) {
      setFilter(null);
      setConfigureFilter(null);
    }
  }, [filterId, filters]);

  return (
    <>
      <Header>
        <div tw="col-span-4 lg:col-span-1 mr-6 font-light text-24 leading-32" data-test="coverage-plugin-header:plugin-name">Test2Code</div>
        <div tw="flex items-center gap-x-4 py-2 px-6 border-l border-monochrome-medium-tint ">
          {Boolean(filters.length) && isActiveBuild && (
            <HeadlessSelect
              tw="w-[320px]"
              options={filters.map(({ name = "", id = "" }) => ({ label: name, value: id }))}
            >
              {({
                options, selectedOption, isOpen, selectValue, setIsOpen,
              }) => {
                const unSelectFilter = useCallback((e) => {
                  e.stopPropagation();
                  selectValue("");
                  setFilter(null);
                  setConfigureFilter(null);
                }, []);

                useEffect(() => {
                  selectValue(filterId || "");
                }, [filterId]);

                return (
                  <>
                    <HeadlessSelect.Input isActive={isOpen}>
                      <div tw="flex justify-between items-center flex-grow">
                        {selectedOption
                          ? <HeadlessSelect.SelectedValue>{selectedOption.label}</HeadlessSelect.SelectedValue>
                          : <HeadlessSelect.Placeholder>Select filter</HeadlessSelect.Placeholder>}
                        {selectedOption && (
                          <Icons.Close
                            width={12}
                            height={12}
                            onClick={unSelectFilter}
                          />
                        )}
                      </div>
                    </HeadlessSelect.Input>
                    {isOpen && (
                      <HeadlessSelect.Body>
                        <HeadlessSelect.ContainerWithScroll>
                          {options.map(({ label, value }) => (
                            <HeadlessSelect.Option
                              selected={value === selectedOption?.value}
                              onClick={async () => {
                                await applyFilter(agentId, { id: value },
                                  {
                                    onSuccess: () => {
                                      selectValue(value);
                                      setFilter(value);
                                      setConfigureFilter(FILTER_STATE.EDITING);
                                      setIsOpen(false);
                                    },
                                    onError: (message) => {
                                      sendAlertEvent({ type: "ERROR", title: message });
                                    },
                                  });
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
            disabled={!hasTestsInBuild || !isActiveBuild}
            onClick={() => {
              setConfigureFilter(FILTER_STATE.CREATING);
              setFilter(null);
            }}
          >
            <Icons.Filter /> Add New Filter
          </Button>
        </div>
        {activeBuildVersion === buildVersion && buildStatus === BUILD_STATUS.ONLINE && <QualityGate />}
        <ActionSection
          label="risks"
          previousBuild={{ previousBuildVersion, previousBuildTests }}
        >
          {getRisksSection(isEmptyFilterResult, initialRisks, buildVersion, risksCount, getPagePath)}
        </ActionSection>
        <ActionSection
          label="tests to run"
          previousBuild={{ previousBuildVersion, previousBuildTests }}
        >
          {getTestsToRunSection(isEmptyFilterResult, previousBuildTests, buildVersion, testToRunCount, getPagePath)}
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
          filterId={configureFilterState === FILTER_STATE.EDITING || configureFilterState === FILTER_STATE.DUPLICATE ? filterId : null}
          configureFilterState={configureFilterState}
          setConfigureFilter={setConfigureFilter}
          filters={filters}
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

const getTestsToRunSection = (isEmptyFilterResult: boolean, previousBuildTests: TestTypeSummary[],
  buildVersion: string, testToRunCount: number, getPagePath: any) => {
  if (isEmptyFilterResult) {
    return (
      <div
        tw="text-20 leading-32 text-monochrome-dark-tint"
        data-test="action-section:no-value:tests-to-run"
      >
        n/a
      </div>
    );
  }
  if (!previousBuildTests.length) {
    return (
      <div
        tw="text-20 leading-32 text-monochrome-black"
        data-test="action-section:no-value:tests-to-run"
      >
        &ndash;
      </div>
    );
  }
  return (
    <Count
      to={getPagePath({ name: "testsToRun", params: { buildVersion } })}
      tw="flex items-center w-full"
      data-test="action-section:count:tests-to-run"
    >
      {testToRunCount}
      <Icons.Expander tw="ml-1 text-blue-default" width={8} height={8} />
    </Count>
  );
};

const getRisksSection = (isEmptyFilterResult: boolean, initialRisks: Risk[],
  buildVersion: string, risksCount: number, getPagePath: any) => {
  if (isEmptyFilterResult) {
    return (
      <div
        tw="text-20 leading-32 text-monochrome-dark-tint"
        data-test="action-section:no-value:risks"
      >
        n/a
      </div>
    );
  }
  if (!initialRisks.length) {
    return (
      <span data-test="action-section:no-value:risks">&ndash;</span>
    );
  }
  return (
    <Count
      to={getPagePath({ name: "risks", params: { buildVersion } })}
      tw="flex items-center w-full"
      data-test="action-section:count:risks"
    >
      {risksCount}
      <Icons.Expander tw="ml-1 text-blue-default" width={8} height={8} />
    </Count>
  );
};
