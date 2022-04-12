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
import React, { useMemo } from "react";
import { MultipleSelectAutocomplete } from "@drill4j/ui-kit";
import { useTestToCodeData } from "hooks";

interface Props {
  onChange: (values: Record<string, boolean>) => void;
  currentValues: Record<string, boolean>;
  attributeName: string;
}

export const SelectAttributeValues = ({
  attributeName, onChange, currentValues, ...rest
}: Props) => {
  const values = useTestToCodeData<string[]>(`/build/attributes/${attributeName}/values`) || [];
  const valuesOptions = useMemo(() => values.map((value) => ({ value, label: value })), [values]);
  return (
    <div {...rest}>
      <MultipleSelectAutocomplete
        placeholder="Value"
        options={valuesOptions}
        onChange={onChange as any}
        values={currentValues}
        disabled={!attributeName}
      />
    </div>
  );
};
