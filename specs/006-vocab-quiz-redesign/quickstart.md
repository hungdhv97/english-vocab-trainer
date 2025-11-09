# Quickstart: Vocab Quiz Game Redesign

**Feature**: 006-vocab-quiz-redesign  
**Date**: 2025-01-27  
**Purpose**: Manual verification guide for vocab quiz game redesign implementation

## Prerequisites

- Backend server running on `http://localhost:8180`
- Frontend development server running
- Database with migrations applied (005-009)
- At least one user account for authentication
- Vocab levels seeded (A1-C2)
- Words with CEFR levels and meanings populated

## Setup

1. **Start Backend Server**:
   ```bash
   cd backend
   go run ./cmd/api
   ```

2. **Start Frontend Server**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Verify Database Migrations**:
   - Check that `vocab_levels` table exists
   - Check that `word_cefr_levels` table exists
   - Check that `word_meanings` table exists
   - Check that `game_sessions` has `vocab_level_id` column
   - Check that `plays` has `word_meaning_id` and `correct_answer` columns

4. **Verify Vocab Levels**:
   - Check that vocab levels are seeded (A1, A2, B1, B2, C1, C2)
   - Verify level ordering (1-6)
   - Verify scoring configuration exists

5. **Verify Word Data**:
   - Check that words have CEFR level associations
   - Check that words have meanings for each CEFR level
   - Verify English and Vietnamese meanings exist

## Manual Verification Scenarios

### Scenario 1: Level Selection

**Purpose**: Verify vocab level selection page displays CEFR levels correctly.

**Steps**:
1. Navigate to homepage (`http://localhost:5173/`)
2. Click on "Vocabulary Quiz" game card
3. If not authenticated: Complete login
4. Verify level selection page is displayed
5. Verify CEFR levels are shown (A1, A2, B1, B2, C1, C2)
6. Verify level names and descriptions are displayed
7. Click on a level (e.g., A2)

**Expected Results**:
- ✅ Level selection page displays all available vocab levels
- ✅ CEFR level codes are shown (A1-C2)
- ✅ Level names and descriptions are displayed
- ✅ Clicking a level navigates to direction selection page

---

### Scenario 2: Translation Direction Selection

**Purpose**: Verify translation direction selection page works correctly.

**Steps**:
1. After selecting a level (e.g., A2), verify direction selection page is displayed
2. Verify two options are shown: "English to Vietnamese" and "Vietnamese to English"
3. Click on "English to Vietnamese"
4. Verify navigation to game page

**Expected Results**:
- ✅ Direction selection page displays two options
- ✅ Options are clearly labeled (en-to-vi, vi-to-en)
- ✅ Clicking an option navigates to game page
- ✅ Selected direction is stored in session

---

### Scenario 3: Multiple-Choice Questions (English to Vietnamese)

**Purpose**: Verify multiple-choice questions are generated correctly for English to Vietnamese direction.

**Steps**:
1. Select level A2 and direction "English to Vietnamese"
2. Verify game page loads with 20 questions
3. Verify question displays English word
4. Verify four answer options (a, b, c, d) are shown in Vietnamese
5. Verify options are clickable buttons
6. Click on an answer option
7. Verify immediate feedback (correct/incorrect)
8. Verify score updates
9. Verify next question appears
10. Complete all 20 questions

**Expected Results**:
- ✅ Game page displays 20 multiple-choice questions
- ✅ Questions show English words
- ✅ Answer options show Vietnamese translations (a, b, c, d)
- ✅ Options are displayed as buttons
- ✅ Clicking an option provides immediate feedback
- ✅ Score updates after each answer
- ✅ Next question appears after answer
- ✅ All 20 questions can be answered

---

### Scenario 4: Multiple-Choice Questions (Vietnamese to English)

**Purpose**: Verify multiple-choice questions work correctly for Vietnamese to English direction.

**Steps**:
1. Select level A2 and direction "Vietnamese to English"
2. Verify game page loads with 20 questions
3. Verify question displays Vietnamese word
4. Verify four answer options (a, b, c, d) are shown in English
5. Answer all 20 questions
6. Verify questions include words from A2 and A1 levels

**Expected Results**:
- ✅ Questions show Vietnamese words
- ✅ Answer options show English translations (a, b, c, d)
- ✅ Questions include words from selected level and previous levels
- ✅ All questions can be answered successfully

---

### Scenario 5: Level Hierarchical Inclusion

**Purpose**: Verify questions include words from selected level and all previous levels.

**Steps**:
1. Select level B1 (level_order = 3)
2. Start a quiz session
3. Verify questions include words from B1, A2, and A1 levels
4. Check question word IDs and verify they belong to levels with level_order <= 3

