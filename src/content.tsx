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
import { useBuildVersion } from "hooks";
import { BuildCoverage } from "types/build-coverage";
import { ClassCoverage } from "types/class-coverage";
import "twin.macro";

export const Content = () => {
  const { riskCount, percentage } =
    useBuildVersion<BuildCoverage>("/build/coverage") || {};
  const packages =
    useBuildVersion<ClassCoverage[]>("/build/coverage/packages") || [];

  return (
    <div tw="p-4">
      <div>Coverage: {percentage} %</div>
      <div>Risks: {riskCount}</div>
      <table className="table mt-4">
        <thead>
          <tr>
            <td>id</td>
            <td>name</td>
            <td>coverage</td>
            <td>totalMethodsCount</td>
            <td>coveredMethodsCount</td>
          </tr>
        </thead>
        {packages.map(
          ({
            id, name, coverage, totalMethodsCount, coveredMethodsCount,
          }) => (
            <tr>
              <td>{id}</td>
              <td>{name}</td>
              <td>{coverage} %</td>
              <td>{totalMethodsCount}</td>
              <td>{coveredMethodsCount}</td>
            </tr>
          ),
        )}
      </table>
    </div>
  );
};
