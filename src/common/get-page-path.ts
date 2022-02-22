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
import { createRouter, getPagePath as getPage } from "nanostores";
import * as queryString from "querystring";
/* eslint-disable @typescript-eslint/ban-ts-comment */

interface Routes {
  overview: "buildVersion";
  testsToRun: "buildVersion";
  scope: "buildVersion" | "scopeId";
  allScopes: "buildVersion";
  risks: "buildVersion";
  allBuilds: void;
}

export const routes = {
  overview: `${getAdminPath()}/builds/:buildVersion/overview`,
  scope: `${getAdminPath()}/builds/:buildVersion/scopes/:scopeId`,
  testsToRun: `${getAdminPath()}/builds/:buildVersion/tests-to-tun`,
  allScopes: `${getAdminPath()}/builds/:buildVersion/scopes`,
  risks: `${getAdminPath()}/builds/:buildVersion/risks`,
  allBuilds: `${getAdminPath()}/builds`,
};

export const router = createRouter<Routes>(routes);

interface Path<PageName extends keyof AppPages, AppPages extends Routes> {
  name: PageName;
  // @ts-ignore
  params?: AppPages[PageName] extends void ? void : Record<AppPages[PageName], string>;
  queryParams?: Record<string, string>
}

export const getPagePath = <AppPages extends Routes, PageName extends keyof AppPages>({
  name, params, queryParams,
}: Path<PageName, AppPages>): string => {
  const path = getPage(router, name as any, params as any);
  if (queryParams) {
    return `${path}?${queryString.stringify(queryParams)}`;
  }
  return path;
};

export function getAdminPath() {
  const path = window.location.pathname.split("test2code")[0];
  return path.slice(-1) === "/" ? `${path}test2code` : `${path}/test2code`;
}
