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
  Modal, useCloseModal, useQueryParams, VirtualizedTable, Cells, Icons, Skeleton, Stub, Tooltip, useElementSize, CopyButton,
} from "@drill4j/ui-kit";
import { Link } from "react-router-dom";
import tw, { styled } from "twin.macro";

import { MethodsCoveredByTestSummary } from "types/methods-covered-by-test-summary";
import { useBuildVersion, useTestToCodeParams } from "hooks";
import { getPagePath } from "common";
import { MethodsDetails } from "types";
import { concatTestName } from "utils/transform-tests";

export const CoveredMethodsModal = () => {
  const { scopeId } = useTestToCodeParams();

  const params = useQueryParams<{testId?: string; coveredMethods?: number}>();
  const topicCoveredMethodsByTest = scopeId ? `/build/scopes/${scopeId}/tests` : "/build/tests";
  const testSummary = useBuildVersion<MethodsCoveredByTestSummary>(
    `${topicCoveredMethodsByTest}/${params?.testId}/methods/summary`,
  ) || {};
  const showSkeleton = !Object.keys(testSummary).length;
  const closeModal = useCloseModal("/covered-methods-modal", ["testId", "coveredMethods"]);

  const coveredMethods = useBuildVersion<MethodsDetails[]>(
    `${topicCoveredMethodsByTest}/${testSummary.id}/methods/all`,
  ) || [];

  const { height: documentHeight } = useElementSize(useRef(document.documentElement));
  const headerHeight = 64;
  const methodInfoHeight = 78;
  const testName = concatTestName(testSummary?.testName?.testName, testSummary?.testName?.params?.methodParams);
  const testPath = concatTestName(testSummary?.testName?.path, testSummary?.testName?.params?.classParams);

  return (
    <Modal onClose={closeModal}>
      <Modal.Content tw="w-[1024px]" type="info">
        <Modal.Header tw="text-20">
          <div tw="space-x-2">
            <span>Covered Methods</span>
            <span
              tw="text-monochrome-default"
              data-test="covered-methods-modal:methods-count"
            >
              {params.coveredMethods}
            </span>
          </div>
        </Modal.Header>
        <div tw="grid grid-cols-3 gap-x-4 px-6 py-3 bg-monochrome-light-tint border-b border-monochrome-medium-tint">
          <MethodInfoLabel>Test Name</MethodInfoLabel>
          <MethodInfoLabel>Path</MethodInfoLabel>
          <MethodInfoLabel>Test Type</MethodInfoLabel>
          <MethodInfoValue
            skeleton={showSkeleton}
            title={testName}
            data-test="covered-methods-modal:test-name"
          >
            {testName}
          </MethodInfoValue>
          <MethodInfoValue
            skeleton={showSkeleton}
            title={testPath}
            data-test="covered-methods-modal:test-path"
          >
            {testPath}
          </MethodInfoValue>
          <MethodInfoValue
            tw="lowercase first-letter:uppercase"
            skeleton={showSkeleton}
            data-test="covered-methods-modal:test-type"
          >
            {testSummary?.testType}
          </MethodInfoValue>
        </div>
        <Modal.Body data-test="covered-methods-table">
          <VirtualizedTable
            renderHeader={({ currentCount }: { currentCount: number }) => (
              <div tw="flex justify-between text-monochrome-default text-14 leading-24 pt-5 pb-3">
                <div tw="font-bold uppercase">methods</div>
                <div>{`Displaying ${currentCount} of ${Number(params.coveredMethods)} rows`}</div>
              </div>
            )}
            gridTemplateColumns="677px 115px auto"
            data={coveredMethods}
            listHeight={(documentHeight * 0.75) - headerHeight - methodInfoHeight}
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
                        <div tw="flex items-center gap-x-2">
                          <Cells.Highlight
                            text={value}
                            data-test="covered-methods-modal:list:method:name"
                            searchWords={state.filters.map((filter: {value: string}) => filter.value)}
                          />
                          <CopyButton text={value} />
                        </div>
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
                  Cell: ({ value = 0 }) => (value ? <Cells.CoverageProgress value={value} /> : <Skeleton />),
                  accessor: "coverage",
                  textAlign: "right",
                  width: "100%",
                },
              ]
            }
          />
        </Modal.Body>
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
