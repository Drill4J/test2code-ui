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

type Status = "PASSED" | "FAILED" | "SKIPPED";

export const TestsStatus = ({ status }: { status: Status}) => (
  <div tw="flex items-center gap-x-2">
    <Circle status={status} />
    <span tw="text-14 leading-20 text-monochrome-black capitalize">{status.toLowerCase()}</span>
  </div>
);

const Circle = styled.span(({ status }: {status: Status}) => [
  tw`w-2 h-2 rounded-full`,
  status === "PASSED" && tw`bg-green-default`,
  status === "FAILED" && tw`bg-red-default`,
  status === "SKIPPED" && tw`bg-monochrome-dark-tint`,
]);
