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
import "twin.macro";
import { FilterInfoAlert, PageHeader } from "components";

interface Props {
  notCoveredRisksCount: number;
}

export const RisksPageHeader = ({ notCoveredRisksCount }: Props) => (
  <PageHeader>
    <div>
      <div tw="mb-1 font-light text-24 leading-32 text-monochrome-black" data-test="risks-list:title">
        <span>Risks</span>
        <span tw="ml-2 text-monochrome-default">
          {notCoveredRisksCount}
        </span>
      </div>
    </div>
    <div tw="ml-6">
      <FilterInfoAlert />
    </div>
  </PageHeader>
);
