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
import React, { useState, useEffect, useMemo } from "react";
import {
  Icons, Dropdown, Modal,
  useCloseModal, capitalize,
} from "@drill4j/ui-kit";
import { copyToClipboard } from "@drill4j/common-utils";

import tw from "twin.macro";

import { useGroupData, useGroupRouteParams } from "hooks";
import { PLUGIN_ID } from "common";
import { TestDetails } from "types";
import { getTestsToRunURL, TestsToRunUrl } from "../tests-to-run-url";
import { concatName } from "../../utils/transform-tests";

interface TestToRun {
  id?: string;
  details?: TestDetails;
}

interface GroupedTestToRun {
  byType?: Record<string, TestToRun[]>;
  totalCount?: number;
}

export const TestsToRunModal = () => {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setCopied(false), 5000);
    copied && timeout;
    return () => clearTimeout(timeout);
  }, [copied]);

  const { groupId = "" } = useGroupRouteParams();
  const { byType: testsToRun = {} } = useGroupData<GroupedTestToRun>("/group/data/tests-to-run", groupId) || {};
  const allTests = useMemo(() => Object.values(testsToRun).reduce((acc, value) => [...acc, ...value], []), [testsToRun]);
  const [selectedTestsType, setSelectedTestsType] = useState("all");
  const getSelectedTests = () => {
    switch (selectedTestsType) {
      case "all":
        return allTests;
      default:
        return testsToRun[selectedTestsType];
    }
  };
  const closeModal = useCloseModal("/tests-to-run-modal");

  const dropdownItems = Object.entries(testsToRun).map(([key, value]) => ({
    value: key, label: `${capitalize(key)} (${value.length})`,
  }));

  return (
    <Modal isOpen onToggle={closeModal}>
      <div tw="flex flex-col h-full">
        <div tw="flex items-center gap-x-2 h-16 border-b border-monochrome-medium-tint pl-6 text-18 leading-24 text-monochrome-black">
          <Icons.Test height={20} width={18} viewBox="0 0 18 20" />
          <span>Tests to run</span>
          <h2>{allTests.length}</h2>
        </div>
        <div
          css={[
            tw`relative flex flex-col gap-y-4 gap-x-2 pt-2 pb-2 pr-6 pl-6`,
            tw`text-14 leading-20 bg-monochrome-light-tint break-words text-monochrome-default`,
          ]}
        >
          <span>
            These are recommendations for this build updates only.
            Use this Curl in your command line to get JSON:
          </span>
          <TestsToRunUrl agentId={groupId} pluginId={PLUGIN_ID} agentType="ServiceGroup" />
          <div tw="absolute top-16 right-6 text-blue-default cursor-pointer active:text-blue-shade">
            {copied
              ? (
                <div className="flex items-center gap-x-1 text-10 leading-16 primary-blue-default">
                  <span tw="text-monochrome-black">Copied to clipboard.</span>
                  <Icons.Check height={10} width={14} viewBox="0 0 14 10" />
                </div>
              )
              : (
                <Icons.Copy
                  data-test="quality-gate-status:copy-icon"
                  onClick={() => { copyToClipboard(getTestsToRunURL(groupId, PLUGIN_ID, "ServiceGroup")); setCopied(true); }}
                />
              )}
          </div>
        </div>
        <div tw="h-full w-full overflow-y-auto overflow-x-hidden">
          <div tw="mx-6 my-4 text-14 text-blue-default font-bold">
            <Dropdown
              tw="mt-3 ml-6 text-blue-default"
              items={[
                { value: "all", label: "All test types" },
                ...dropdownItems,
              ]}
              onChange={(value) => setSelectedTestsType(String(value))}
              value={selectedTestsType}
            />
          </div>
          <div tw="text-14 mt-4 px-6 space-y-4">
            {(getSelectedTests() || []).map(({ id = "", details }) => (
              <div tw="flex items-center gap-x-4" key={id} data-test="tests-to-run-modal:tests-list:test">
                <Icons.Test tw="flex items-center min-w-16px" />
                <div tw="break-all">{concatName(details?.testName, details?.params?.methodParams)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
