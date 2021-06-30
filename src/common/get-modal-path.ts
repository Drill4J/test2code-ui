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

interface Routes {
  sessionManagement: void;
  renameScope: "scopeId";
  deleteScope: "scopeId";
  finishScope: "scopeId";
}

export const modalsRoutes = {
  sessionManagement: "/session-management-modal",
  renameScope: "/rename-scope-modal",
  deleteScope: "/delete-scope-modal",
  finishScope: "/finish-scope-modal",
};

interface Path<PageName extends keyof AppPages, AppPages extends Routes> {
  name: PageName;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  params?: AppPages[PageName] extends void ? void : Record<AppPages[PageName], string>;
}

export const getModalPath = <AppPages extends Routes,
  PageName extends keyof AppPages>({ name, params }: Path<PageName, AppPages>): string => {
  const pluginLocation = window.location.pathname.split("/").slice(0, 7).join("/");
  const pluginRoute = window.location.pathname.split("/").slice(7).join("/");
  let path = `${pluginLocation}/${pluginRoute}${modalsRoutes[name as
    keyof typeof modalsRoutes]}/?${queryString.stringify(params as queryString.ParsedUrlQueryInput)}`;
  Object.values(modalsRoutes).forEach((value) => {
    if (pluginRoute.includes(value)) {
      const [newPluginRoute] = pluginRoute.split(value);
      path = `${pluginLocation}/${newPluginRoute}${modalsRoutes[name as
        keyof typeof modalsRoutes]}/?${queryString.stringify(params as queryString.ParsedUrlQueryInput)}`;
    }
  });
  return path;
};
