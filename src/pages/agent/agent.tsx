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
import { TableActionsProvider } from "@drill4j/ui-kit";
import { Route, Switch, Redirect } from "react-router-dom";
import { getAgentRoutePath } from "router";
import "twin.macro";

import { getPagePath, routes } from "common";
import { Modals } from "components";

import { BuildOverview } from "./build-overview";
import { ScopeOverview } from "./scope-overview";
import { AllScopes } from "./all-scopes";
import { TestsToRun } from "./tests-to-run";
import { RisksPage } from "./risks";

export const Agent = () => (
  <div tw="flex flex-col w-full h-full">
    <div>
      <Switch>
        <Route
          exact
          path={getAgentRoutePath("/")}
          render={() => <Redirect to={getPagePath({ name: "test2code", queryParams: { activeTab: "methods" } })} />}
        />
        <Route
          path={getAgentRoutePath(routes.test2code)}
          component={BuildOverview}
        />
        <Route
          path={[getAgentRoutePath(routes.scopeMethods), getAgentRoutePath(routes.scopeTests)]}
          component={ScopeOverview}
        />
        <Route path={getAgentRoutePath(routes.allScopes)} component={AllScopes} />
        <Route
          path={getAgentRoutePath(routes.risks)}
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
          path={getAgentRoutePath(routes.testsToRun)}
          render={() => (
            <TableActionsProvider>
              <TestsToRun />
            </TableActionsProvider>
          )}
        />
      </Switch>
    </div>
    <Modals />
  </div>
);
