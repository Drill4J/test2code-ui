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

export {
  COVERAGE_TYPES_COLOR, DATA_VISUALIZATION_COLORS, RISKS_TYPES_COLOR, TESTS_TO_RUN_TYPES_COLOR,
  TESTS_TYPES_COLOR, AGENT_STATUS, PLUGIN_ID, BUILD_STATUS,
} from "./constants";
export { defaultAdminSocket, test2CodePluginSocket } from "./connections";
export { modalsRoutes, getModalPath } from "./get-modal-path";
export { getGroupModalPath, groupModalsRoutes } from "./get-group-modal";
export {
  SetPanelContext, SetFilterDispatchContext, useSetFilterDispatch, useFilterState, FilterContextProvider,
} from "./contexts";
