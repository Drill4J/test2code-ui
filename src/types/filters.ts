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
export enum OP {
  EQ= "EQ",
}

export enum BetweenOp {
  AND = "AND",
  OR = "OR"
}

export interface FilterValue {
  value?: string;
  op?: OP.EQ;
}

export interface Filter {
  name?: string;
  id?: string;
}

export interface TestOverviewFilter {
  name?: string;
  buildVersion?: string;
  attributesOp?: string;
  agentId?: string;
  attributes?: Attribute[];
  isLabel?: boolean;
}

export interface Attribute {
  fieldPath: string;
  valuesOp: BetweenOp;
  values: AttributeValue[];
  isLabel?: boolean;
}

export interface AttributeValue {
  value: string;
  op: OP.EQ;
}

export interface BuildAttribute {
  name?: string;
  isLabel?: boolean
}
