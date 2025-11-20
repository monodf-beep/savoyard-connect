-- Add unique constraint to prevent duplicate person-section assignments
ALTER TABLE section_members 
ADD CONSTRAINT section_members_person_section_unique 
UNIQUE (person_id, section_id);