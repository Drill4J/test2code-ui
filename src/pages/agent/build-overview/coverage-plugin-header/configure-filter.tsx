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
import {
  Autocomplete,
  Button,
  composeValidators,
  Field,
  Fields,
  Form,
  FormGroup,
  Formik,
  Icons,
  LightDropdown,
  MultipleSelectAutocomplete,
  required, sendAlertEvent,
  sizeLimit,
  useFormikContext,
} from "@drill4j/ui-kit";
import React, { useMemo, useState } from "react";
import tw, { styled } from "twin.macro";
import { useAgentRouteParams, useBuildVersion, useTestToCodeRouteParams } from "hooks";
import { Attribute, BetweenOp, OP } from "types";
import { createFilter } from "../../api";

/* eslint-disable react/no-array-index-key */

interface Props {
  closeConfigureFilter: () => void;
}

interface Values {
  name: string;
  attributes: Attribute[];
}

export const ConfigureFilter = ({ closeConfigureFilter }: Props) => {
  const { agentId } = useAgentRouteParams();
  const { buildVersion } = useTestToCodeRouteParams();
  const attributes = useBuildVersion<string[]>("/build/attributes") || [];
  const attributesOptions = useMemo(() => attributes.map((attr) => ({ value: attr, label: attr })), [attributes]);

  return (
    <div tw="relative p-6 bg-monochrome-light-tint border-b border-monochrome-medium-tint">
      <Formik
        onSubmit={async ({ name, attributes: selectedAttributes }: any) => {
          const values = {
            name,
            buildVersion,
            attributes: selectedAttributes.map((attr: any) => ({
              ...attr,
              valuesOp: attr.valuesOp === "any" ? BetweenOp.AND : BetweenOp.OR,
              values: Object.keys(attr.values).map((value) => ({ value, op: OP.EQ })),
            })),
          };
          await createFilter(agentId, values, {
            onSuccess: () => {
              sendAlertEvent({ type: "SUCCESS", title: "Filter has been saved successfully." });
              closeConfigureFilter();
            },
            onError: (msg) => sendAlertEvent({ type: "ERROR", title: msg }),
          });
        }}
        initialValues={{ name: "", attributes: [{ fieldPath: "", values: [], valuesOp: BetweenOp.OR }] } as Values}
        validate={composeValidators(
          required("name"),
          sizeLimit({
            name: "name", min: 1, max: 40,
          }),
        ) as any}
      >
        {({
          setFieldValue, values, isSubmitting, isValid, dirty,
        }) => (
          <Form tw="grid grid-cols-[300px 1fr 300px]">
            <FormGroup tw="mr-6" label="Filter Name">
              <Field
                name="name"
                component={Fields.Input}
                placeholder="Enter filter’s name"
              />
            </FormGroup>
            <div tw="border-l border-monochrome-medium-tint">
              <FormGroup tw="mx-6 mb-3" label="Attributes">
                <div tw="flex flex-col gap-y-4">
                  {values.attributes.map((attr, index) => (
                    <ConfigureAttribute
                      key={index}
                      accessor={index}
                      attributesOptions={attributesOptions}
                    />
                  ))}
                </div>
              </FormGroup>
              <button
                tw="flex items-center gap-x-2 ml-6 link text-14 leading-24 cursor-pointer font-semibold"
                type="button"
                onClick={() => setFieldValue(`attributes[${values.attributes.length}]`, {})}
              >
                <Icons.Plus />Add New
              </button>
            </div>
            <div tw="flex gap-x-4 items-center justify-end border-l border-monochrome-medium-tint">
              <Button secondary size="large" onClick={closeConfigureFilter}>Cancel</Button>
              <Button
                type="submit"
                primary
                size="large"
                disabled={isSubmitting || !isValid || !dirty}
              >
                Apply & Save
              </Button>
            </div>
          </Form>
        )}
      </Formik>
      <HideCriteria tw="absolute left-1/2 -translate-x-1/2 -bottom-px flex items-center gap-x-1 px-2" onClick={closeConfigureFilter}>
        <Icons.Expander width={8} height={8} rotate={-90} /> Hide Criteria
      </HideCriteria>
    </div>
  );
};

interface ConfigureAttributeProps {
  attributesOptions: {value: string, label: string}[];
  accessor: number;
}

const ConfigureAttribute = ({ attributesOptions, accessor }: ConfigureAttributeProps) => {
  const [attributeName, setAttributeName] = useState<string>("");
  const { setFieldValue, values } = useFormikContext<Values>();
  const attrValues = values?.attributes[accessor]?.values || {};

  return (
    <div tw="grid grid-cols-[224px 4px 84px 300px] items-center gap-x-2">
      <Autocomplete
        placeholder="Key"
        options={attributesOptions}
        onChange={(value) => {
          setFieldValue(`attributes[${accessor}].fieldPath`, value);
          setAttributeName(value as string);
        }}
      />
      <span>:</span>
      <LightDropdown
        placeholder="Operator"
        options={[
          { value: "any", label: "any" },
          { value: "all", label: "all" },
        ]}
        onChange={(value) => setFieldValue(`attributes[${accessor}].valuesOp`, value)}
        defaultValue="any"
      />
      <AttributeValues
        onChange={(value) => setFieldValue(`attributes[${accessor}].values`, value)}
        currentValues={attrValues as any}
        attributeName={attributeName}
      />
    </div>
  );
};

interface AttributeValuesProps {
  onChange: (values: Record<string, boolean>) => void;
  currentValues: Record<string, boolean>;
  attributeName: string;
}

const AttributeValues = ({ attributeName, onChange, currentValues }: AttributeValuesProps) => {
  const values = useBuildVersion<string[]>(`/build/attributes/${attributeName}/values`) || [];
  const valuesOptions = useMemo(() => values.map((value) => ({ value, label: value })), [values]);
  return (
    <MultipleSelectAutocomplete
      placeholder="Value"
      options={valuesOptions}
      onChange={onChange as any}
      values={currentValues}
    />
  );
};

const HideCriteria = styled.button`
  ${tw`border border-monochrome-medium-tint bg-monochrome-white text-blue-default text-10 leading-14 font-bold`}
  border-radius: 8px 8px 0px 0px;
`;
