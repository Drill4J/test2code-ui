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
import React, { useEffect, useRef, useState } from "react";
import tw, { styled } from "twin.macro";
import { useFilterState } from "common";

export const FilterLoader = () => {
  const [state, setState] = useState(false);
  const { filterId } = useFilterState();

  const isFirstRender = useRef(true);

  // TODO: check load filtred data
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      setState(true);
      setTimeout(() => setState(false), 1000);
    }
  }, [filterId]);

  if (state) {
    return (
      <div tw="absolute top-[41px] bottom-0 w-full bg-monochrome-white bg-opacity-80 z-[100] overflow-hidden">
        <Line />
      </div>
    );
  }

  return null;
};

const Line = styled.div`
  ${tw`h-1 w-full bg-blue-default`}
  animation: move 1.2s linear infinite;

  @keyframes move {
    0% {
      margin-left: -100%;
    }

    100% {
      margin-left: 100%;
    }
  }
`;
