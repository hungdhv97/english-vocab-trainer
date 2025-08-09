package migrations

import _ "embed" // required for //go:embed directives in this package

// CreateTablesSQL contains the SQL for creating required tables and extensions.
//
//go:embed 001_create_tables.sql
var CreateTablesSQL string
