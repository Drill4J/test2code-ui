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
import { Icons, Link } from "@drill4j/ui-kit";
import { spacesToDashes } from "@drill4j/common-utils";

import tw, { styled } from "twin.macro";

interface Props {
  label: string;
  value?: string | number;
  path?: string;
}

const Value = styled.span(({ clickable }: {clickable: boolean}) => [
  tw`ml-4 text-20 text-monochrome-black`,
  clickable && tw`cursor-pointer hover:text-blue-default active:text-blue-shade`,
]);

export const TestToCodeHeaderCell = ({
  label, value, path,
}: Props) => (
  <div>
    <div tw="border-l border-monochrome-medium-tint">
      <div tw="ml-4 font-bold text-12 text-monochrome-default uppercase">{label}</div>
      <Value
        clickable={Boolean(path)}
        data-test={`dashboard-header-cell:${spacesToDashes(label)}:value`}
      >
        {path ? (
          <Link tw="inline-flex items-center" to={path}>
            {value}<Icons.Expander tw="ml-1 text-blue-default" height={8} />
          </Link>
        ) : value}
      </Value>
    </div>
  </div>
);
