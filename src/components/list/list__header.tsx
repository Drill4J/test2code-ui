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
import React, { memo } from "react";
import "twin.macro";

import { ColumnProps } from "./list-types";

interface Props {
  columns: ColumnProps[];
  style: { [key: string]: string };
}

export const ListHeader = memo(({ columns, style }: Props) => (
  <div tw="grid items-center h-24 px-6 border-b border-monochrome-medium-tint" style={style}>
    {columns.map((column) => {
      const DefaultHeaderCell = ({ column: { label } }: { column: ColumnProps }) => (
        <div>{label}</div>
      );
      const HeaderCell = column.HeaderCell || DefaultHeaderCell;
      return <HeaderCell column={column} key={column.name} />;
    })}
  </div>
));
