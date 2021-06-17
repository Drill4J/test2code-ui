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
import ReactDOM from "react-dom";
import singleSpaReact from "single-spa-react";
import { BrowserRouter } from "react-router-dom";
import Root from "./root.component";

import { AgentHud as Test2CodeAgentHUD, ServiceGroupHud as Test2CodeServiceGroupHUD } from "./hud";

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: Root,
  domElementGetter: () => document.getElementById("test2code") || document.body,
});

export const AgentHUD = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: Test2CodeAgentHUD,
});

export const ServiceGroupHUD = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: () => <BrowserRouter><Test2CodeServiceGroupHUD /></BrowserRouter>,
});

export const { bootstrap, mount, unmount } = lifecycles;
