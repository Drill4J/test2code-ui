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
import { Modal } from "@drill4j/ui-kit";
import { useQueryParams, useCloseModal } from "@drill4j/common-hooks";
import "twin.macro";

import { AssociatedTests } from "types/associated-tests";
import { useBuildVersion } from "hooks";
import { useParams } from "react-router-dom";
import { ItemInfo } from "./item-info";
import { TestsList } from "./tests-list";

export const AssociatedTestModal = () => {
  const { scopeId = "" } = useParams<{ scopeId?: string; }>();
  const params = useQueryParams<{testId?: string; treeLevel?: number}>();
  const associatedTests = useBuildVersion<AssociatedTests>(`${scopeId ? `/build/scopes/${scopeId}` : "/build"}/tests/associatedWith/${
    params?.testId}`) || {};
  const {
    tests = [], packageName = "", className: testClassName = "", methodName = "",
  } = associatedTests;
  const testsMap = tests.reduce((acc, { type = "", name = "" }) =>
    ({ ...acc, [type]: acc[type] ? [...acc[type], name] : [name] }), {} as { [testType: string]: string[] });
  const closeModal = useCloseModal("/associated-tests-modal");

  return (
    <Modal isOpen onToggle={closeModal}>
      <div tw="flex flex-col h-full">
        <div tw="flex items-center min-h-64px pl-6 text-18 leading-24">
          <span tw="text-monochrome-black">Associated tests</span>
          {tests.length ? <div tw="ml-2 font-light text-monochrome-default">{tests.length}</div>
            : <div tw="ml-2"><div tw="h-4 bg-monochrome-medium-tint rounded" /></div>}
        </div>
        <ItemInfo
          packageName={packageName}
          testClassName={testClassName}
          methodName={methodName}
          treeLevel={Number(params?.treeLevel)}
        />
        <TestsList associatedTests={{ testsMap, assocTestsCount: tests.length }} />
      </div>
    </Modal>
  );
};
