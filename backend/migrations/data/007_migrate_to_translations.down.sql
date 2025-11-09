-- Down migration: Remove migrated translation records

-- Remove translations that were created from concept_id relationships
DELETE FROM translations 
WHERE note = 'Migrated from concept_id relationship';