**Expected Results**:
- ✅ Questions include words from selected level (B1)
- ✅ Questions include words from previous levels (A2, A1)
- ✅ No words from higher levels (B2, C1, C2) are included
- ✅ Query uses level_order <= selected_level_order

---

### Scenario 6: Session Statistics

**Purpose**: Verify session statistics are calculated and displayed correctly.

**Steps**:
1. Complete a quiz session (all 20 questions)
2. Verify statistics screen is displayed
3. Verify statistics include:
   - Total score
   - Correct answers count
   - Incorrect answers count
   - Accuracy percentage
   - Time elapsed
4. Verify statistics are accurate (match actual performance)

**Expected Results**:
- ✅ Statistics screen displays after session completion
- ✅ Total score is calculated correctly
- ✅ Correct/incorrect counts are accurate
- ✅ Accuracy percentage is calculated correctly (correct/total * 100)
- ✅ Time elapsed is displayed
- ✅ All statistics match actual performance

---

### Scenario 7: Navigation Back

**Purpose**: Verify navigation back buttons work correctly.

**Steps**:
1. Select a level and proceed to direction selection
2. Click back button
3. Verify return to level selection page
4. Select a different level
5. Proceed to direction selection
6. Click back button
7. Verify return to level selection page
8. From game page, click back button before starting quiz
9. Verify return to direction selection page

**Expected Results**:
- ✅ Back button returns to previous screen
- ✅ Level selection is maintained when navigating back
- ✅ Direction selection can be changed after going back
- ✅ Navigation works smoothly without errors

---

### Scenario 8: Distractor Generation

**Purpose**: Verify multiple-choice distractors are plausible and unique.

**Steps**:
1. Start a quiz session
2. Review multiple questions
3. Verify each question has exactly 4 options (a, b, c, d)
4. Verify exactly one option is correct
5. Verify distractors are different from correct answer
6. Verify distractors are from same CEFR level or related words
7. Verify options are shuffled (correct answer not always in same position)

**Expected Results**:
- ✅ Each question has exactly 4 options
- ✅ Exactly one option is correct
- ✅ Distractors are plausible (not obviously wrong)
- ✅ Distractors are from same level or related words
- ✅ Options are shuffled randomly
- ✅ Correct answer appears in different positions across questions

---

### Scenario 9: Session Persistence

**Purpose**: Verify session data is persisted correctly.

**Steps**:
1. Start a quiz session
2. Answer 5 questions
3. Check database for game_sessions record
4. Verify session_tag exists
5. Verify vocab_level_id is set
6. Verify translation_direction is set
7. Check database for plays records
8. Verify 5 plays records exist
9. Verify each play has word_meaning_id and correct_answer
10. Complete session
11. Verify finished_at is set
12. Verify statistics are calculated and stored

**Expected Results**:
- ✅ Game session is created in database
- ✅ Session has correct vocab_level_id
- ✅ Session has correct translation_direction
- ✅ Plays are recorded for each answer
- ✅ Plays have word_meaning_id and correct_answer
- ✅ Session is marked as finished after completion
- ✅ Statistics are calculated and stored

---

### Scenario 10: Edge Cases

**Purpose**: Verify edge cases are handled gracefully.

**Steps**:
1. **Insufficient Words**: Select a level with fewer than 20 words
   - Verify system uses all available words
   - Verify user is informed about fewer questions

2. **No Words Available**: Select a level with no words
   - Verify error message is displayed
   - Verify user can select different level

3. **Rapid Answer Submission**: Click answer options rapidly
   - Verify answers are processed in order
   - Verify no duplicate submissions
   - Verify score updates correctly

4. **Session Expiration**: Let session expire during gameplay
   - Verify session is maintained or clear error is shown
   - Verify user can restart if needed

**Expected Results**:
- ✅ Insufficient words handled gracefully
- ✅ No words error handled with clear message
- ✅ Rapid submissions processed correctly
- ✅ Session expiration handled appropriately

---

## API Verification

### Test Vocab Levels Endpoint

```bash
curl -X GET http://localhost:8180/api/v1/vocab-levels
```

**Expected Response**:
```json
{
  "levels": [
    {
      "vocab_level_id": 1,
      "code": "A1",
      "name": "Beginner A1",
      "level_order": 1,
      "scoring_config": {...}
    },
    ...
  ]
}
```

### Test Question Generation Endpoint

```bash
curl -X POST http://localhost:8180/api/v1/vocab-quiz/questions \
  -H "Content-Type: application/json" \
  -d '{
    "vocab_level_id": 2,
    "translation_direction": "en-to-vi",
    "count": 20
  }'
```

