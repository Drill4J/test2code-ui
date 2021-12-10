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
import React, {
  useCallback, useEffect, useMemo, useRef,
} from "react";
import {
  Icons, Stub, Table, TableElements, Cells, useQueryParams,
} from "@drill4j/ui-kit";
import { Link } from "react-router-dom";
import { FilterList } from "@drill4j/types-admin/dist";

import { useExpanded, useTable } from "react-table";
import tw, { styled } from "twin.macro";

import { ClassCoverage } from "types/class-coverage";
import { useBuildVersion } from "hooks";
import { Package } from "types/package";

import { NameCell } from "./name-cell";
import { CoverageCell } from "./coverage-cell";
import { getModalPath } from "../../../common";

interface Props {
  topic: string;
  classesTopicPrefix: string;
  showCoverageIcon: boolean;
}

const TableRow = styled(TableElements.TR)`
  ${({ isHighlighted }: {isHighlighted: boolean}) => isHighlighted && tw`!bg-yellow-light-tint hover:!bg-monochrome-light-tint`}
`;

const renderProps = {
  header: (title: string, pageLength: number, dataLength: number) => (
    <div tw="flex justify-between text-monochrome-default text-14 leading-24 pb-3">
      <div tw="uppercase font-bold">{title}</div>
      <div>{`Displaying ${pageLength} of ${dataLength} packages`}</div>
    </div>
  ),
};

