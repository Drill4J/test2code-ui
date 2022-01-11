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
import React, { useRef } from "react";
import {
  useQueryParams, useCloseModal, Popup, Cells, Skeleton, Icons, VirtualizedTable, Stub, useElementSize, CopyButton, Tooltip,
} from "@drill4j/ui-kit";
import tw, { styled } from "twin.macro";

import { AssociatedTests } from "types/associated-tests";
import { useBuildVersion, useTestToCodeParams } from "hooks";
import { concatTestPath, concatTestName } from "utils/transform-tests";
import { Link } from "react-router-dom";
import { getPagePath } from "../../common";

export const AssociatedTestModal = () => {
  const { scopeId } = useTestToCodeParams();
  const params = useQueryParams<{testId?: string; treeLevel?: number; testsCount?: string }>();
  const associatedTests = useBuildVersion<AssociatedTests>(`${scopeId ? `/build/scopes/${scopeId}` : "/build"}/tests/associatedWith/${
    params?.testId}`) || {};

  const isSkeleton = Object.keys(associatedTests).length === 0;

  const {
    tests = [], packageName = "", className: testClassName = "", methodName = "",
  } = associatedTests;

  const closeModal = useCloseModal("/associated-tests-modal", ["testId", "treeLevel"]);

  const { height: documentHeight } = useElementSize(useRef(document.documentElement));
  const headerHeight = 64;
  const packageInfoHeight = 78;

  return (
    <Popup
      isOpen
      onToggle={closeModal}
      header={(
        <div tw="text-20 w-[960px] space-x-2"><span>Associated Tests</span>
          <span tw="text-monochrome-default">
            {Number(params.testsCount)}
          </span>
        </div>
      )}
      type="info"
      closeOnFadeClick
    >
      <div tw="w-[1024px]">
        <div tw="grid grid-cols-3 gap-x-4 px-6 py-3 bg-monochrome-light-tint border-b border-monochrome-medium-tint">
          <MethodInfoLabel>Package</MethodInfoLabel>
          <MethodInfoLabel>Class</MethodInfoLabel>
          <MethodInfoLabel>Method</MethodInfoLabel>
          <MethodInfoValue
            skeleton={isSkeleton}
            title={packageName}
            data-test="associated-tests:package-name"
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
        <div tw="px-6 pb-4" data-test="associated-tests-table">
          <VirtualizedTable
            renderHeader={({ currentCount }: { currentCount: number }) => (
              <div tw="flex justify-between text-monochrome-default text-14 leading-24 pt-5 pb-3">
                <div tw="font-bold uppercase">tests</div>
                <div>{`Displaying ${currentCount} of ${Number(params.testsCount)} rows`}</div>
              </div>
            )}
            gridTemplateColumns="400px 456px auto"
            data={tests.map((test) => ({
              ...test,
              details: {
                ...test.details,
                testName: concatTestName(test?.details?.testName, test?.details?.params?.methodParams),
                path: concatTestPath(test?.details?.path, test?.details?.params?.classParams),
              },
            }))}
            listHeight={(documentHeight * 0.75) - headerHeight - packageInfoHeight}
            listItemSize={40}
            initialRowsCount={Number(params.testsCount)}
            stub={(
              <Stub
                tw="h-[630px]"
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
                                ? getPagePath({ name: "scopeTests", params: { scopeId }, queryParams })
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
      </div>
    </Popup>
  );
};

const MethodInfoLabel = styled.div(tw`min-w-32px text-left text-14 leading-32 font-bold text-monochrome-black`);

const MethodInfoValue = styled.div(({ skeleton }: { skeleton?: boolean }) =>
  [
    tw`text-monochrome-default text-14 leading-20 break-all text-ellipsis lowercase first-letter:uppercase`,
    skeleton && tw`h-4 animate-pulse w-full bg-monochrome-medium-tint rounded`,
  ]);
