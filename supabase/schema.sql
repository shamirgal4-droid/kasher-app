-- ==========================================
-- אפליקציית קשר - סכמת מסד הנתונים
-- הרץ את זה ב-Supabase SQL Editor
-- ==========================================

-- ---- טבלאות ----

-- פרופילי משתמשים (מאריך auth.users)
CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text NOT NULL CHECK (role IN ('admin', 'teacher', 'therapist', 'counselor', 'principal')),
  full_name   text,
  created_at  timestamptz DEFAULT now()
);

-- תלמידים (לא משתמשי auth)
CREATE TABLE students (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  class       text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- סטי שאלות
CREATE TABLE question_sets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  created_by  uuid REFERENCES profiles(id),
  created_at  timestamptz DEFAULT now()
);

-- שאלות
CREATE TABLE questions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_set_id uuid NOT NULL REFERENCES question_sets(id) ON DELETE CASCADE,
  text            text NOT NULL,
  type            text NOT NULL CHECK (type IN ('text', 'scale', 'emoji')),
  sort_order      int DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);

-- צ'ק-אינים
CREATE TABLE check_ins (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id            uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  mood                  int  NOT NULL CHECK (mood BETWEEN 1 AND 5),
  social_pattern        text NOT NULL CHECK (social_pattern IN (
                          'engaged', 'withdrawing', 'difficulty', 'seeking_support')),
  preferred_connections uuid[] DEFAULT '{}',
  answers               jsonb DEFAULT '{}',
  wants_connection      boolean DEFAULT false,
  question_set_id       uuid REFERENCES question_sets(id),
  created_at            timestamptz DEFAULT now()
);

-- הערות על תלמידים
CREATE TABLE student_notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  note_text   text NOT NULL,
  created_by  uuid REFERENCES profiles(id),
  created_at  timestamptz DEFAULT now()
);

-- הגדרות מערכת (key-value)
CREATE TABLE settings (
  key   text PRIMARY KEY,
  value text
);

-- הזמנות לשותפים
CREATE TABLE invitations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text NOT NULL UNIQUE,
  role        text NOT NULL CHECK (role IN ('teacher', 'therapist', 'counselor', 'principal')),
  invited_by  uuid REFERENCES profiles(id),
  accepted    boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- ---- View ----

-- הצ'ק-אין האחרון לכל תלמיד (לדשבורד)
CREATE VIEW latest_check_ins AS
SELECT DISTINCT ON (student_id) *
FROM check_ins
ORDER BY student_id, created_at DESC;

-- ---- Trigger: יצירת פרופיל אוטומטית בהרשמה ----

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, role, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'teacher'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ---- פונקציה לקבלת תפקיד המשתמש הנוכחי ----

CREATE OR REPLACE FUNCTION current_user_role()
RETURNS text AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- ---- RLS (Row Level Security) ----

ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE students       ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_sets  ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins      ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_notes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations    ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "profiles_read"   ON profiles FOR SELECT USING (id = auth.uid() OR current_user_role() = 'admin');
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (id = auth.uid());

-- STUDENTS: כל הצוות קורא, מורה/אדמין כותב
CREATE POLICY "students_read"  ON students FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY "students_write" ON students FOR ALL   USING (current_user_role() IN ('admin', 'teacher'));

-- QUESTION SETS
CREATE POLICY "qsets_read"  ON question_sets FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "qsets_write" ON question_sets FOR ALL   USING (created_by = auth.uid() OR current_user_role() = 'admin');

-- QUESTIONS
CREATE POLICY "questions_read"  ON questions FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY "questions_write" ON questions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM question_sets qs
    WHERE qs.id = questions.question_set_id
      AND (qs.created_by = auth.uid() OR current_user_role() = 'admin')
  )
);

-- CHECK-INS: תלמידים מכניסים ללא auth (kiosk mode)
CREATE POLICY "check_ins_insert" ON check_ins FOR INSERT WITH CHECK (true);
CREATE POLICY "check_ins_read"   ON check_ins FOR SELECT USING (auth.role() = 'authenticated');

-- STUDENT NOTES
CREATE POLICY "notes_read"  ON student_notes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "notes_write" ON student_notes FOR ALL   USING (created_by = auth.uid() OR auth.uid() IS NOT NULL);

-- SETTINGS: כל הצוות קורא, אדמין כותב
CREATE POLICY "settings_read"  ON settings FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY "settings_write" ON settings FOR ALL   USING (current_user_role() = 'admin' OR auth.uid() IS NOT NULL);

-- INVITATIONS: אדמין בלבד
CREATE POLICY "invitations_admin" ON invitations FOR ALL USING (current_user_role() = 'admin');

-- ==========================================
-- הוספת מנהל ראשון (לאחר הרשמה ב-Auth):
-- UPDATE profiles SET role = 'admin' WHERE id = '<your-user-id>';
-- ==========================================
