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
import tw, { styled } from "twin.macro";
import { PageHeader } from "components";

const Subtitle = styled.div`
  ${tw`grid gap-x-1`}
  grid-template-columns: max-content minmax(auto, max-content) max-content minmax(auto, max-content);
  ${tw`font-bold text-14 leading-20 text-monochrome-default`}
`;

interface Props {
  buildVersion: string;
  previousBuildVersion: string;
  notCoveredRisksCount: number;
}

export const RisksPageHeader = ({ buildVersion, previousBuildVersion, notCoveredRisksCount }: Props) => (
  <PageHeader>
    <div>
      <div tw="mb-1 font-light text-24 leading-32 text-monochrome-black" data-test="risks-list:title">
        <span>Risks</span>
        <span tw="ml-2 text-monochrome-default">
          {notCoveredRisksCount}
        </span>
      </div>
      <Subtitle data-test="risks-list:subtitle">
        <span>Build:</span>
        <span
          className="text-monochrome-black text-ellipsis"
          data-test="risks-list:current-build-version"
          title={buildVersion}
        >
          {buildVersion}
        </span>
        <span tw="ml-1">Compared to:</span>
        <span
          className="text-monochrome-black text-ellipsis"
          data-test="risks-list:previous-build-version"
          title={`Build ${previousBuildVersion}`}
        >
          Build {previousBuildVersion}
        </span>
      </Subtitle>
    </div>
  </PageHeader>
);
