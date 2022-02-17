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
import React, { useMemo } from "react";
import {
  Menu, Icons, Status, Stub, Table, capitalize, Cells, sendAlertEvent,
} from "@drill4j/ui-kit";
import { useParams, Link, useHistory } from "react-router-dom";
import {
  percentFormatter, dateFormatter, timeFormatter, transformObjectsArrayToObject,
} from "@drill4j/common-utils";
import tw from "twin.macro";

import { ScopeSummary } from "types/scope-summary";
import { TestTypeSummary } from "types/test-type-summary";
import { useActiveBuild, useActiveScope, useBuildVersion } from "hooks";
import { BUILD_STATUS } from "common/constants";
import { getModalPath, getPagePath } from "common";
import { BuildCoverage } from "types/build-coverage";
import { toggleScope } from "../api";
import { ScopeTimer } from "../scope-overview/scope-timer";
import { PageHeader } from "../../../components";

export const AllScopes = () => {
  const { buildVersion = "", agentId = "" } = useParams<{ buildVersion: string; agentId?: string; }>();
  const { push } = useHistory();
  const { buildVersion: activeBuildVersion = "", buildStatus } = useActiveBuild(agentId) || {};
  const activeScope = useActiveScope();
  const scopes = useBuildVersion<ScopeSummary[]>("/build/scopes/finished") || [];
  const { byTestType = [] } = useBuildVersion<BuildCoverage>("/build/coverage") || {};
  scopes.sort(
    ({ started: firstStartedDate }, { started: secondStartedDate }) => secondStartedDate - firstStartedDate,
  );
  const scopesData = activeScope && activeScope.name ? [activeScope, ...scopes] : scopes;
  const isActiveBuildVersion = (activeBuildVersion === buildVersion && buildStatus === BUILD_STATUS.ONLINE);
  const { coverage: { byTestType: activeScopeTestsType = [] } = {} } = activeScope || {};

  const testsColumns = [
    ...byTestType,
    ...activeScopeTestsType,
    ...Array.from(new Set(scopes.map(({ coverage: { byTestType: finishedScopeTestsType = [] } = {} }) => finishedScopeTestsType))).flat(),
  ].reduce((acc: string[], item) => (acc.includes(item.type) ? acc : [...acc, item.type]), [])
    .map((type) => ({
      Header: `${capitalize(type)} tests`,
      accessor: `coverageByTestType.${type}`,
      testType: type,
      Cell: ({ row: { original = {} } = {} }: any) => {
        const coverageByTestTypes = transformObjectsArrayToObject(original?.coverage?.byTestType as TestTypeSummary[], "type");
        const testTypeSummary = coverageByTestTypes[type]?.summary;
        if (!testTypeSummary) return null;
        return (
          <div tw="font-bold text-12 leading-20 text-monochrome-black">
            <span>
              {`${percentFormatter(testTypeSummary?.coverage?.percentage || 0)}%`}
            </span>
            <div tw="font-regular text-right text-monochrome-default leading-16">
              {testTypeSummary?.testCount}
            </div>
          </div>
        );
      },
      width: "20%",
    }));

  const data = useMemo(() => scopesData.map((value) => {
    const res = { ...value };
    const scopeTestTypes = value?.coverage?.byTestType
      ?.reduce((acc, testData) => ({ [testData?.type]: testData?.summary?.coverage?.percentage }), {}) as any;
    res.coverageByTestType = testsColumns.reduce((acc, { testType }) => ({ ...acc, [testType]: scopeTestTypes[testType] || 0 }), {});
    return res;
  }), [scopesData]);

  return (
    <div>
      <PageHeader tw="gap-x-2 text-24 leading-32 text-monochrome-black">
        <span>All Scopes</span>
        <span tw="text-monochrome-default font-light">
          {data.length}
        </span>
      </PageHeader>
      <div tw="px-6 mt-9">
        {data.length > 0
          ? (
            <Table
              data={data}
              columnsDependency={[
                isActiveBuildVersion,
                activeScope?.coverage.percentage,
                activeScopeTestsType.length,
                byTestType.length, scopes.length,
              ]}
              defaultSortBy={[{
                id: "started",
                desc: false,
              }]}
              renderHeader={({ currentCount, totalCount }) => (
                <div tw="flex justify-between text-monochrome-default text-14 leading-24 mb-3">
                  <div tw="font-bold uppercase">Scopes List</div>
                  <div>{`Displaying ${currentCount} of ${totalCount} scopes`}</div>
                </div>
              )}
              stub={(
                <Stub
                  icon={<Icons.Scope height={104} width={107} />}
                  title="No results found"
                  message="Try adjusting your search or filter to find what you are looking for."
                />
              )}
              columns={[
                {
                  Header: "Name",
                  accessor: "name",
                  filterable: true,
                  isCustomCell: true,
                  Cell: ({
                    value = "", state, row: {
                      original: {
                        id = "", started = 0, active = false, enabled = false, finished = 0,
                      } = {},
                    },
                  }: any) => (
                    <Link
                      tw="font-bold text-14 leading-20 cursor-pointer"
                      to={getPagePath({ name: "scope", params: { scopeId: id, buildVersion }, queryParams: { activeTab: "methods" } })}
                      data-test="scopes-list:scope-name"
                    >
                      <div className="link text-ellipsis" title={value}>
                        <Cells.Highlight text={value} searchWords={state.filters.map((filter: {value: string}) => filter.value)} />
                      </div>
                      <div css={[
                        tw`flex gap-x-2 items-center w-full text-12`,
                        active && tw`text-green-default`,
                        !enabled && tw`text-monochrome-default`]}
                      >
                        <ScopeTimer started={started} finished={finished} active={active} size="small" />
                        {active && <Status>Active</Status>}
                        {!enabled && <Status>Ignored</Status>}
                      </div>
                    </Link>
                  ),
                  textAlign: "left",
                  width: "60%",
                },
                {
                  Header: "Started",
                  accessor: "started",
                  Cell: ({ value = 0 }: any) => (
                    <>
                      <div tw="font-bold text-12 leading-16 text-monochrome-black">
                        {dateFormatter(value)}
                      </div>
                      <div tw="text-12 leading-20 text-monochrome-default">
                        at {timeFormatter(value)}
                      </div>
                    </>
                  ),
                  textAlign: "left",
                  width: "20%",
                  sortType: "number",
                },
                {
                  Header: "Coverage, %",
                  accessor: "coverage.percentage",
                  Cell: ({ row: { original = {} } = {} }: any) => (
                    <div tw="text-20 leading-32 my-6 text-monochrome-black" data-test="scopes-list:coverage">
                      {percentFormatter(original?.coverage?.percentage)}
                    </div>
                  ),
                  width: "20%",
                  sortType: "number",
                },
                ...testsColumns,
                {
                  Header: () => null,
                  accessor: "actions",
                  Cell: isActiveBuildVersion ? ({ row: { original = {} } = {} }: any) => {
                    const { active, enabled, id } = original;
                    const menuActions = [
                      active && {
                        label: "Finish Scope",
                        icon: "Check",
                        onClick: () => push(getModalPath({ name: "finishScope", params: { scopeId: id } })),
                      },
                      active && {
                        label: "Sessions Management",
                        icon: "ManageSessions",
                        Content: ({ children }: { children: JSX.Element }) => (
                          <Link to={getModalPath({ name: "sessionManagement" })}>
                            {children}
                          </Link>
                        ),
                      },
                      !active && {
                        label: `${enabled ? "Ignore" : "Include"} in stats`,
                        icon: enabled ? "EyeCrossed" : "Eye",
                        onClick: () => toggleScope(agentId, {
                          onSuccess: () => {
                            sendAlertEvent({
                              type: "SUCCESS",
                              title: `Scope has been ${enabled ? "ignored" : "included"} in build stats.`,
                            });
                          },
                          onError: () => {
                            sendAlertEvent({
                              type: "ERROR",
                              title: "There is some issue with your action. Please try again later",
                            });
                          },
                        })(id),
                      },
                      {
                        label: "Rename",
                        icon: "Edit",
                        onClick: () => push(getModalPath({ name: "renameScope", params: { scopeId: id } })),
                      },
                      {
                        label: "Delete",
                        icon: "Delete",
                        onClick: () => push(getModalPath({ name: "deleteScope", params: { scopeId: id } })),
                      },
                    ].filter(Boolean);
                    return (
                      <div tw="flex justify-end">
                        <Menu items={menuActions} />
                      </div>
                    );
                  } : () => null,
                  width: "48px",
                  notSortable: true,
                  disableEllipsis: true,
                },
              ]}
            />
          ) : (
            <Stub
              icon={<Icons.Scope tw="text-monochrome-medium-tint" width={157} height={157} data-test="no-scope-stub:test-icon" />}
              title={<span tw="text-24">No scopes found</span>}
              message="There are no scopes with finished test sessions in this build."
            />
          )}

      </div>
    </div>
  );
};
