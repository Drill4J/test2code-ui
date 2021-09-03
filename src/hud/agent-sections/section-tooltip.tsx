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

import { percentFormatter } from "@drill4j/common-utils";
import { capitalize } from "@drill4j/ui-kit";
import { TestTypeSummary } from "../../types/test-type-summary";

export type TestsTypeSummaryWithColor = (TestTypeSummary & {color: string})[]

interface Props {
  className?: string;
  data: TestsTypeSummaryWithColor;
  hideValue?: boolean;
}

const Icon = styled.span`
  ${tw`w-2 h-2 mr-2 rounded`}
  ${({ color }) => `background-color: ${color}`}
`;

export const SectionTooltip = ({ data, hideValue }: Props) => (
  <div tw="flex flex-col">
    {data.map(({ color, type, summary }) => (
      <div tw="flex justify-between items-center w-full" key={type}>
        <div tw="flex items-center w-full">
          <Icon color={color} />
          {`${capitalize(type)} (${summary?.testCount || 0})`}
        </div>
        {!hideValue && (
          <span tw="ml-8 font-regular leading-20 text-right text-monochrome-default">
            {percentFormatter(summary?.coverage?.percentage || 0)}%
          </span>
        )}
      </div>
    ))}
  </div>
);
