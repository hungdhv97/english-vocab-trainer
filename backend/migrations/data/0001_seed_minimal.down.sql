DELETE FROM words
WHERE (language_code = 'en' AND word_text IN ('apple','banana','cat'))
   OR (language_code = 'vi' AND word_text IN (E'táo', E'chuối', E'mèo'));