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
import React, { useRef, useState } from "react";
import VirtualList from "react-tiny-virtual-list";
import {
  Cells, convertToSingleSpaces, Dropdown, Icons, Inputs, useElementSize,
} from "@drill4j/ui-kit";
import { Link } from "react-router-dom";
import "twin.macro";

import { MethodsDetails } from "types/methods-details";
import { MethodCounts, MethodsCoveredByTestSummary } from "types/methods-covered-by-test-summary";
import { useBuildVersion, useFilter, useTestToCodeParams } from "hooks";
import { getPagePath } from "common";
import { CoverageRateIcon } from "../coverage-rate-icon";

interface Props {
  summary: MethodsCoveredByTestSummary;
  topicCoveredMethodsByTest: string;
}

export const MethodsList = ({ topicCoveredMethodsByTest, summary }: Props) => {
  const { scopeId } = useTestToCodeParams();
  const [selectedSection, setSelectedSection] = useState<keyof MethodCounts>("all");
  const data = useBuildVersion<MethodsDetails[]>(
    `${topicCoveredMethodsByTest}/${selectedSection}`,
  ) || [];
  const {
    filter: query, filteredData, setFilter, isProcessing,
  } = useFilter(
    data, (filter) => (value) => Boolean(value.name?.toLowerCase().includes(filter.toLowerCase())),
  );

  const node = useRef<HTMLDivElement>(null);
  const { height: methodsListHeight } = useElementSize(node);
  const selectedMethodsCount = getMethodsCount(summary?.methodCounts, selectedSection) || 0;
  const methodsCount = filteredData.length || selectedMethodsCount;

  return (
    <div tw="flex-col h-full overflow-hidden">
      <div tw="space-y-3 px-6 pt-3 pb-2 text-14 text-blue-default font-bold border-b border-monochrome-medium-tint">
        <div tw="flex items-center h-8">
          <Dropdown
            items={[
              { value: "all", label: "All methods" },
              { value: "new", label: `New methods (${summary?.methodCounts?.new})` },
              {
                value: "modified",
                label: `Modified methods (${summary?.methodCounts?.modified})`,
              },
              {
                value: "unaffected",
                label: `Unaffected methods (${summary?.methodCounts?.unaffected})`,
              },
            ]}
            onChange={(value: any) => { setFilter(""); setSelectedSection(value as keyof MethodCounts); }}
            value={selectedSection}
          />
        </div>
        <Inputs.Search
          value={query}
          onChange={({ target: { value = "" } }: any) => setFilter(convertToSingleSpaces(value))}
          reset={() => setFilter("")}
          placeholder="Search methods by name"
        />
      </div>
      <div tw="h-full w-full mb-4 overflow-y-hidden">
        <div tw="flex flex-col h-full text-14">
          <div
            ref={node}
            style={{ height: "calc(100% - 90px)" }}
          >
            {filteredData.length === 0 && !isProcessing
              ? (
                <div tw="grid place-items-center py-22 text-monochrome-default">
                  <Icons.Function width={80} height={80} tw="text-monochrome-medium-tint" />
                  <div tw="text-24 leading-32 mt-8 mb-2">No methods found</div>
                  <div tw="text-14 leading-20">Please try searching with another query</div>
                </div>
              )
              : (
                <VirtualList
                  style={{ padding: "8px 0" }}
                  itemSize={56}
                  height={Math.ceil(methodsListHeight)}
                  itemCount={methodsCount}
                  renderItem={({ index, style }) => (
                    (filteredData.length > 0 && !isProcessing) || selectedMethodsCount === 0
                      ? (
                        <div
                          tw="flex flex-col justify-center pl-6 pr-6 text-12"
                          key={`${filteredData[index]?.name}${index}`}
                          style={style as any}
                          data-test="covered-methods-list:item"
                        >
                          <div className="flex items-center w-full h-20px">
                            <div className="flex items-center w-full gap-4">
                              <Icons.Function tw="h-4" />
                              <Link
                                to={() => {
                                  const { ownerClass = "", name = "", desc = "" } = filteredData[index];
                                  const queryParams = {
                                    methodName: name,
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
                                title={filteredData[index]?.name as string}
                                target="_blank"
                              >
                                <Cells.Highlight text={filteredData[index]?.name} searchWords={[query]} />
                              </Link>
                            </div>
                            <CoverageRateIcon tw="h-4" coverageRate={filteredData[index]?.coverageRate} />
                          </div>
                          <div
                            tw="max-w-280px ml-8 text-monochrome-default text-12 text-ellipsis"
                            title={filteredData[index]?.ownerClass}
                          >
                            {filteredData[index]?.ownerClass}
                          </div>
                        </div>
                      )
                      : (
                        <div
                          tw="flex flex-col justify-center pl-6 pr-6 text-12"
                          key={index}
                          style={style as any}
                        >
                          <div tw="flex space-x-2 animate-pulse">
                            <div tw="rounded-full bg-monochrome-medium-tint h-6 w-6" />
                            <div tw="flex-1 space-y-4 py-1">
                              <div tw="space-y-2">
                                <div tw="h-4 bg-monochrome-medium-tint rounded" />
                                <div tw="h-3 bg-monochrome-medium-tint rounded" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                  )}
                />
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export function getMethodsCount(methodsCount: MethodCounts = {}, key: keyof MethodCounts) {
  return methodsCount[key];
}
