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
  Icons, Modal, Dropdown,
} from "@drill4j/ui-kit";
import tw, { styled } from "twin.macro";
import { useQueryParams, useCloseModal, useElementSize } from "@drill4j/common-hooks";
import { useBuildVersion } from "hooks";
import { Risks } from "types/risks";

const Header = styled.div`
  ${tw`flex items-center h-16 pl-6`}
  ${tw`border-b border-monochrome-medium-tint text-18 leading-24 text-monochrome-black`}
  & > * {
    ${tw`mr-2`}
  }
`;

export const RisksModal = () => {
  const risks = useBuildVersion<Risks[]>("/build/risks") || [];
  const filter = useQueryParams<{filter?: string}>()?.filter || "all";
  const [selectedSection, setSelectedSection] = useState<string>(filter);
  const node = useRef<HTMLDivElement>(null);
  const { height: methodsListHeight } = useElementSize(node);
  const newRisks = risks.filter(({ type }) => type === "NEW");
  const modifiedRisks = risks.filter(({ type }) => type === "MODIFIED");
  const getRisks = () => {
    switch (selectedSection) {
      case "new":
        return newRisks;
      case "modified":
        return modifiedRisks;
      default:
        return risks;
    }
  };

  return (
    <Modal isOpen onToggle={useCloseModal("/risks-modal")}>
      <div className="flex flex-col h-full">
        <Header>
          <Icons.Test height={20} width={18} viewBox="0 0 18 20" />
          <span>Risks</span>
          <h2>{risks.length}</h2>
        </Header>
        <div tw="flex items-center h-10 px-6 text-14 leading-20 bg-monochrome-medium-tint opacity-50">
          Risks are not covered
          <span tw="mx-1 font-bold leading-20">New</span>
          and
          <span tw="mx-1 font-bold leading-20">Modified</span>
          methods.
        </div>
        <div tw="flex flex-col flex-grow overflow-y-hidden">
          <div tw="mt-4 ml-6 text-14 text-blue-default font-bold">
            <Dropdown
              items={[
                { value: "all", label: "All risks" },
                { value: "new", label: `Not covered new methods (${newRisks.length})` },
                {
                  value: "modified",
                  label: `Not covered modified methods (${modifiedRisks.length})`,
                },
              ]}
              onChange={(value : any) => setSelectedSection(String(value))}
              value={selectedSection}
            />
          </div>
          <div tw="flex flex-col h-full mt-4 text-14">
            <div ref={node} style={{ height: "100%" }}>
              <VirtualList
                itemSize={60}
                height={methodsListHeight}
                itemCount={getRisks().length}
                renderItem={({ index, style }) => (
                  <div
                    tw="flex flex-row items-center w-97 min-h-40px mb-4 pl-6 text-12"
                    key={index}
                    style={style as Record<symbol, string>}
                  >
                    <div tw="flex items-center mr-4">
                      <Icons.Function />
                    </div>
                    <div tw="flex flex-col w-70">
                      <div
                        tw="text-ellipsis"
                        title={getRisks()[index]?.name}
                        data-test="risks-pane:risk-name"
                      >
                        {getRisks()[index]?.name}
                      </div>
                      <div
                        tw="w-80 text-monochrome-default text-ellipsis"
                        title={getRisks()[index]?.ownerClass}
                        data-test="risks-pane:risk-path"
                      >
                        {getRisks()[index]?.ownerClass}
                      </div>
                    </div>
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