**Expected Response**:
```json
{
  "questions": [
    {
      "question_id": 1,
      "word_id": 123,
      "question_text": "hello",
      "options": {
        "a": "xin chào",
        "b": "tạm biệt",
        "c": "cảm ơn",
        "d": "xin lỗi"
      },
      "correct_answer": "a"
    },
    ...
  ]
}
```

### Test Answer Submission Endpoint

```bash
curl -X POST http://localhost:8180/api/v1/vocab-quiz/answer \
  -H "Content-Type: application/json" \
  -H "Cookie: session_tag=..." \
  -d '{
    "word_id": 123,
    "user_answer": "a",
    "session_tag": "...",
    "word_meaning_id": 456
  }'
```

**Expected Response**:
```json
{
  "is_correct": true,
  "correct_answer": "a",
  "score": 20,
  "target": 1
}
```

### Test Session Statistics Endpoint

```bash
curl -X GET http://localhost:8180/api/v1/vocab-quiz/session/{sessionTag}/statistics
```

**Expected Response**:
```json
{
  "session_tag": "...",
  "total_questions": 20,
  "correct_count": 15,
  "incorrect_count": 5,
  "total_score": 300,
  "accuracy_percentage": 75.0,
  "time_elapsed_seconds": 120.5
}
```

## Translation Job Verification

### Test Full Scan Translation Job

1. **Check Job Configuration**:
   - Verify translation job is enabled in config
   - Verify batch_size parameter is removed
   - Verify schedule is set correctly

2. **Run Translation Job**:
   - Manually trigger translation job
   - Verify all words without translations are processed
   - Verify no batch limit is applied
   - Verify progress is logged

3. **Verify Results**:
   - Check database for new word_meanings records
   - Verify English words have Vietnamese translations
   - Verify translations are stored in word_meanings table
   - Verify primary meanings are marked correctly

**Expected Results**:
- ✅ Translation job processes all words without batch limit
- ✅ All words without translations are processed
- ✅ Translations are stored in word_meanings table
- ✅ Progress is logged for monitoring

## Database Verification

### Check Vocab Levels

```sql
SELECT * FROM vocab_levels WHERE game_id = (SELECT game_id FROM games WHERE code = 'vocab-quiz');
```

**Expected**: 6 rows (A1-C2)

### Check Word CEFR Levels

```sql
SELECT w.word_text, vl.code
FROM words w
JOIN word_cefr_levels wcl ON w.word_id = wcl.word_id
JOIN vocab_levels vl ON wcl.vocab_level_id = vl.vocab_level_id
WHERE w.language_code = 'en'
LIMIT 10;
```

**Expected**: Words associated with CEFR levels

### Check Word Meanings

```sql
SELECT w.word_text, wm.meaning_text, wm.language_code, vl.code
FROM words w
JOIN word_cefr_levels wcl ON w.word_id = wcl.word_id
JOIN vocab_levels vl ON wcl.vocab_level_id = vl.vocab_level_id
JOIN word_meanings wm ON wcl.word_cefr_level_id = wm.word_cefr_level_id
WHERE w.language_code = 'en'
LIMIT 10;
```

**Expected**: Words with meanings for each CEFR level

## Troubleshooting

### Issue: Level selection page not displaying

**Solution**:
- Verify vocab_levels table is seeded
- Check API endpoint `/api/v1/vocab-levels` returns data
- Verify frontend API call is correct

### Issue: Questions not generating

**Solution**:
- Verify words have CEFR level associations
- Verify words have meanings for selected level
- Check database queries for word selection
- Verify level_order filtering is correct

### Issue: Multiple-choice options not displaying

**Solution**:
- Verify question generation API returns options
- Check frontend component for option rendering
- Verify shadcn UI Button components are used
- Check browser console for errors

### Issue: Statistics not calculating

**Solution**:
- Verify plays records are created
- Check statistics calculation query
- Verify session is marked as finished
- Check database for correct_count and incorrect_count

### Issue: Translation job not processing all words

**Solution**:
- Verify batch_size parameter is removed
- Check query for word selection (no LIMIT)
- Verify job configuration
- Check logs for errors

## Success Criteria Verification

- ✅ Users can complete full quiz flow in under 5 minutes
- ✅ 95% of quiz sessions generate 20 questions without errors
- ✅ UI responds within performance targets (<2s load, <100ms interaction)
- ✅ Session statistics are accurately calculated
- ✅ Level hierarchical inclusion works correctly
- ✅ Multiple-choice questions have plausible distractors
- ✅ Translation direction is correctly applied
- ✅ Session data is persisted successfully
- ✅ Navigation works without errors
- ✅ Edge cases are handled gracefully

