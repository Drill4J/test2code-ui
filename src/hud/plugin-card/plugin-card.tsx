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
import React, { Children, ReactNode } from "react";
import tw, { styled } from "twin.macro";

interface Props {
  header: React.ReactNode;
  children?: ReactNode[];
}

const Sections = styled.div`
  ${tw`grid grid-cols-4`}
  & > *:not(:last-child) {
      ${tw`border-r border-monochrome-medium-tint`}
  }`;

export const PluginCard = ({ children, header }: Props) => (
  <div tw="w-full h-fit border border-monochrome-medium-tint">
    <div tw="w-full p-4 border-b border-monochrome-medium-tint text-14 leading-20">
      {header}
    </div>
    <Sections>
      {Children.map(children, (child) => (
        <div tw="w-full p-4">{child}</div>
      ))}
    </Sections>
  </div>
);
