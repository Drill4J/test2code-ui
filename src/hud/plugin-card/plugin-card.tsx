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
import { Link } from "react-router-dom";
import tw, { styled } from "twin.macro";
import { NAVIGATION_EVENT_NAMES, sendNavigationEvent } from "common/analytic";

interface Props {
  children?: ReactNode[];
  pluginLink: string;
  agentId: string;
}

const Sections = styled.div`
  ${tw`grid grid-cols-4`}
  & > *:not(:last-child) {
      ${tw`border-r border-monochrome-medium-tint`}
  }`;

export const PluginCard = ({ children, pluginLink, agentId }: Props) => (
  <div tw="w-full h-fit border border-monochrome-medium-tint">
    <div tw="flex justify-between w-full p-4 border-b border-monochrome-medium-tint text-14 leading-20">
      <span tw="font-bold text-monochrome-default uppercase">test2code</span>
      <Link
        className="font-regular link no-underline"
        to={pluginLink}
        onClick={() => {
          sendNavigationEvent({
            name: NAVIGATION_EVENT_NAMES.CLICK_ON_VIEW_MORE,
            dimension2: agentId,
            label: "dashboards",
          });
        }}
      >
        View more &gt;
      </Link>
    </div>
    <Sections>
      {Children.map(children, (child) => (
        <div tw="w-full p-4">{child}</div>
      ))}
    </Sections>
  </div>
);
