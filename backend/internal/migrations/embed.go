package migrations

import _ "embed"

// CreateTablesSQL contains the SQL for creating required tables and extensions.
//go:embed 001_create_tables.sql
var CreateTablesSQL string