export const MethodsTable = ({
  classesTopicPrefix,
  topic,
  showCoverageIcon,
}: Props) => {
  const { ownerClass = "", methodName = "" } = useQueryParams<{
    ownerClass?: string; methodName?: string; }>();

  const ownerClassPath = ownerClass.slice(0, ownerClass.lastIndexOf("/"));

  const {
    items: coverageByPackages = [],
  } = useBuildVersion<FilterList<ClassCoverage>>(topic, { output: "LIST" }) ||
  {};

  const columns = [
    {
      Header: () => null,
      id: "expander",
      Cell: ({ row }: any) => (
        <span
          {...row.getToggleRowExpandedProps?.()}
          tw="grid place-items-center w-4 h-4 text-blue-default"
        >
          {row.isExpanded ? <Icons.Expander rotate={90} /> : <Icons.Expander />}
        </span>
      ),
      SubCell: ({ row }: any) =>
        (row.canExpand ? (
          <span
            {...row.getToggleRowExpandedProps?.()}
            tw="absolute top-2.5 left-12 z-10 grid place-items-center w-4 h-4 text-blue-default"
          >
            {row.isExpanded ? (
              <Icons.Expander rotate={90} />
            ) : (
              <Icons.Expander />
            )}
          </span>
        ) : null),
      notSortable: true,
      width: "32px",
    },
    {
      Header: "Name",
      accessor: "name",
      filterable: true,
      isCustomCell: true,
      Cell: ({ value = "", state }: any) => (
        <NameCell
          icon={<Icons.Package />}
          value={<Cells.Highlight text={value} searchWords={state.filters.map((filter: {value: string}) => filter.value)} />}
          testContext="package"
        />
      ),
      SubCell: ({ value = "", row }: any) => {
        const ref = useRef<HTMLDivElement>(null);
        useEffect(() => {
          if (value === methodName) {
            ref?.current?.scrollIntoView({
              behavior: "smooth",
              block: "end",
            });
          }
        }, []);
        return (row.canExpand ? (
          <div tw="pl-8">
            <NameCell
              icon={<Icons.Class />}
              value={value}
              testContext="package"
            />
          </div>
        ) : (
          <div tw="pl-13" ref={ref}>
            <Cells.Compound
              key={value}
              cellName={value}
              cellAdditionalInfo={row.original.decl}
              icon={<Icons.Function />}
            />
          </div>
        ));
      },
      textAlign: "left",
      width: "50%",
    },
    {
      Header: () => (
        <div className="flex justify-end items-center w-full">
          Coverage, %
          <Icons.Checkbox
            tw="ml-4 min-w-16px text-monochrome-default"
            width={16}
            height={16}
          />
        </div>
      ),
      accessor: "coverage",
      Cell: ({ value = 0 }: { value: number }) => (
        <CoverageCell value={value} showCoverageIcon={showCoverageIcon} />
      ),
      width: "15%",
    },
    {
      Header: "Methods total",
      accessor: "totalMethodsCount",
      width: "10%",
    },
    {
      Header: "Methods covered",
      accessor: "coveredMethodsCount",
      width: "15%",
    },
    {
      Header: "Associated tests",
      accessor: "assocTestsCount",
      Cell: ({ value = "", row }: any) => (
        <Cells.Clickable
          data-test="coverage-details:associated-tests-count"
          disabled={!value}
          tw="inline"
        >
          {value ? (
            <Link to={getModalPath({ name: "associatedTests", params: { testId: row.original.id, treeLevel: "1" } })}>{value}</Link>
          ) : (
            "n/a"
          )}
        </Cells.Clickable>
      ),
      width: "10%",
    },
  ];

  const ExpandedClasses = ({ parentRow }: any) => {
    const { classes = [] } =
      useBuildVersion<Package>(
        `/${classesTopicPrefix}/coverage/packages/${parentRow.values.name}`,
      ) || {};
    const defaultExpandedClass = classes.find(({ methods = [] }) => methods.find(({ name }) => name === methodName));
    const strngifiedClasses = JSON.stringify(classes);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { rows, prepareRow, toggleRowExpanded } = useTable(
      {
        columns: useMemo(() => columns as any, []),
        data: useMemo(() => classes, [strngifiedClasses]),
        getSubRows: (row) => row.methods || [],
      },
      useExpanded,
    );
    const defaultExpandedRow = rows.find((row) => row.original.id === defaultExpandedClass?.id);

    useEffect(() => {
      defaultExpandedRow?.id && toggleRowExpanded(defaultExpandedRow.id);
    }, [strngifiedClasses]);

    return (
      <>
        {rows.map((row: any) => {
          prepareRow(row);
          const rowProps = row.getRowProps();
          return (
            <TableRow
              {...rowProps}
              isHighlighted={!row.canExpand && row.original.name === methodName}
              isExpanded={row.isExpanded}
              id={row?.original?.name}
            >
              {row.cells.map((cell: any) => (
                <td
                  {...cell.getCellProps()}
                  tw="relative px-4"
                  style={{ textAlign: cell.column.textAlign || "right" }}
                  data-test={`expanded-td-${rowProps.key}-${cell.column.id}`}
                >
                  {cell.render(cell.column.SubCell ? "SubCell" : "Cell")}
                </td>
              ))}
            </TableRow>
          );
        })}
      </>
    );
  };

  const renderRowSubComponent = useCallback(
    ({ row }) => <ExpandedClasses parentRow={row} />,
    [showCoverageIcon],
  );

  const columnsDependency = useMemo(
    () => [showCoverageIcon],
    [showCoverageIcon],
  );

  return (
    <div tw="flex flex-col mt-8" data-test="methods-table">
      <Table
        defaultFilters={[{ id: "name", value: ownerClassPath }]}
        columns={columns}
        data={coverageByPackages}
        renderRowSubComponent={renderRowSubComponent}
        columnsDependency={columnsDependency}
        isDefaultExpanded={(original: any) => original?.name === ownerClassPath}
        stub={(
          <Stub
            icon={<Icons.Package height={104} width={107} />}
            title="No results found"
            message="Try adjusting your search or filter to find what you are looking for."
          />
        )}
        renderHeader={({ currentCount, totalCount }): JSX.Element => (
          <div tw="flex justify-between text-monochrome-default text-14 leading-24 pb-3">
            <div tw="uppercase font-bold">Application Packages</div>
            <div>{`Displaying ${currentCount} of ${totalCount} packages`}</div>
          </div>
        )}
      />
    </div>
  );
};
