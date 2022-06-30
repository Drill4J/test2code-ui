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
import { useMemo } from "react";
import { createRouter, getPagePath as getPage } from "nanostores";
import * as queryString from "querystring";
import { useLocation } from "react-router-dom";
import { getAdminPath } from "utils";
import { getModalPath } from "../common";

/* eslint-disable @typescript-eslint/ban-ts-comment */
interface Routes {
  overview: "buildVersion";
  testsToRun: "buildVersion";
  scope: "buildVersion" | "scopeId";
  allScopes: "buildVersion";
  risks: "buildVersion";
  allBuilds: void;
}

interface Path<PageName extends keyof AppPages, AppPages extends Routes> {
  name: PageName;
  // @ts-ignore
  params?: AppPages[PageName] extends void ? void : Record<AppPages[PageName], string>;
  queryParams?: Record<string, string>
}

export const routesWithoutAdminPath = {
  overview: "/builds/:buildVersion/overview",
  scope: "/builds/:buildVersion/scopes/:scopeId",
  testsToRun: "/builds/:buildVersion/tests-to-tun",
  allScopes: "/builds/:buildVersion/scopes",
  risks: "/builds/:buildVersion/risks",
  allBuilds: "/builds",
};

export const useNavigation = () => {
  const { pathname } = useLocation();

  const routes = useMemo(() => ({
    overview: `${getAdminPath(pathname)}/builds/:buildVersion/overview`,
    scope: `${getAdminPath(pathname)}/builds/:buildVersion/scopes/:scopeId`,
    testsToRun: `${getAdminPath(pathname)}/builds/:buildVersion/tests-to-tun`,
    allScopes: `${getAdminPath(pathname)}/builds/:buildVersion/scopes`,
    risks: `${getAdminPath(pathname)}/builds/:buildVersion/risks`,
    allBuilds: `${getAdminPath(pathname)}/builds`,
  }), [pathname]);

  const router = useMemo(() => createRouter<Routes>(routes), [routes]);

  const getPagePath = <AppPages extends Routes, PageName extends keyof AppPages>({
    name, params, queryParams,
  }: Path<PageName, AppPages>): string => {
    const path = getPage(router, name as any, params as any);
    if (queryParams) {
      return `${path}?${queryString.stringify(queryParams)}`;
    }
    return path;
  };
  return { getPagePath, routes, getModalPath };
};
