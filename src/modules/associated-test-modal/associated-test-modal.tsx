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
import { Link, useHistory } from "react-router-dom";

import tw, { styled } from "twin.macro";

import {
  useQueryParams, useCloseModal, Modal, Cells, Skeleton, Icons, VirtualizedTable, Stub, CopyButton, Tooltip, removeQueryParamsFromPath,
} from "@drill4j/ui-kit";

import { AssociatedTests } from "types/associated-tests";

import { useFilteredData, useNavigation, useTestToCodeRouteParams } from "hooks";
import { concatTestPath, concatTestName } from "utils/transform-tests";

export const AssociatedTestModal = () => {
  const { push } = useHistory();
  const { scopeId, buildVersion } = useTestToCodeRouteParams();
  const params = useQueryParams<{testId?: string; treeLevel?: number; testsCount?: string }>();
  const associatedTests = useFilteredData<AssociatedTests>(`${scopeId ? `/build/scopes/${scopeId}` : "/build"}/tests/associatedWith/${
    params?.testId}`) || {};
  const { getPagePath } = useNavigation();
  const isSkeleton = Object.keys(associatedTests).length === 0;

  const {
    tests = [], packageName = "", className: testClassName = "", methodName = "",
  } = associatedTests;

  const closeModal = useCloseModal(["testId", "treeLevel"]);

  const clearVirtualTableState = () => {
    push(removeQueryParamsFromPath(["virtualTableState"]));
  };

  return (
    <Modal onClose={() => { clearVirtualTableState(); closeModal(); }}>
      <Modal.Content tw="max-w-[1024px] w-[80%] max-h-[850px] h-[80%] flex flex-col" type="info">
        <Modal.Header tw="text-20">
          <div tw="space-x-2"><span>Associated Tests</span>
            <span tw="text-monochrome-default">
              {Number(params.testsCount)}
            </span>
          </div>
        </Modal.Header>
        <div tw="grid grid-cols-3 gap-x-4 px-6 py-3 bg-monochrome-light-tint border-b border-monochrome-medium-tint">
          <MethodInfoLabel>Package</MethodInfoLabel>
          <MethodInfoLabel>Class</MethodInfoLabel>
          <MethodInfoLabel>Method</MethodInfoLabel>
          <MethodInfoValue
            skeleton={isSkeleton}
            title={packageName}
            data-test="associated-tests:package-name"
            tw="first-letter:lowercase"
          >
            {isSkeleton ? "" : packageName || "-"}
          </MethodInfoValue>
          <MethodInfoValue
            skeleton={isSkeleton}
            title={testClassName}
            data-test="associated-tests-modal:test-class-name"
          >
            {isSkeleton ? "" : testClassName || "-"}
          </MethodInfoValue>
          <MethodInfoValue
            skeleton={isSkeleton}
            title={methodName}
            data-test="associated-tests-modal:method-name"
          >
            {isSkeleton ? "" : methodName || "-"}
          </MethodInfoValue>
        </div>
        <div tw="px-6 pb-4 flex flex-col flex-grow min-h-[1px]" data-test="associated-tests-table">
          <VirtualizedTable
            renderHeader={({ currentCount }: { currentCount: number }) => (
              <div tw="flex justify-between text-monochrome-default text-14 leading-24 pt-5 pb-3">
                <div tw="font-bold uppercase">tests</div>
                <div>{`Displaying ${currentCount} of ${Number(params.testsCount)} rows`}</div>
              </div>
            )}
            gridTemplateColumns="1fr 1fr 120px"
            data={tests.map((test) => ({
              ...test,
              details: {
                ...test.details,
                testName: concatTestName(test?.details?.testName, test?.details?.params?.methodParams),
                path: concatTestPath(test?.details?.path, test?.details?.params?.classParams),
              },
            }))}
            listItemSize={40}
            initialRowsCount={Number(params.testsCount)}
            stub={(
              <Stub
                icon={<Icons.Test height={104} width={107} />}
                title="No results found"
                message="Try adjusting your search or filter to find what you are looking for."
              />
            )}
            columns={
              [
                {
                  Header: "Name",
                  accessor: "details.testName",
                  textAlign: "left",
                  filterable: true,
                  isCustomCell: true,
                  width: "100%",
                  Cell: ({ value = "", state, row }: any) => (value
                    ? (
                      <Cells.Compound
                        cellName={value}
                        icon={<Icons.Test />}
                        link={(
                          <Link
                            to={() => {
                              const queryParams = {
                                activeTab: "tests",
                                tableState: JSON.stringify({
                                  filters: [
                                    {
                                      id: "overview.details.name",
                                      value: row.original.details.testName,
                                    },
                                    {
                                      id: "overview.details.path",
                                      value: row.original.details.path,
                                    }],
                                }),
                              };
                              return scopeId
                                ? getPagePath({ name: "scope", params: { scopeId, buildVersion }, queryParams })
                                : getPagePath({ name: "overview", params: { buildVersion }, queryParams });
                            }}
                            tw="max-w-280px text-monochrome-black text-14 text-ellipsis link"
                            title={value}
                            target="_blank"
                          >
                            <Tooltip
                              position="top-center"
                              message={(
                                <div tw="flex gap-x-2">
                                  <span>Navigate to Application tests</span>
                                  <Icons.NewWindow />
                                </div>
                              )}
                            >
                              <Icons.NewWindow />
                            </Tooltip>
                          </Link>
                        )}
                      >
                        <div tw="flex items-center gap-x-2">
                          <Cells.Highlight
                            tw="truncate"
                            text={value}
                            searchWords={state.filters.map((filter: {value: string}) => filter.value)}
                            data-test="associated-tests:test:name"
                          />
                          <CopyButton text={value} />
                        </div>
                      </Cells.Compound>
                    )
                    : <Skeleton withIcon />),
                },
                {
                  Header: "Path",
                  accessor: "details.path",
                  textAlign: "left",
                  filterable: true,
                  isCustomCell: true,
                  width: "100%",
                  Cell: ({ value = "-", state }: any) => (value
                    ? (
                      <Cells.Highlight
                        tw="truncate"
                        text={value}
                        searchWords={state.filters.map((filter: {value: string}) => filter.value)}
                        data-test="associated-tests:test:path"
                      />
                    )
                    : <Skeleton />),
                },
                {
                  Header: "Type",
                  Cell: ({ value = "" }) => (value ? <span tw="lowercase first-letter:uppercase">{value}</span> : <Skeleton />),
                  accessor: "type",
                  textAlign: "left",
                  width: "100%",
                },
              ]
            }
          />
        </div>
      </Modal.Content>
    </Modal>
  );
};

const MethodInfoLabel = styled.div(tw`min-w-32px text-left text-14 leading-32 font-bold text-monochrome-black`);

const MethodInfoValue = styled.div(({ skeleton }: { skeleton?: boolean }) =>
  [
    tw`text-monochrome-default text-14 leading-20 break-all text-ellipsis`,
    skeleton && tw`h-4 animate-pulse w-full bg-monochrome-medium-tint rounded`,
  ]);
