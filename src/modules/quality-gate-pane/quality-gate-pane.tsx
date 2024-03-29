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
import React, { useState } from "react";
import {
  Button, Panel, Icons, Spinner, composeValidators, numericLimits, positiveInteger,
  Form, Formik, useCloseModal,
} from "@drill4j/ui-kit";

import tw, { styled } from "twin.macro";

import {
  ConditionSetting, ConditionSettingByType, QualityGate, QualityGateStatus as Status,
} from "types/quality-gate-type";
import { KEY_METRICS_EVENT_NAMES, sendKeyMetricsEvent } from "common/analytic";
import { useAdminConnection, useAgentRouteParams, useFilteredData } from "hooks";
import { AnalyticsInfo } from "types";
import { QualityGateStatus } from "./quality-gate-status";
import { QualityGateSettings } from "./quality-gate-settings";
import { updateQualityGateSettings } from "./api";

const validateQualityGate = (formValues: ConditionSettingByType) => composeValidators(
  formValues.coverage?.enabled ? numericLimits({
    fieldName: "coverage.condition.value",
    fieldAlias: "Build coverage",
    min: 0.1,
    max: 100,
  }) : () => undefined,
  formValues.risks?.enabled ? positiveInteger("risks.condition.value", "The field") : () => undefined,
  formValues.tests?.enabled ? positiveInteger("tests.condition.value", "The field") : () => undefined,
)(formValues);

export const QualityGatePane = () => {
  const { pluginId = "", agentId = "" } = useAgentRouteParams();
  const [isEditing, setIsEditing] = useState(false);
  const closeModal = useCloseModal();
  const { isAnalyticsDisabled } = useAdminConnection<AnalyticsInfo>("/api/analytics/info") || {};

  const handleOnToggle = () => {
    closeModal();
    setIsEditing(false);
  };

  const {
    status = "FAILED",
    results = { coverage: false, risks: false, tests: false },
  } = useFilteredData<QualityGate>("/data/quality-gate") || {};
  const conditionSettings = useFilteredData<ConditionSetting[]>("/data/quality-gate-settings") || [];

  const conditionSettingByType = conditionSettings.reduce(
    (conditionSetting, measureType) => ({
      ...conditionSetting,
      [measureType.condition.measure]: measureType,
    }),
    {} as ConditionSettingByType,
  );

  const StatusIcon = Icons[status];

  const configured = conditionSettings.some(({ enabled }) => enabled);

  return (
    <Panel onClose={handleOnToggle}>
      <Panel.Content isDisableFadeClick={isEditing}>
        <Formik
          onSubmit={async (values) => {
            await updateQualityGateSettings(agentId, pluginId)(values as ConditionSettingByType);
            setIsEditing(false);
            const { coverage, risks, tests } = values as ConditionSettingByType;
            const label = [];
            coverage?.enabled && label.push("Build coverage");
            risks?.enabled && label.push("Risks");
            tests?.enabled && label.push("Tests to run");
            !isAnalyticsDisabled && sendKeyMetricsEvent({
              name: KEY_METRICS_EVENT_NAMES.CLICK_ON_SAVE_BUTTON_IN_QG_PANEL,
              label: label.join("#"),
            });
          }}
          initialValues={conditionSettingByType}
          validate={validateQualityGate}
          enableReinitialize
        >
          {({
            values, isValid, dirty, isSubmitting, initialValues, resetForm,
          }) => {
            const isCheckboxesPristine = Object.entries(values)
              .every(([key, value]) => conditionSettingByType[key].enabled === value.enabled);

            return (
              <Form tw="flex flex-col h-full font-regular">
                <Panel.Header tw="flex gap-x-2 justify-between">
                  <div tw="text-20 leading-32" data-test="quality-gate-pane:header-title">Quality Gate</div>
                  {configured && !isEditing && (
                    <StatusIconWrapper status={status}>
                      <StatusIcon width={24} height={24} data-test="quality-gate-pane:header-status-icon" />
                    </StatusIconWrapper>
                  )}
                </Panel.Header>
                <Panel.SubHeader tw="flex gap-x-2 text-14">
                  <Icons.Info tw="pt-1" />
                  {configured && !isEditing
                    ? "Meet all conditions to pass the quality gate."
                    : "Choose the metrics and define their threshold."}
                </Panel.SubHeader>
                <Panel.Body>
                  {configured && !isEditing
                    ? <QualityGateStatus conditionSettingByType={initialValues} results={results} />
                    : <QualityGateSettings conditionSettingByType={values} />}
                </Panel.Body>
                <Panel.Footer>
                  <ActionsPanel>
                    {configured && !isEditing ? (
                      <Button
                        primary
                        size="large"
                        onClick={() => { resetForm(); setIsEditing(true); }}
                        data-test="quality-gate-pane:edit-button"
                      >
                        Edit
                      </Button>
                    )
                      : (
                        <Button
                          className="flex justify-center items-center gap-x-1 w-16"
                          primary
                          size="large"
                          disabled={!isValid || (!dirty && isCheckboxesPristine) || isSubmitting}
                          type="submit"
                          data-test="quality-gate-pane:save-button"
                        >
                          {isSubmitting ? <Spinner /> : "Save"}
                        </Button>
                      )}
                    {configured && isEditing && (
                      <Button
                        className="flex gap-x-2"
                        secondary
                        size="large"
                        type="reset"
                        onClick={() => setIsEditing(false)}
                        data-test="quality-gate-pane:back-button"
                      >
                        <Icons.Expander width={8} height={14} rotate={180} />
                        <span>Back</span>
                      </Button>
                    )}
                    <Button
                      secondary
                      size="large"
                      onClick={handleOnToggle}
                      data-test="quality-gate-pane:cancel-button"
                    >
                      Close
                    </Button>
                  </ActionsPanel>
                </Panel.Footer>
              </Form>
            );
          }}
        </Formik>
      </Panel.Content>
    </Panel>
  );
};

const StatusIconWrapper = styled.div(({ status }: { status: Status }) => [
  tw`flex items-center`,
  status === "PASSED" && tw`text-green-default`,
  status === "FAILED" && tw`text-red-default`,
]);

const ActionsPanel = styled.div`
  ${tw`grid gap-4 items-center`};
  grid-template-columns: max-content max-content max-content;
`;
