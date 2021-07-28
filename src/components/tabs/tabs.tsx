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
import tw, { styled, css } from "twin.macro";

interface TabProps {
  active?: boolean
}

export const Tab = styled.div<TabProps>`
  ${tw`relative flex items-center pb-2 mr-4 text-14 font-bold text-monochrome-default cursor-pointer`};
  min-height: 46px;
  box-sizing: border-box;
  border: none;
  background: none;
  white-space: nowrap;
  outline: none;

  ${({ active }) =>
    active &&
    css`
      ${tw`text-monochrome-black`};

      &:after {
        ${tw`bg-blue-default`};
        content: '';
        display: block;
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 4px;
        border-radius: 2px;
        transform: translateY(50%);
      }
    `}
`;
