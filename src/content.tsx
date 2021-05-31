import React from "react";
import { useTestToCodeConnection } from "./hooks";
import { BuildCoverage } from "./types/build-coverage";
import { ClassCoverage } from "./types/class-coverage";

export const Content = () => {
  const { riskCount, percentage } =
    useTestToCodeConnection<BuildCoverage>("/build/coverage") || {};
  const packages =
    useTestToCodeConnection<ClassCoverage[]>("/build/coverage/packages") || [];

  return (
    <div className={"p-4"}>
      <div>Coverage: {percentage} %</div>
      <div>Risks: {riskCount}</div>
      <table className={"table mt-4"}>
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
          ({ id, name, coverage, totalMethodsCount, coveredMethodsCount }) => {
            return (
              <tr>
                <td>{id}</td>
                <td>{name}</td>
                <td>{coverage} %</td>
                <td>{totalMethodsCount}</td>
                <td>{coveredMethodsCount}</td>
              </tr>
            );
          }
        )}
      </table>
    </div>
  );
};
