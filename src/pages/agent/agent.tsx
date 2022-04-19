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
import React, { useEffect } from "react";
import { TableActionsProvider } from "@drill4j/ui-kit";
import {
  Route, Switch, Redirect, useLocation,
} from "react-router-dom";
import "twin.macro";

import { getAdminPath } from "utils";
import {
  Modals, Breadcrumbs, Baseline, ComparedToBuild,
} from "components";
import {
  useActiveBuild, useAgentRouteParams, useNavigation, useTestToCodeData, useTestToCodeRouteParams,
} from "hooks";
import { BuildOverview } from "./build-overview";
import { ScopeOverview } from "./scope-overview";
import { AllScopes } from "./all-scopes";
import { TestsToRun } from "./tests-to-run";
import { RisksPage } from "./risks";
import { AllBuilds } from "./all-builds";
import { ParentBuild } from "../../types";
import { useSetFilterDispatch } from "../../common";

export const Agent = () => {
  const { agentId } = useAgentRouteParams();
  const { buildVersion } = useTestToCodeRouteParams();
  const { routes, getPagePath } = useNavigation();
  const { pathname } = useLocation();
  const { version: parentBuildVersion } = useTestToCodeData<ParentBuild>("/data/parent") || {};
  const { buildVersion: activeBuildVersion = "" } = useActiveBuild(agentId) || {};
  const isActiveBuild = activeBuildVersion === buildVersion;
  const setFilter = useSetFilterDispatch();

  useEffect(() => {
    setFilter(null);
  }, [buildVersion]);

  if (!activeBuildVersion) { // TODO Add spinner
    return null;
  }

  return (
    <div tw="flex flex-col w-full h-full">
      <div tw="flex justify-between gap-x-3 px-6 border-b border-monochrome-medium-tint">
        <Breadcrumbs />
        <div tw="flex gap-x-6 text-12 font-bold">
          {parentBuildVersion && isActiveBuild && <Baseline />}
          {parentBuildVersion && <ComparedToBuild parentBuildVersion={parentBuildVersion} />}
        </div>
      </div>
      <Switch>
        <Route
          exact
          path={getAdminPath(pathname)}
          render={() => (
            <Redirect
              to={getPagePath({ name: "overview", params: { buildVersion: activeBuildVersion }, queryParams: { activeTab: "methods" } })}
            />
          )}
        />
        <Route
          exact
          path={routes.allBuilds}
          component={AllBuilds}
        />
        <Route
          path={routes.overview}
          component={BuildOverview}
        />
        <Route
          path={routes.scope}
          component={ScopeOverview}
        />
        <Route path={routes.allScopes} component={AllScopes} />
        <Route
          path={routes.risks}
          render={() => (
            <TableActionsProvider defaultState={{
              search: [],
              sort: [{ field: "coverage", order: "ASC" }],
              expandedRows: [],
            }}
            >
              <RisksPage />
            </TableActionsProvider>
          )}
        />
        <Route
          path={routes.testsToRun}
          render={() => (
            <TableActionsProvider>
              <TestsToRun />
            </TableActionsProvider>
          )}
        />
      </Switch>
      <Modals />
    </div>
  );
};
