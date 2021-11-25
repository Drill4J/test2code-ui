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
export const addColors = (tests: string[]) => {
  const colors = [
    "#D599FF",
    "#88E2F3",
    "#F0876F",
    "#A3D381",
    "#E677C3",
    "#EE7785",
    "#5FEDCE",
    "#FF7FA8",
    "#E79B5F",
    "#6B7EED",
    "#FF9291",
    "#D6AF5C",
    "#B878DC",
    "#FFA983",
    "#BFC267",
    "#83E1A5",
    "#EDD78E",
  ];
  return tests.reduce((acc, testType, i) => ({ ...acc, [testType]: colors[i] }), {});
};
