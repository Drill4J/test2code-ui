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
import {
  Icons, Tooltip, Checkbox, Field,
} from "@drill4j/ui-kit";
import { parseCoverage, inputLengthRestriction } from "@drill4j/common-utils";

import tw, { styled } from "twin.macro";

import { ConditionSettingByType } from "types/quality-gate-type";
import { ThresholdValueField } from "./threshold-value-field";

interface Props {
  conditionSettingByType: ConditionSettingByType;
}

const GridWrapper = styled.div`
  ${tw`grid gap-x-4 h-14`}
  grid-template-columns: 16px 1fr 80px;
  
  & > div:first-child {
    ${tw`block`}
  }
`;

export const QualityGateSettings = ({ conditionSettingByType }: Props) => (
  <div tw="h-48 px-6 mt-6">
    <GridWrapper>
      <Field
        tw="text-blue-default"
        name="coverage.enabled"
        type="checkbox"
        component={Checkbox}
      />
      <Field
        name="coverage.condition.value"
        component={ThresholdValueField}
        disabled={!conditionSettingByType?.coverage?.enabled}
        normalize={parseCoverage}
      >
        <div tw="text-14 leading-16 text-monochrome-black" data-test="quality-gate-settings:condtion:coverage">
          Build coverage, %
          <div tw="text-10 leading-16 text-monochrome-default" data-test="quality-gate-settings:condtion-status:coverage">
            Minimum % of build methods covered by tests
          </div>
        </div>
      </Field>
    </GridWrapper>
    <GridWrapper>
      <Field
        tw="text-blue-default"
        name="risks.enabled"
        type="checkbox"
        component={Checkbox}
      />
      <Field
        name="risks.condition.value"
        component={ThresholdValueField}
        disabled={!conditionSettingByType?.risks?.enabled}
        normalize={(value: string) => inputLengthRestriction(value, 7)}
      >
        <div tw="text-14 leading-16 text-monochrome-black">
          <div className="flex items-center gap-x-2 w-full" data-test="quality-gate-settings:condtion:risks">
            Risks
            <Tooltip
              message={(
                <div className="flex flex-col items-center w-full">
                  <span>Try to cover all of your risks in current build.</span>
                  <span>Uncovered risks won’t be counted in your next build.</span>
                </div>
              )}
            >
              <Icons.Info tw="text-monochrome-default" width={12} height={12} data-test="quality-gate-settings:info-icon" />
            </Tooltip>
          </div>
          <div tw="text-10 leading-16 text-monochrome-default" data-test="quality-gate-settings:condtion-status:risks">
            Maximum number of not covered risk methods
          </div>
        </div>
      </Field>
    </GridWrapper>
    <GridWrapper>
      <Field
        tw="text-blue-default"
        name="tests.enabled"
        type="checkbox"
        component={Checkbox}
      />
      <Field
        name="tests.condition.value"
        component={ThresholdValueField}
        disabled={!conditionSettingByType?.tests?.enabled}
        normalize={(value: string) => inputLengthRestriction(value, 7)}
      >
        <div tw="text-14 leading-16 text-monochrome-black" data-test="quality-gate-settings:condtion:tests">
          Tests to run
          <div tw="text-10 leading-16 text-monochrome-default" data-test="quality-gate-settings:condtion-status:tests">
            Maximum number of not executed tests to run
          </div>
        </div>
      </Field>
    </GridWrapper>
  </div>
);
