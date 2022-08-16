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
import { ContentAlert } from "@drill4j/ui-kit";
import { useFilterState } from "common";
import { useTestToCodeData } from "hooks";
import { TestOverviewFilter } from "types";

export const FilterInfoAlert = () => {
  const { filterId } = useFilterState();
  const filter = useTestToCodeData<TestOverviewFilter>(filterId ? `/build/filters/${filterId}` : null);

  const { name } = filter || {};
  return (
    <>
      {filterId && (
        <ContentAlert type="INFO">
          {`Data are filtered by “${name}”`}
        </ContentAlert>
      )}
    </>
  );
};
