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
import { TestCoverageInfo } from "types";

export const concatPath = (path?: string, classParams?: string) => {
  if (!classParams && !path) return "";
  if (!classParams) return path;

  return `${path}${classParams}`;
};

export const concatName = (
  name?: string,
  methodParams?: string,
) => {
  if (name && methodParams) return `${name}${methodParams}`;

  return name;
};

export const transformTests = (tests: TestCoverageInfo[]) =>
  tests.map((test) => ({
    ...test,
    overview: {
      ...test.overview,
      details: {
        ...test?.overview?.details,
        name: concatName(
          test?.overview?.details?.testName || test?.name?.testName,
          test?.overview?.details?.params?.methodParams,
        ),
        path: concatPath(
          test?.overview?.details?.path,
          test?.overview?.details?.params?.classParams,
        ),
      },
    },
  }));
