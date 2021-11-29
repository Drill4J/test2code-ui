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
import {
  Popup, useCloseModal, useQueryParams, VirtualizedTable, Cells, Icons, Skeleton, Stub, Tooltip,
} from "@drill4j/ui-kit";
import { matchPath, useLocation, Link } from "react-router-dom";
import tw, { styled } from "twin.macro";

import { MethodsCoveredByTestSummary } from "types/methods-covered-by-test-summary";
import { useBuildVersion } from "hooks";
import { getPagePath, routes } from "common";
import { agentPluginPath } from "router";
import { MethodsDetails } from "types";

export const CoveredMethodsModal = () => {
  const { pathname } = useLocation();
  const { params: { scopeId = "" } = {} } = matchPath<{ scopeId?: string; }>(pathname, {
    path: `${agentPluginPath}${routes.scopeTests}`,
  }) || {};

  const params = useQueryParams<{testId?: string; coveredMethods?: number}>();
  const topicCoveredMethodsByTest = scopeId ? `/build/scopes/${scopeId}/tests` : "/build/tests";
  const summary = useBuildVersion<MethodsCoveredByTestSummary>(
    `${topicCoveredMethodsByTest}/${params?.testId}/methods/summary`,
  ) || {};
  const showSceleton = !Object.keys(summary).length;
  const closeModal = useCloseModal("/covered-methods-modal", ["testId", "coveredMethods"]);

  const methods = useBuildVersion<MethodsDetails[]>(
    `${topicCoveredMethodsByTest}/${summary.id}/methods/all`,
  ) || [];

  return (
    <Popup
      isOpen
      onToggle={closeModal}
      header={
        <div tw="text-20 w-[960px]">Covered Methods <span tw="text-monochrome-default">{params.coveredMethods}</span></div>
      }
      type="info"
      closeOnFadeClick
    >
      <div tw="w-[1024px]">
        <div tw="grid grid-cols-2 gap-x-4 px-6 py-3 bg-monochrome-light-tint border-b border-monochrome-medium-tint">
          <MethodInfoLabel>Test Name</MethodInfoLabel>
          <MethodInfoLabel>Test Type</MethodInfoLabel>
          <MethodInfoValue
            sceleton={showSceleton}
            title={summary?.testName}
            data-test="covered-methods-by-test-sidebar:test-name"
          >
            {summary?.testName}
          </MethodInfoValue>
          <MethodInfoValue
            sceleton={showSceleton}
            data-test="covered-methods-by-test-sidebar:test-type"
          >
            {summary?.testType}
          </MethodInfoValue>
        </div>
        <div tw="px-6 pb-4">
          <VirtualizedTable
            renderHeader={({ currentCount }: { currentCount: number }) => (
              <div tw="flex justify-between text-monochrome-default text-14 leading-24 pt-5 pb-3">
                <div tw="font-bold uppercase">methods</div>
                <div>{`Displaying ${currentCount} of ${Number(params.coveredMethods)} rows`}</div>
              </div>
            )}
            gridTemplateColumns="677px 115px auto"
            data={methods}
            listHeight={630}
            initialRowsCount={Number(params.coveredMethods)}
            stub={(
              <Stub
                tw="h-[630px]"
                icon={<Icons.Function height={104} width={107} />}
                title="No results found"
                message="Try adjusting your search or filter to find what you are looking for."
              />
            )}
            columns={
              [
                {
                  Header: "Name",
                  accessor: "name",
                  textAlign: "left",
                  filterable: true,
                  isCustomCell: true,
                  width: "100%",
                  Cell: ({ value = "", row: { original: { ownerClass = "", desc = "" } = {} } = {}, state }: any) => (value
                    ? (
                      <Cells.Compound
                        cellName={value}
                        cellAdditionalInfo={ownerClass}
                        icon={<Icons.Function />}
                        link={(
                          <Link
                            to={() => {
                              const queryParams = {
                                methodName: value,
                                methodOwnerClass: ownerClass,
                                methodDesc: desc,
                                activeTab: "methods",
                                tableState: JSON.stringify({
                                  filters: [{
                                    id: "name",
                                    value: ownerClass.slice(0, ownerClass.lastIndexOf("/")),
                                  }],
                                }),
                              };
                              return scopeId
                                ? getPagePath({ name: "scopeMethods", params: { scopeId }, queryParams })
                                : getPagePath({ name: "test2code", queryParams });
                            }}
                            tw="max-w-280px text-monochrome-black text-14 text-ellipsis link"
                            title={value}
                            target="_blank"
                          >
                            <Tooltip
                              position="top-center"
                              message={(
                                <div tw="flex gap-x-2">
                                  <span>Navigate to method in Application package</span>
                                  <Icons.NewWindow />
                                </div>
                              )}
                            >
                              <Icons.NewWindow />
                            </Tooltip>
                          </Link>
                        )}
                      >
                        <Cells.Highlight text={value} searchWords={state.filters.map((filter: {value: string}) => filter.value)} />
                      </Cells.Compound>
                    )
                    : <Skeleton withIcon withSubLine />),
                },
                {
                  Header: "Type",
                  Cell: ({ value = "" }) => (value ? <span tw="lowercase first-letter:uppercase">{value}</span> : <Skeleton />),
                  accessor: "type",
                  textAlign: "left",
                  width: "100%",
                },
                {
                  Header: "Coverage, %",
                  Cell: ({ value = "" }) => (value ? <Cells.CoverageProgress value={value} /> : <Skeleton />),
                  accessor: "coverage",
                  textAlign: "right",
                  width: "100%",
                },
              ]
            }
          />
        </div>
      </div>
    </Popup>
  );
};

const MethodInfoLabel = styled.div(tw`min-w-32px text-left text-14 leading-32 font-bold text-monochrome-black`);

const MethodInfoValue = styled.div(({ sceleton }: { sceleton?: boolean }) =>
  [
    tw`text-monochrome-default text-14 leading-20 break-all text-ellipsis lowercase first-letter:uppercase`,
    sceleton && tw`h-4 animate-pulse w-full bg-monochrome-medium-tint rounded`,
  ]);
