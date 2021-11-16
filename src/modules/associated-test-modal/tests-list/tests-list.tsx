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
import React, { useMemo, useRef, useState } from "react";
import VirtualList from "react-tiny-virtual-list";
import {
  Icons, Dropdown, convertToSingleSpaces, Inputs, capitalize, Cells,
} from "@drill4j/ui-kit";
import { useElementSize } from "@drill4j/common-hooks";
import tw, { styled } from "twin.macro";
import { useFilter } from "hooks";

interface Props {
  associatedTests: Record<string, string[]>;
  testsCount: number;
}

export const TestsList = ({ associatedTests, testsCount }: Props) => {
  const node = useRef<HTMLDivElement>(null);
  const [selectedSection, setSelectedSection] = useState("all");
  const { height: testsListHeight } = useElementSize(node);
  const allTests = useMemo(() => Object.values(associatedTests).reduce((acc, value) => [...acc, ...value], []), [associatedTests]);
  const getTests = (): string[] => {
    if (selectedSection === "all") {
      return allTests;
    }
    return associatedTests[selectedSection];
  };
  const tests = getTests();
  const {
    filter: query, filteredData, setFilter, isProcessing,
  } = useFilter(
    tests, (filter) => (value) => value.toLowerCase().includes(filter.toLowerCase()),
  );
  const dropdownItems = Object.entries(associatedTests).map(([key, value]) => ({
    value: key, label: `${capitalize(key)} (${value.length})`,
  }));

  return (
    <div tw="flex flex-col h-full overflow-y-auto">
      <div tw="space-y-3 px-6 pt-3 pb-2 text-14 text-blue-default font-bold border-b border-monochrome-medium-tint">
        <div tw="flex items-center h-8">
          <Dropdown
            items={[
              { value: "all", label: "All tests" },
              ...dropdownItems,
            ]}
            onChange={(value : any) => { setFilter(""); setSelectedSection(String(value)); }}
            value={selectedSection}
          />
        </div>
        <Inputs.Search
          value={query}
          onChange={({ target: { value = "" } }: any) => setFilter(convertToSingleSpaces(value))}
          reset={() => setFilter("")}
          placeholder="Search tests by name"
        />
      </div>
      <div tw="flex flex-col flex-grow overflow-y-auto">
        <div ref={node} style={{ height: "100%" }}>
          {filteredData.length === 0 && !isProcessing
            ? (
              <div tw="grid place-items-center py-22 text-monochrome-default">
                <Icons.Test width={80} height={80} tw="text-monochrome-medium-tint" />
                <div tw="text-24 leading-32 mt-8 mb-2">No tests found</div>
                <div tw="text-14 leading-20">Please try searching with another query</div>
              </div>
            )
            : (
              <VirtualList
                style={{ height: "100%", padding: "8px 0" }}
                itemSize={56}
                height={Math.floor(testsListHeight)}
                itemCount={filteredData.length || testsCount}
                renderItem={({ index, style }) => (
                  <TestItem key={filteredData[index]} style={style as any} data-test="associated-tests-list:item">
                    {(filteredData.length > 0 && !isProcessing) || testsCount === 0
                      ? (
                        <>
                          <div tw="flex flex-row items-center h-5">
                            <Icons.Test tw="flex self-center min-w-12px min-h-16px" />
                            <div
                              tw="text-ellipsis ml-4 text-14 leading-20 text-monochrome-black"
                              title={filteredData[index]}
                            >
                              <Cells.Highlight text={filteredData[index]} searchWords={[query]} />
                            </div>
                          </div>
                          <div tw="text-ellipsis pl-7 text-12 text-monochrome-default" title="&ndash;">&ndash;</div>
                        </>
                      )
                      : (
                        <div tw="flex space-x-2 animate-pulse">
                          <div tw="rounded-full bg-monochrome-medium-tint h-6 w-6" />
                          <div tw="flex-1 space-y-4 py-1">
                            <div tw="space-y-2">
                              <div tw="h-4 bg-monochrome-medium-tint rounded" />
                              <div tw="h-3 bg-monochrome-medium-tint rounded" />
                            </div>
                          </div>
                        </div>
                      )}
                  </TestItem>
                )}
              />
            )}
        </div>
      </div>
    </div>
  );
};

const TestItem = styled.div`
  ${tw`flex flex-col justify-center min-h-40px px-6`}
  ${tw`text-14 break-normal`}
`;
