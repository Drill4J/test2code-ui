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
import { Route, Switch, Redirect } from "react-router";
import { getAgentRoutePath } from "router";
import "twin.macro";

import { getPagePath, modalsRoutes, routes } from "common";
import { RisksModal } from "components";
import { QualityGatePane, SessionsManagementPaneProvider, AssociatedTestModal } from "modules";
import { BuildOverview } from "./build-overview";
import { BaselineBuildModal } from "./baseline-build-modal";
import { DeleteScopeModal, FinishScopeModal, RenameScopeModal } from "./scope-modals";
import { ScopeOverview } from "./scope-overview";
import { AllScopes } from "./all-scopes";
import { CoveredMethodsByTestSidebar } from "../../modules/covered-methods-by-test-sidebar";

export const Agent = () => (
  <div tw="flex flex-col w-full h-full">
    <div tw="mx-6">
      <Switch>
        <Route exact path={getAgentRoutePath("/")} render={() => <Redirect to={getPagePath({ name: "methods" })} />} />
        <Route
          path={[getAgentRoutePath(routes.methods), getAgentRoutePath(routes.tests)]}
          component={BuildOverview}
        />
        <Route path={[getAgentRoutePath(routes.scopeMethods), getAgentRoutePath(routes.scopeTests)]} component={ScopeOverview} />
        <Route path={getAgentRoutePath(routes.allScopes)} component={AllScopes} />
      </Switch>
    </div>
    <Route path={`*${modalsRoutes.risks}`} component={RisksModal} />
    <Route path={getAgentRoutePath(routes.baselineBuildModal)} component={BaselineBuildModal} />
    <Route path={getAgentRoutePath(routes.qualityGate)} component={QualityGatePane} />
    <Route
      path={`*${modalsRoutes.sessionManagement}`}
      component={SessionsManagementPaneProvider}
    />
    <Route
      path={`*${modalsRoutes.finishScope}`}
      component={FinishScopeModal}
    />
    <Route
      path={`*${modalsRoutes.renameScope}`}
      component={RenameScopeModal}
    />
    <Route
      path={`*${modalsRoutes.deleteScope}`}
      component={DeleteScopeModal}
    />
    <Route
      path={`*${modalsRoutes.associatedTests}`}
      component={AssociatedTestModal}
    />
    <Route
      path={`*${modalsRoutes.coveredMethods}`}
      component={CoveredMethodsByTestSidebar}
    />
  </div>
);
