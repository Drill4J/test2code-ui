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
import * as queryString from "querystring";
import { agentModalsNames } from "../components";

interface Routes {
  sessionManagement: void;
  finishAllScopes: void;
  testsToRun: void;
}

export const groupModalsRoutes: Record<string, keyof typeof agentModalsNames> = {
  sessionManagement: "SESSION_MANAGEMENT",
  finishAllScopes: "FINISH_ALL_SCOPES",
  testsToRun: "TESTS_TO_RUN",
};

interface Path<PageName extends keyof AppPages, AppPages extends Routes> {
  name: PageName;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  params?: AppPages[PageName] extends void ? void : Record<AppPages[PageName], string>;
}

export const getGroupModalPath = <AppPages extends Routes,
  PageName extends keyof AppPages>({ name, params }: Path<PageName, AppPages>): string => {
  const { pathname } = window.location;
  return `${pathname}?${queryString.stringify({ activeModal: groupModalsRoutes[name], ...params } as queryString.ParsedUrlQueryInput)}`;
};
