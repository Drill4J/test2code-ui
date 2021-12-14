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
import { Modal, useCloseModal, useQueryParams } from "@drill4j/ui-kit";
import { matchPath, useLocation } from "react-router-dom";
import { capitalize } from "@drill4j/common-utils";

import tw, { styled } from "twin.macro";

import { MethodsCoveredByTestSummary } from "types/methods-covered-by-test-summary";
import { useBuildVersion } from "hooks";
import { routes } from "common";
import { agentPluginPath } from "router";
import { MethodsList } from "./methods-list";

const MethodInfoValue = styled.div(({ sceleton }: { sceleton?: boolean }) =>
  [tw`text-monochrome-default text-14 break-all`, sceleton && tw`h-4 animate-pulse w-full bg-monochrome-medium-tint rounded`]);

const MethodInfoLabel = styled.div(tw`min-w-32px text-left text-14 leading-32 font-bold text-monochrome-black`);

export const CoveredMethodsByTestSidebar = () => {
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

  return (
    <Modal isOpen onToggle={closeModal}>
      <div tw="flex flex-col h-full">
        <header tw="flex gap-2 items-center h-16 pl-6 pr-6 leading-32 border-b border-monochrome-light-tint">
          <div tw="text-20 text-monochrome-black">Covered methods</div>
          <div
            tw="text-monochrome-default text-16 leading-24"
            style={{ height: "20px" }}
            data-test="covered-methods-by-test-sidebar:methods-count"
          >
            {params?.coveredMethods}
          </div>
        </header>
        <section tw="h-20 pt-2 pb-2 pr-6 pl-6 bg-monochrome-light-tint border-b border-monochrome-medium-tint">
          <div tw="flex items-center w-full gap-4">
            <MethodInfoLabel>Test</MethodInfoLabel>
            <MethodInfoValue
              sceleton={showSceleton}
              className="text-ellipsis"
              title={summary?.testName}
              data-test="covered-methods-by-test-sidebar:test-name"
            >
              {summary?.testName}
            </MethodInfoValue>
          </div>
          <div tw="flex items-center w-full gap-4">
            <MethodInfoLabel>Type</MethodInfoLabel>
            <MethodInfoValue
              sceleton={showSceleton}
              className="text-ellipsis"
              data-test="covered-methods-by-test-sidebar:test-type"
            >
              {capitalize(summary?.testType?.toLowerCase())}
            </MethodInfoValue>
          </div>
        </section>
        <MethodsList
          topicCoveredMethodsByTest={`${topicCoveredMethodsByTest}/${summary.id}/methods`}
          summary={summary}
        />
      </div>
    </Modal>
  );
};
