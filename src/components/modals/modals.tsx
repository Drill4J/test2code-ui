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
import { useQueryParams } from "@drill4j/ui-kit";

import {
  AssociatedTestModal, CoveredMethodsModal, QualityGatePane, SessionsManagementPaneProvider,
} from "modules";
import { DeleteScopeModal, FinishScopeModal, RenameScopeModal } from "pages/agent/scope-modals";
import { BaselineBuildModal } from "pages/agent/baseline-build-modal";
import { GetSuggestedTestsModal } from "pages/agent/tests-to-run/tests-to-run-header/get-suggested-tests-modal";
import { FinishAllScopesModal } from "../../pages/group/finish-all-scopes-modal";
import { TestsToRunModal } from "../tests-to-run-modal";

export const agentModalsNames = {
  RENAME_SCOPE: "RENAME_SCOPE",
  FINISH_SCOPE: "FINISH_SCOPE",
  DELETE_SCOPE: "DELETE_SCOPE",
  SESSION_MANAGEMENT: "SESSION_MANAGEMENT",
  ASSOCIATED_TESTS: "ASSOCIATED_TESTS",
  COVERED_METHODS: "COVERED_METHODS",
  QUALITY_GATE: "QUALITY_GATE",
  BASELINE_BUILD: "BASELINE_BUILD",
  GET_SUGGESTED_TESTS: "GET_SUGGESTED_TESTS",
  FINISH_ALL_SCOPES: "FINISH_ALL_SCOPES",
  TESTS_TO_RUN: "TESTS_TO_RUN",
};

export type ModalsType = keyof typeof agentModalsNames;

const modals: Record<ModalsType, any> = {
  SESSION_MANAGEMENT: SessionsManagementPaneProvider,
  DELETE_SCOPE: DeleteScopeModal,
  FINISH_SCOPE: FinishScopeModal,
  RENAME_SCOPE: RenameScopeModal,
  ASSOCIATED_TESTS: AssociatedTestModal,
  COVERED_METHODS: CoveredMethodsModal,
  QUALITY_GATE: QualityGatePane,
  BASELINE_BUILD: BaselineBuildModal,
  GET_SUGGESTED_TESTS: GetSuggestedTestsModal,
  FINISH_ALL_SCOPES: FinishAllScopesModal,
  TESTS_TO_RUN: TestsToRunModal,
};

export const Modals = () => {
  const { activeModal } = useQueryParams<{ activeModal?: ModalsType; }>();
  const ModalComponent = activeModal && modals[activeModal];

  return (
    <>
      {activeModal && ModalComponent && <ModalComponent />}
    </>
  );
};
