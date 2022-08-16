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
import React, { memo } from "react";
import { useTableActionsState, Stub, Icons } from "@drill4j/ui-kit";
import { FilterList } from "@drill4j/types-admin/dist";

import { TestCoverageInfo } from "types/test-coverage-info";
import { useFilteredData } from "hooks";
import { TestDetails } from "pages/agent/tests-table";
import { BuildCoverage } from "types";

export const BuildTestsTable = memo(() => {
  const { search } = useTableActionsState();
  const { items = [], totalCount } = useFilteredData<FilterList<TestCoverageInfo>>("/build/tests",
    { filters: search, output: "LIST" }) || {};
  const { byTestType = [] } = useFilteredData<BuildCoverage>("/build/coverage") || {};
  const testsType = byTestType.map(({ type }) => type);

  return (totalCount ? (
    <TestDetails
      tests={items}
      topicCoveredMethodsByTest="/build/tests"
      testTypes={testsType}
    />
  ) : (
    <Stub
      icon={<Icons.Test height={104} width={107} />}
      title="No tests have been executed yet"
      message="Start testing to begin collecting coverage."
    />
  )
  );
});
