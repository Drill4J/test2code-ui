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

import { getPagePath, routes } from "common";
import { RisksModal } from "components";
import { QualityGatePane } from "modules";
import { BuildInfo } from "./build-info";
import { BaselineBuildModal } from "./baseline-build-modal";

export const Agent = () => (
  <div tw="flex flex-col w-full h-full">
    <Switch>
      <Route exact path={getAgentRoutePath("/")} render={() => <Redirect to={getPagePath({ name: "methods" })} />} />
      <Route
        path={[getAgentRoutePath(routes.methods), getAgentRoutePath("/tests")]}
        component={BuildInfo}
      />
    </Switch>
    <Route path={getAgentRoutePath(routes.riskModal)} component={RisksModal} />
    <Route path={getAgentRoutePath(routes.baselineBuildModal)} component={BaselineBuildModal} />
    <Route path={getAgentRoutePath(routes.qualityGate)} component={QualityGatePane} />
  </div>
);
