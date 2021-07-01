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

interface Routes {
  methods: void
  tests: void
  testsToRun: void
  scopeMethods: "scopeId"
  scopeTests: "scopeId"
  allScopes: void
}

export const routes = {
  methods: "/methods",
  tests: "/tests",
  scopeMethods: "/scopes/:scopeId/methods",
  scopeTests: "/scopes/:scopeId/tests",
  testsToRun: "/tests-to-tun",
  allScopes: "/scopes",
};

export const router = createRouter<Routes>(routes);

interface Path<PageName extends keyof AppPages, AppPages extends Routes> {
  name: PageName;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  params?: AppPages[PageName] extends void ? void : Record<AppPages[PageName], string>;
}

export const getPagePath = <AppPages extends Routes, PageName extends keyof AppPages>({ name, params }: Path<PageName, AppPages>): string =>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  `${window.location.pathname.split("/").slice(0, 7).join("/")}${getPage(router, name, params)}`;
