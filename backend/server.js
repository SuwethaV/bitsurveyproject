const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require('./src/config/config.js').development;

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to MySQL database.");
});

const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email, role: user.role_ }, "your_secret_key", { expiresIn: "1h" });
};
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(403).json({ success: false, message: "No token provided." });
  }

  jwt.verify(token, "your_secret_key", (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: "Failed to authenticate token." });
    }
    req.user = decoded;
    next();
  });
};


app.post("/login", (req, res) => {
  const { email, password_, role } = req.body;
  console.log("Request body:", req.body);
 
  if (!email || !password_ || !role) {
    return res.status(400).json({ success: false, message: "❌ Please provide email, password, and role." });
  }

  db.query("SELECT * FROM users WHERE email = ? AND role_ = ?", [email, role], async (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ success: false, message: "⚠️ Server error. Please try again later." });
    }

    console.log("Database query results:", results);

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: "⚠️ Invalid credentials or role mismatch." });
    }

    const user = results[0];

    const isPasswordValid = await bcrypt.compare(password_, user.password_);
    console.log("Password comparison result:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "⚠️ Invalid credentials." });
    }

    db.query("SELECT * FROM questions WHERE staff_email = ?", [email], (err, surveyResults) => {
      if (err) {
        console.error("❌ Database error:", err);
        return res.status(500).json({ success: false, message: "⚠️ Server error. Please try again later." });
      }

      const hasCreatedSurvey = surveyResults.length > 0;

      const token = generateToken(user);
      console.log("Generated token:", token);

      res.status(200).json({
        success: true,
        message: "✅ Login successful!",
        token,
        hasCreatedSurvey,
        staffEmail: user.email, 
      });
    });
  });
});
app.post("/register", (req, res) => {
  const { email, userID, role_, password_ } = req.body;

  if (!email || !userID || !role_ || !password_) {
    return res.status(400).json({ success: false, message: "❌ Please fill all fields." });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ success: false, message: "⚠️ Server error. Please try again later." });
    }

    if (results.length > 0) {
      return res.status(400).json({ success: false, message: "⚠️ Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password_, 10);

    db.query(
      "INSERT INTO users (email, userID, role_, password_) VALUES (?, ?, ?, ?)",
      [email, userID, role_, hashedPassword],
      (err, results) => {
        if (err) {
          console.error("❌ Database error:", err);
          return res.status(500).json({ success: false, message: "⚠️ Server error. Please try again later." });
        }

        res.status(201).json({ success: true, message: "✅ Registration successful!" });
      }
    );
  });
});


//   console.log("Request Body:", req.body);
//   const surveyData = req.body;
//   const staff_email = req.user.email;
//   const survey_id = req.body.survey_id;
//   const surveyTitle = req.body.surveyTitle;
//   const isDraft = req.body.draft === "draft"; // Check if it's a draft

//   if (!surveyData || !Array.isArray(surveyData.questions)) {
//     console.error("Invalid data format:", surveyData);
//     return res.status(400).json({ error: "Invalid data format" });
//   }

//   try {
//     // If survey_id exists, first check if we need to update instead of inserting new rows
//     const existingSurveyQuery = `
//       SELECT COUNT(*) AS count FROM questions WHERE survey_id = ? AND staff_email = ?
//     `;

//     db.query(existingSurveyQuery, [survey_id, staff_email], async (err, results) => {
//       if (err) {
//         console.error("Error checking existing survey:", err);
//         return res.status(500).json({ error: "Database error" });
//       }

//       const isExistingSurvey = results[0].count > 0;

//       const queryPromises = surveyData.questions.map((q) => {
//         return new Promise((resolve, reject) => {
//           const sqlQuery = isExistingSurvey
//             ? // Update existing questions
//               `UPDATE questions 
//                SET question_text = ?, shuffle_answers = ?, shuffle_questions = ?, 
//                    skip_based_on_answer = ?, multiple_choice = ?, scale = ?, 
//                    score_question = ?, add_other_option = ?, require_answer = ?, 
//                    texts = ?, survey_name = ?, draft = ?
//                WHERE survey_id = ? AND staff_email = ?`
//             : // Insert new questions
//               `INSERT INTO questions 
//                (question_text, shuffle_answers, shuffle_questions, skip_based_on_answer, 
//                multiple_choice, scale, score_question, add_other_option, require_answer, 
//                texts, survey_id, staff_email, survey_name, draft) 
//                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//           const sqlParams = isExistingSurvey
//             ? [
//                 q.text,
//                 q.shuffle_answers || false,
//                 q.shuffle_questions || false,
//                 q.skip_based_on_answer || false,
//                 q.type === "multiple" ? true : false,
//                 q.type === "scale" ? true : false,
//                 q.score_question || false,
//                 q.add_other_option || false,
//                 q.require_answer || false,
//                 q.type === "text" ? true : false,
//                 surveyTitle,
//                 isDraft ? "draft" : null, // Fix: Null when finishing survey
//                 survey_id,
//                 staff_email,
//               ]
//             : [
//                 q.text,
//                 q.shuffle_answers || false,
//                 q.shuffle_questions || false,
//                 q.skip_based_on_answer || false,
//                 q.type === "multiple" ? true : false,
//                 q.type === "scale" ? true : false,
//                 q.score_question || false,
//                 q.add_other_option || false,
//                 q.require_answer || false,
//                 q.type === "text" ? true : false,
//                 survey_id,
//                 staff_email,
//                 surveyTitle,
//                 isDraft ? "draft" : null, // Fix: Null when finishing survey
//               ];

//           db.query(sqlQuery, sqlParams, (err, result) => {
//             if (err) {
//               console.error("Error saving survey:", err);
//               return reject(err);
//             }
//             resolve();
//           });
//         });
//       });

//       await Promise.all(queryPromises);
//       res.status(200).json({ message: isDraft ? "Survey saved as draft!" : "Survey saved successfully!", survey_id });
//     });
//   } catch (error) {
//     console.error("Database error:", error);
//     res.status(500).json({ error: "Internal server error", details: error.message });
//   }
// });
app.post("/save-survey", verifyToken, async (req, res) => {
  console.log("Request Body:", req.body);
  const surveyData = req.body;
  const staff_email = req.user.email;
  const survey_id = req.body.survey_id;
  const surveyTitle = req.body.surveyTitle;
  const isDraft = req.body.draft === "draft"; // Check if it's a draft

  if (!surveyData || !Array.isArray(surveyData.questions)) {
    console.error("Invalid data format:", surveyData);
    return res.status(400).json({ error: "Invalid data format" });
  }

  try {
    // If survey_id exists, first check if we need to update instead of inserting new rows
    const existingSurveyQuery = `
      SELECT COUNT(*) AS count FROM questions WHERE survey_id = ? AND staff_email = ?
    `;

    db.query(existingSurveyQuery, [survey_id, staff_email], async (err, results) => {
      if (err) {
        console.error("Error checking existing survey:", err);
        return res.status(500).json({ error: "Database error" });
      }

      const isExistingSurvey = results[0].count > 0;

      // Save questions
      const questionPromises = surveyData.questions.map((q) => {
        return new Promise((resolve, reject) => {
          const sqlQuery = isExistingSurvey
            ? // Update existing questions
              `UPDATE questions 
               SET question_text = ?, shuffle_answers = ?, shuffle_questions = ?, 
                   skip_based_on_answer = ?, multiple_choice = ?, scale = ?, 
                   score_question = ?, add_other_option = ?, require_answer = ?, 
                   texts = ?, survey_name = ?, draft = ?
               WHERE survey_id = ? AND staff_email = ?`
            : // Insert new questions
              `INSERT INTO questions 
               (question_text, shuffle_answers, shuffle_questions, skip_based_on_answer, 
               multiple_choice, scale, score_question, add_other_option, require_answer, 
               texts, survey_id, staff_email, survey_name, draft) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

          const sqlParams = isExistingSurvey
            ? [
                q.text,
                q.shuffle_answers || false,
                q.shuffle_questions || false,
                q.skip_based_on_answer || false,
                q.type === "multiple" ? true : false,
                q.type === "scale" ? true : false,
                q.score_question || false,
                q.add_other_option || false,
                q.require_answer || false,
                q.type === "text" ? true : false,
                surveyTitle,
                isDraft ? "draft" : null, // Fix: Null when finishing survey
                survey_id,
                staff_email,
              ]
            : [
                q.text,
                q.shuffle_answers || false,
                q.shuffle_questions || false,
                q.skip_based_on_answer || false,
                q.type === "multiple" ? true : false,
                q.type === "scale" ? true : false,
                q.score_question || false,
                q.add_other_option || false,
                q.require_answer || false,
                q.type === "text" ? true : false,
                survey_id,
                staff_email,
                surveyTitle,
                isDraft ? "draft" : null, // Fix: Null when finishing survey
              ];

          db.query(sqlQuery, sqlParams, (err, result) => {
            if (err) {
              console.error("Error saving question:", err);
              return reject(err);
            }

            const questionId = isExistingSurvey ? q.id : result.insertId; // Get the question ID

            // Save options for this question
            const optionPromises = q.options.map((option) => {
              return new Promise((resolve, reject) => {
                const optionQuery = `
                  INSERT INTO options (question_id, option_text)
                  VALUES (?, ?)
                `;

                db.query(optionQuery, [questionId, option], (err, result) => {
                  if (err) {
                    console.error("Error saving option:", err);
                    return reject(err);
                  }
                  resolve();
                });
              });
            });

            Promise.all(optionPromises)
              .then(() => resolve())
              .catch((err) => reject(err));
          });
        });
      });

      await Promise.all(questionPromises);
      res.status(200).json({ message: isDraft ? "Survey saved as draft!" : "Survey saved successfully!", survey_id });
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

app.post('/save-permissions', verifyToken, (req, res) => {
  const {
    startDate,
    startTime,
    endDate,
    endTime,
    schedulingFrequency,
    daysOfWeek,
    randomTiming,
    timeDifference,
    sendReminders,
    assignedRoles,
    responseLimit,
    survey_id,
    surveyTitle, // Added surveyTitle
  } = req.body;
  const staff_email=req.user.email

  if (!survey_id) {
    return res.status(400).json({ success: false, message: "❌ Survey ID is required." });
  }

  const query = `
    INSERT INTO permissions (
      id,
      start_date, 
      start_time, 
      end_date, 
      end_time, 
      scheduling_frequency, 
      days_of_week, 
      random_timing, 
      time_difference, 
      send_reminders, 
      assigned_roles, 
      response_limit,
      survey_title,
      staff_email
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
  `;

  db.query(
    query,
    [
      survey_id,
      startDate,
      startTime,
      endDate,
      endTime,
      JSON.stringify(schedulingFrequency),
      JSON.stringify(daysOfWeek),
      randomTiming,
      timeDifference,
      sendReminders,
      assignedRoles,
      responseLimit,
      surveyTitle,
      staff_email // Added surveyTitle
    ],
    (err, result) => {
      if (err) {
        console.error('Error saving permissions:', err);
        res.status(500).send('Error saving permissions');
        return;
      }
      res.status(200).send('Permissions saved successfully');
    }
  );
});
const { v4: uuidv4 } = require('uuid');

app.post('/feedback', (req, res) => {
  const feedbacks = req.body; // Array of feedback objects from frontend
  const fbid = uuidv4(); // Generate a unique feedback batch ID

  const query = `
    INSERT INTO feedbacks (
      student, facultyCourse, periodical, clarity, topicDiscussions,
      timeManagement, syllabusCoverage, satisfaction, comments, fbid
    ) VALUES (?,?,?,?,?,?,?,?,?,?)
  `;

  let successCount = 0;
  let errorCount = 0;

  // Loop through each feedback and insert it individually
  feedbacks.forEach((feedback, index) => {
    const values = [
      feedback.student,
      feedback.facultyCourse,
      feedback.periodical,
      feedback.clarity,
      feedback.topicDiscussions,
      feedback.timeManagement,
      feedback.syllabusCoverage,
      feedback.satisfaction,
      feedback.comments,
      fbid, // Include the feedback batch ID
    ];

    db.query(query, values, (err, results) => {
      if (err) {
        console.error(`Error inserting feedback at index ${index}:`, err);
        errorCount++;
      } else {
        successCount++;
      }

      // Check if all feedbacks have been processed
      if (index === feedbacks.length - 1) {
        if (errorCount > 0) {
          res.status(500).json({
            message: `Failed to submit ${errorCount} feedback(s).`,
            successCount: successCount,
            errorCount: errorCount,
            fbid: fbid, // Return the feedback batch ID
          });
        } else {
          res.status(201).json({
            message: 'All feedbacks submitted successfully!',
            successCount: successCount,
            fbid: fbid, // Return the feedback batch ID
          });
        }
      }
    });
  });
});
app.post('/submit-feedback', (req, res) => {
  const { name, rollno, facultyname, videosUseful, materialsUseful, clearPSLevels, feedback } = req.body;

  const sql = `INSERT INTO skillfb (Name, RollNo, Faculty, Isvideo_Useful, Materialsuseful, clearPslevels, Feedback) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const values = [name, rollno, facultyname, videosUseful, materialsUseful, clearPSLevels, feedback];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Error submitting feedback');
      return;
    }
    res.status(200).send('Feedback submitted successfully');
  });
});

// Add this endpoint in your backend code
app.get("/get-surveys", verifyToken, (req, res) => {
  const staff_email = req.user.email; // Get the logged-in faculty's email from the token

  const query = `
    SELECT DISTINCT start_date, survey_title, staff_email, end_date, start_time, end_time
    FROM permissions 
    WHERE 
      staff_email = ? 
      AND (
        (start_date < CURDATE()) -- Survey started in the past
        OR (start_date = CURDATE() AND start_time <= CURRENT_TIME()) -- Survey starts today and has already started
      )
      AND (
        (end_date > CURDATE()) -- Survey is ongoing in the future
        OR (end_date = CURDATE() AND end_time >= CURRENT_TIME()) -- Survey ends today but is still active
      )
  `;

  db.query(query, [staff_email], (err, results) => {
    if (err) {
      console.error("Error fetching surveys:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }
    
    console.log("Live Surveys:");
    results.forEach(survey => {
      console.log(`Survey Title: ${survey.survey_title}`);
    });

    res.json(results); // Return the list of surveys
  });
});
app.get("/get-drafts", verifyToken, (req, res) => {
  const staff_email = req.user.email;
  
  // Query to select drafts, grouping by survey_id, survey_title, and staff_email
  const query = `
    SELECT 
      survey_id, 
      survey_name, 
      staff_email
    FROM questions
    WHERE staff_email = ? AND draft = 'draft'
    GROUP BY survey_id, survey_name, staff_email
  `;
  
  db.query(query, [staff_email], (err, results) => {
    if (err) {
      console.error("Error fetching drafts:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }
    
    // Print the results to the console for debugging
    console.log("Fetching drafts for email:", staff_email);

    console.log("Drafts grouped by survey_id, survey_name, and staff_email:", results);
    
    // Return the grouped drafts
    res.json(results);
  });
});

app.get("/get-completed-surveys", verifyToken, (req, res) => {
  const staff_email = req.user.email;

  const query = `
    SELECT DISTINCT start_date, survey_title, staff_email, end_date, start_time, end_time
    FROM permissions 
    WHERE 
      staff_email = ? 
      AND (
        end_date < CURDATE() -- Completed if end_date is before today
        OR (start_date = CURDATE() AND end_date = CURDATE() AND end_time < CURRENT_TIME()) -- Completed if today is the start and end date, but time has passed
      )
  `;

  db.query(query, [staff_email], (err, results) => {
    if (err) {
      console.error("Error fetching completed surveys:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }

    console.log("Completed Surveys:");
    results.forEach(survey => {
      console.log(`Survey Title: ${survey.survey_title}`);
    });

    res.json(results);
  });
});

app.get("/get-scheduled-surveys", verifyToken, (req, res) => {
  const staff_email = req.user.email;

  const query = `
    SELECT DISTINCT start_date, survey_title, staff_email, end_date, start_time, end_time
    FROM permissions 
    WHERE 
      staff_email = ? 
      AND (
        start_date > CURDATE()  -- Future date (scheduled)
        OR (start_date = CURDATE() AND start_time > CURRENT_TIME()) -- Today, but time is in the future
      )
  `;

  db.query(query, [staff_email], (err, results) => {
    if (err) {
      console.error("Error fetching scheduled surveys:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }

    console.log("Scheduled Surveys:");
    results.forEach(survey => {
      console.log(`Survey Title: ${survey.survey_title}`);
    });

    res.json(results);
  });
});



// Get a student by Rollno
app.get("/student/:email", (req, res) => {
  const { email } = req.params;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const sql = "SELECT * FROM studentdetails WHERE Email = ?";
  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error("Error fetching student:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result.length > 0 ? result[0] : null);
  });
});

// Add a new student
app.post("/student", (req, res) => {
  const student = req.body;
  if (!student.Email || !student.Rollno) {
    return res.status(400).send({ message: "Email and Rollno are required" });
  }

  const sql = "INSERT INTO studentdetails SET ?";
  db.query(sql, student, (err, result) => {
    if (err) {
      console.error("Error saving student details:", err);
      return res.status(500).send({ message: "Error saving student details", error: err });
    }
    res.send({ message: "Student added successfully", id: result.insertId });
  });
});

// Update student details
app.put("/student/:rollno", (req, res) => {
  const { rollno } = req.params;
  const student = req.body;
  if (!rollno) {
    return res.status(400).send({ message: "Rollno is required" });
  }

  const sql = "UPDATE studentdetails SET ? WHERE Rollno = ?";
  db.query(sql, [student, rollno], (err, result) => {
    if (err) {
      console.error("Error updating student details:", err);
      return res.status(500).send({ message: "Error updating student details", error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).send({ message: "Student not found" });
    }
    res.send({ message: "Student updated successfully" });
  });
});


app.post('/students', (req, res) => {
  const { selectedLevels, selectedRole, startRange, endRange } = req.body;

  console.log("Received request body:", req.body); // Log the request body

  let query = 'SELECT Name,Year,Email,Department FROM studentdetails WHERE 1=1';
  let queryParams = [];

  // Add condition for selectedRole
  if (selectedRole) {
    query += ' AND Mentor = ?';
    queryParams.push(selectedRole);
  }

  // Add condition for RP range
  if (startRange && endRange) {
    query += ' AND Rp BETWEEN ? AND ?';
    queryParams.push(startRange, endRange);
  }

  // Add conditions for selectedLevels
  if (selectedLevels && selectedLevels.length > 0) {
    selectedLevels.forEach(level => {
      const lastSpaceIndex = level.lastIndexOf(' ');
      const skill = level.substring(0, lastSpaceIndex).trim();
      const levelNumber = level.substring(lastSpaceIndex + 1).trim();

      let column;
      switch (skill.toUpperCase()) {
        case 'C PROGRAMMING':
          column = 'C_levels';
          break;
        case 'PYTHON':
          column = 'Python_Levels';
          break;
        case 'JAVA':
          column = 'Java_levels';
          break;
        case 'SQL':
          column = 'DBMS_levels';
          break;
        case 'PROBLEM SOLVING':
          column = 'ProblemSolving';
          break;
        case 'UIUX':
          column = 'UIUX';
          break;
        case 'APTITUDE':
          column = 'Aptitude';
          break;
        default:
          console.error(`Unknown skill: ${skill}`);
          return;
      }

      // Add condition for each skill-level pair
      query += ` AND ${column} = ?`;
      queryParams.push(levelNumber.replace('Level', ''));
    });
  }

  console.log("Generated SQL Query:", query); // Log the final SQL query
  console.log("Query Parameters:", queryParams); // Log the query parameters
  

  // Execute the query
  db.query(query, queryParams, (error, results) => {
    if (error) {
      console.error('Database error:', error); // Log the database error
      return res.status(500).json({ error: 'Database error', details: error.message });
    }
    console.log("Query Results:", results); // Log the query results
    res.json(results);
  });
});

app.post("/creategroup", (req, res) => {
  const { groupName, students, staffemail } = req.body;

  if (!groupName || students.length === 0 || !staffemail) {
    return res.status(400).json({ error: "Group name, staff email, and students are required" });
  }

  // Insert group into student_groups_info with staffemail
  db.query(
    "INSERT INTO student_groups_info (GroupName, staffmail) VALUES (?, ?)",
    [groupName, staffemail],
    (err, result) => {
      if (err) {
        console.error("Error inserting group:", err);
        return res.status(500).json({ error: "Database error" });
      }

      const groupId = result.insertId;

      // Insert students into student_groups
      const studentData = students.map(({ Name, Year, Email, Department }) => [groupId, Name, Year, Email, Department]);

      db.query(
        "INSERT INTO student_groups (GroupID, Name, Year, Email, Department) VALUES ?",
        [studentData],
        (err) => {
          if (err) {
            console.error("Error inserting students:", err);
            return res.status(500).json({ error: "Failed to insert student details" });
          }

          res.json({ message: "Group created successfully!" });
        }
      );
    }
  );
});
app.get("/get-faculty-groups", verifyToken, (req, res) => {
  const staff_email = req.user.email;

  const query = `
    SELECT GroupID, GroupName 
    FROM student_groups_info 
    WHERE staffmail = ?
  `;

  db.query(query, [staff_email], (err, results) => {
    if (err) {
      console.error("Error fetching faculty groups:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }

    res.json(results);
  });
});

//   const studentEmail = req.user.email;
//   console.log("Fetching surveys for student:", studentEmail); // Log student email

//   const studentQuery = `
//     SELECT Year, Department, GroupID 
//     FROM student_groups 
//     WHERE Email = ?
//   `;

//   db.query(studentQuery, [studentEmail], (err, studentResults) => {
//     if (err) {
//       console.error("Error fetching student details:", err);
//       return res.status(500).json({ error: "Database error", details: err.message });
//     }

//     if (studentResults.length === 0) {
//       console.log("Student not found in database"); // Log if student not found
//       return res.status(404).json({ error: "Student not found" });
//     }

//     const { Year, Department, GroupID } = studentResults[0];
//     console.log("Student details:", { Year, Department, GroupID }); // Log student details

//     const surveyQuery = `
//       SELECT DISTINCT start_date, survey_title, staff_email, end_date, start_time, end_time
//       FROM permissions 
//       WHERE 
//         (assigned_roles = ? AND ? IN (SELECT Email FROM student_groups WHERE Year = ?))
//         OR (assigned_roles = ? AND ? IN (SELECT Email FROM student_groups WHERE Department = ?))
//         OR (assigned_roles = ? AND ? IN (SELECT Email FROM student_groups WHERE GroupID = ?))
//     `;

//     const surveyParams = [
//       `Year:${Year}`, studentEmail, Year,
//       `Department:${Department}`, studentEmail, Department,
//       `Group:${GroupID}`, studentEmail, GroupID,
//     ];

//     db.query(surveyQuery, surveyParams, (err, surveyResults) => {
//       if (err) {
//         console.error("Error fetching surveys:", err);
//         return res.status(500).json({ error: "Database error", details: err.message });
//       }

//       console.log("Surveys found:", surveyResults); // Log survey results

//       const groupQuery = `
//         SELECT GroupName 
//         FROM student_groups_info 
//         WHERE GroupID = ?
//       `;

//       db.query(groupQuery, [GroupID], (err, groupResults) => {
//         if (err) {
//           console.error("Error fetching group name:", err);
//           return res.status(500).json({ error: "Database error", details: err.message });
//         }

//         const GroupName = groupResults.length > 0 ? groupResults[0].GroupName : "No Group";
//         console.log("Group Name:", GroupName); // Log group name

//         const surveysWithGroup = surveyResults.map((survey) => ({
//           ...survey,
//           GroupName,
//         }));

//         res.json(surveysWithGroup);
//       });
//     });
//   });
// });


app.get("/surveysuser", verifyToken, (req, res) => {
  const studentEmail = req.user.email;
  console.log("Fetching surveys for student:", studentEmail);

  const studentQuery = `
    SELECT sg.Year, sg.Department, sg.GroupID, sgi.GroupName 
    FROM student_groups sg
    LEFT JOIN student_groups_info sgi ON sg.GroupID = sgi.GroupID
    WHERE sg.Email = ?
  `;

  db.query(studentQuery, [studentEmail], (err, studentResults) => {
    if (err) {
      console.error("Error fetching student details:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }

    if (studentResults.length === 0) {
      console.log("Student not found in student_groups. Checking studentdetails...");
      const studentDetailsQuery = `SELECT Year, Department FROM studentdetails WHERE Email = ?`;
      
      db.query(studentDetailsQuery, [studentEmail], (err, studentDetailsResults) => {
        if (err) {
          console.error("Error fetching student details:", err);
          return res.status(500).json({ error: "Database error", details: err.message });
        }

        if (studentDetailsResults.length === 0) {
          return res.status(404).json({ error: "Student not found in database" });
        }

        const { Year, Department } = studentDetailsResults[0];
        fetchSurveys(studentEmail, Year, Department, [], res);
      });
    } else {
      const studentGroups = studentResults.map(r => ({
        GroupID: r.GroupID,
        GroupName: r.GroupName
      }));
      
      const { Year, Department } = studentResults[0];
      fetchSurveys(studentEmail, Year, Department, studentGroups, res);
    }
  });
});

const fetchSurveys = (studentEmail, Year, Department, studentGroups, res) => {
  console.log("Fetching surveys for:", { Year, Department, studentGroups });

  let groupConditions = "";
  let groupParams = [];
  
  if (studentGroups.length > 0) {
    groupConditions = `OR p.assigned_roles IN (${studentGroups.map(() => "?").join(",")})`;
    groupParams = studentGroups.map(g => g.GroupName); // Directly use GroupName
  }

  const surveyQuery = `
    SELECT DISTINCT 
      p.start_date, 
      p.survey_title, 
      p.staff_email, 
      p.end_date, 
      p.start_time, 
      p.end_time, 
      p.response_limit,
      p.assigned_roles,
      p.id as survey_id
    FROM permissions p
    WHERE (
      p.assigned_roles = CONCAT('Year:', ?) 
      OR p.assigned_roles = CONCAT('Department:', ?)
      ${groupConditions}
    )
    ORDER BY p.start_date DESC
  `;

  const surveyParams = [Year, Department, ...groupParams];

  console.log("Executing query:", surveyQuery);
  console.log("With params:", surveyParams);

  db.query(surveyQuery, surveyParams, (err, surveyResults) => {
    if (err) {
      console.error("Error fetching surveys:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }

    console.log("Raw survey results:", surveyResults);

    const formattedSurveys = surveyResults.map((survey) => {
      try {
        const startDate = new Date(survey.start_date);
        const endDate = new Date(survey.end_date);
        
        const startTimeParts = survey.start_time ? survey.start_time.split(':') : [0, 0, 0];
        const endTimeParts = survey.end_time ? survey.end_time.split(':') : [23, 59, 59];
        
        startDate.setHours(startTimeParts[0], startTimeParts[1], startTimeParts[2]);
        endDate.setHours(endTimeParts[0], endTimeParts[1], endTimeParts[2]);

        let surveyType = "Other";
        let groupInfo = {};
        
        // Check if assigned_roles matches any of the student's groups
        const matchedGroup = studentGroups.find(g => g.GroupName === survey.assigned_roles);
        if (matchedGroup) {
          surveyType = "Group";
          groupInfo = {
            GroupID: matchedGroup.GroupID,
            GroupName: matchedGroup.GroupName
          };
        } else if (survey.assigned_roles === `Year:${Year}`) {
          surveyType = "Year";
        } else if (survey.assigned_roles === `Department:${Department}`) {
          surveyType = "Department";
        }

        return {
          ...survey,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          response_limit: survey.response_limit || 1,
          survey_type: surveyType,
          ...groupInfo
        };
      } catch (error) {
        console.error("Error formatting survey:", survey, error);
        return null;
      }
    }).filter(survey => survey !== null);

    console.log("Formatted surveys:", formattedSurveys);
    res.json(formattedSurveys);
  });
};


app.get('/surveyquestions/:title', (req, res) => {
  const { title } = req.params;

  db.query('SELECT * FROM questions WHERE survey_name = ?', [title], (err, questions) => {
    if (err) {
      console.error('Error fetching questions:', err);
      return res.status(500).send('Internal Server Error');
    }

    if (questions.length === 0) {
      return res.json([]);
    }

    const questionsWithOptions = [];
    let completedQueries = 0;

    questions.forEach((question, index) => {
      db.query('SELECT * FROM options WHERE question_id = ?', [question.id], (err, options) => {
        if (err) {
          console.error('Error fetching options:', err);
          return res.status(500).send('Internal Server Error');
        }

        // Shuffle options if shuffle_options is 1
        if (question.shuffle_answers === 1) {
          options = options.sort(() => Math.random() - 0.5);
        }

        console.log(`Question ${index + 1}:`, question);
        console.log(`Options before sending response:`, options);

        questionsWithOptions.push({ ...question, options });

        completedQueries++;
        if (completedQueries === questions.length) {
          console.log("Final response before sending:", questionsWithOptions);
          res.json(questionsWithOptions);
        }
      });
    });
  });
});
// Create a new survey
app.post('/create-survey', verifyToken, (req, res) => {
  const { survey_title, user_email } = req.body;
  const survey_id = require('uuid').v4();

  db.query(
    'INSERT INTO surveys (id, user_email, survey_title) VALUES (?, ?, ?)',
    [survey_id, user_email, survey_title],
    (err) => {
      if (err) {
        console.error('Error creating survey:', err);
        return res.status(500).json({ success: false, message: 'Failed to create survey' });
      }
      res.json({ success: true, survey_id });
    }
  );
});

// Add this to your backend code
app.post('/track-submission', verifyToken, (req, res) => {
  const { survey_title, student_email } = req.body;

  // Check if submission exists
  const checkQuery = `SELECT * FROM survey_submissions WHERE survey_title = ? AND student_email = ?`;
  db.query(checkQuery, [survey_title, student_email], (err, results) => {
    if (err) {
      console.error("Error checking submission:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }

    if (results.length > 0) {
      // Update existing submission count
      const updateQuery = `UPDATE survey_submissions SET submission_count = submission_count + 1 WHERE survey_title = ? AND student_email = ?`;
      db.query(updateQuery, [survey_title, student_email], (err) => {
        if (err) {
          console.error("Error updating submission:", err);
          return res.status(500).json({ error: "Database error", details: err.message });
        }
        res.json({ success: true });
      });
    } else {
      // Create new submission record
      const insertQuery = `INSERT INTO survey_submissions (survey_title, student_email, submission_count) VALUES (?, ?, 1)`;
      db.query(insertQuery, [survey_title, student_email], (err) => {
        if (err) {
          console.error("Error creating submission:", err);
          return res.status(500).json({ error: "Database error", details: err.message });
        }
        res.json({ success: true });
      });
    }
  });
});

// Add this to get submission count
app.get('/submission-count', verifyToken, (req, res) => {
  const { survey_title, student_email } = req.query;

  const query = `SELECT submission_count FROM survey_submissions WHERE survey_title = ? AND student_email = ?`;
  db.query(query, [survey_title, student_email], (err, results) => {
    if (err) {
      console.error("Error fetching submission count:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }

    const count = results.length > 0 ? results[0].submission_count : 0;
    res.json({ count });
  });
});

// Modify the save-response endpoint to handle updates
app.post('/save-response', verifyToken, (req, res) => {
  const { survey_id, question_text, response_text, selected_option, student_email, survey_title } = req.body;

  // First check if response exists
  const checkQuery = `SELECT * FROM survey_responses 
    WHERE survey_id = ? AND question_text = ? AND student_email = ? AND survey_title = ?`;
  
  db.query(checkQuery, [survey_id, question_text, student_email, survey_title], (err, results) => {
    if (err) {
      console.error("Error checking response:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }

    if (results.length > 0) {
      // Update existing response
      const updateQuery = `UPDATE survey_responses 
        SET response_text = ?, selected_option = ?, updated_at = NOW() 
        WHERE survey_id = ? AND question_text = ? AND student_email = ? AND survey_title = ?`;
      
      db.query(updateQuery, [
        response_text, 
        selected_option, 
        survey_id, 
        question_text, 
        student_email,
        survey_title
      ], (err) => {
        if (err) {
          console.error("Error updating response:", err);
          return res.status(500).json({ error: "Database error", details: err.message });
        }
        res.json({ success: true });
      });
    } else {
      // Insert new response
      const insertQuery = `INSERT INTO survey_responses 
        (survey_id, question_text, response_text, selected_option, student_email, survey_title) 
        VALUES (?, ?, ?, ?, ?, ?)`;
      
      db.query(insertQuery, [
        survey_id, 
        question_text, 
        response_text, 
        selected_option, 
        student_email,
        survey_title
      ], (err) => {
        if (err) {
          console.error("Error saving response:", err);
          return res.status(500).json({ error: "Database error", details: err.message });
        }
        res.json({ success: true });
      });
    }
  });
});




// Add this to your backend code (server.js)


// Notification endpoint
// app.post('/notify-students',verifyToken, async (req, res) => {
//   try {
//     const { survey_id, student_emails } = req.body;
//     const token = req.headers.authorization;

//     // Verify token
//     jwt.verify(token.split(' ')[1], 'your-secret-key');

//     // Here you would implement your notification logic
//     // This could be sending emails, in-app notifications, etc.
    
//     // For now, we'll just return a success message
//     res.json({ 
      
//       message: `Notifications sent to ${student_emails.length} students successfully` 
//     });

//   } catch (error) {
//     console.error('Error notifying students:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });
app.post('/notify-students', verifyToken, (req, res) => {
  const { survey_title, student_emails, start_date, end_date } = req.body;
  const staff_email = req.user.email;

  if (!survey_title || !student_emails || !Array.isArray(student_emails)) {
    return res.status(400).json({ error: 'Invalid request data' });
  }

  db.query(
    'SELECT 1 FROM permissions WHERE survey_title = ? AND staff_email = ?',
    [survey_title, staff_email],
    (err, results) => {
      if (err) {
        console.error('Error verifying survey ownership:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(403).json({ error: 'Survey not found or unauthorized' });
      }

      let processed = 0;
      const total = student_emails.length;
      const errors = [];
      const successes = [];

      student_emails.forEach(email => {
        // First check if record exists
        db.query(
          'SELECT id FROM survey_students WHERE survey_title = ? AND student_email = ?',
          [survey_title, email],
          (err, results) => {
            if (err) {
              errors.push(`Error checking for student ${email}: ${err.message}`);
              return checkComplete();
            }

            const operation = results.length > 0 ? 'UPDATE' : 'INSERT';

            const query = results.length > 0 
              ? 'UPDATE survey_students SET mark_read=0, deleted=0, staff_notified=1, created_at=NOW() WHERE id=?'
              : 'INSERT INTO survey_students (survey_title, student_email, start_date, end_date, staff_notified) VALUES (?, ?, ?, ?, 1)';

            const params = results.length > 0 
              ? [results[0].id] 
              : [survey_title, email, start_date, end_date];

            db.query(query, params, (err) => {
              if (err) {
                errors.push(`Error ${operation.toLowerCase()}ing record for ${email}: ${err.message}`);
                return checkComplete();
              }

              // Create notification for the student
              db.query(
                `INSERT INTO notifications 
                (survey_title, student_email, start_date, end_date, staff_notified, created_at) 
                VALUES (?, ?, ?, ?, 1, NOW()) 
                ON DUPLICATE KEY UPDATE staff_notified=1, mark_read=0, deleted=0, created_at=NOW()`,
                [survey_title, email, start_date, end_date],
                (err) => {
                  if (err) {
                    errors.push(`Error creating notification for ${email}: ${err.message}`);
                  } else {
                    successes.push(email);
                  }
                  checkComplete();
                }
              );
            });
          }
        );
      });

      function checkComplete() {
        processed++;
        if (processed === total) {
          if (errors.length > 0) {
            res.status(207).json({
              message: 'Completed with some errors',
              successCount: successes.length,
              errorCount: errors.length,
              errors: errors
            });
          } else {
            res.status(200).json({
              message: `All ${total} notifications processed successfully`
            });
          }
        }
      }
    }
  );
});
app.get('/get-pending-responses/:surveyTitle', verifyToken, (req, res) => {
  const { surveyTitle } = req.params;
  const staffEmail = req.user.email;

  // Get survey details
  const surveyQuery = 'SELECT survey_title, assigned_roles FROM permissions WHERE survey_title = ? AND staff_email = ?';
  db.query(surveyQuery, [surveyTitle, staffEmail], (surveyErr, surveyResults) => {
    if (surveyErr) {
      console.error('Database error:', surveyErr);
      return res.status(500).json({ error: 'Database error' });
    }

    if (surveyResults.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const survey = surveyResults[0];
    let totalStudents = 0;
    let completedStudents = 0;
    let pendingStudents = []; // Initialize as empty array

    const handlePendingResults = () => {
      res.json({
        totalStudents,
        completedStudents,
        pendingStudents: pendingStudents, // Always return an array
        surveyTitle: survey.survey_title
      });
    };
    if (survey.assigned_roles.startsWith('Year:')) {
      const year = survey.assigned_roles.replace('Year:', '');
      
      // Get total students in year
      const totalQuery = 'SELECT COUNT(*) as count FROM studentdetails WHERE Year = ?';
      db.query(totalQuery, [year], (totalErr, totalResult) => {
        if (totalErr) {
          console.error('Database error:', totalErr);
          return res.status(500).json({ error: 'Database error' });
        }
        totalStudents = totalResult[0].count;

        // Get completed students
        const completedQuery = `
          SELECT COUNT(DISTINCT student_email) as count 
          FROM survey_submissions 
          WHERE survey_title = ?
        `;
        db.query(completedQuery, [survey.survey_title], (completedErr, completedResult) => {
          if (completedErr) {
            console.error('Database error:', completedErr);
            return res.status(500).json({ error: 'Database error' });
          }
          completedStudents = completedResult[0].count;

          // Get pending students
          const pendingQuery = `
            SELECT s.Name as student_name, s.Rollno as student_rollno, s.Email as student_email
            FROM studentdetails s
            WHERE s.Year = ? 
            AND s.Email NOT IN (
              SELECT student_email 
              FROM survey_submissions 
              WHERE survey_title = ?
            )
          `;
          db.query(pendingQuery, [year, survey.survey_title], (pendingErr, pendingResult) => {
            if (pendingErr) {
              console.error('Database error:', pendingErr);
              return res.status(500).json({ error: 'Database error' });
            }
            pendingStudents = pendingResult;
            handlePendingResults();
          });
        });
      });

    } else if (survey.assigned_roles.startsWith('Department:')) {
      const department = survey.assigned_roles.replace('Department:', '');
      
      // Get total students in department
      const totalQuery = 'SELECT COUNT(*) as count FROM studentdetails WHERE Department = ?';
      db.query(totalQuery, [department], (totalErr, totalResult) => {
        if (totalErr) {
          console.error('Database error:', totalErr);
          return res.status(500).json({ error: 'Database error' });
        }
        totalStudents = totalResult[0].count;

        // Get completed students
        const completedQuery = `
          SELECT COUNT(DISTINCT student_email) as count 
          FROM survey_submissions 
          WHERE survey_title = ?
        `;
        db.query(completedQuery, [survey.survey_title], (completedErr, completedResult) => {
          if (completedErr) {
            console.error('Database error:', completedErr);
            return res.status(500).json({ error: 'Database error' });
          }
          completedStudents = completedResult[0].count;

          // Get pending students
          const pendingQuery = `
            SELECT s.Name as student_name, s.Rollno as student_rollno, s.Email as student_email
            FROM studentdetails s
            WHERE s.Department = ? 
            AND s.Email NOT IN (
              SELECT student_email 
              FROM survey_submissions 
              WHERE survey_title = ?
            )
          `;
          db.query(pendingQuery, [department, survey.survey_title], (pendingErr, pendingResult) => {
            if (pendingErr) {
              console.error('Database error:', pendingErr);
              return res.status(500).json({ error: 'Database error' });
            }
            pendingStudents = pendingResult;
            handlePendingResults();
          });
        });
      });

    } else {
      // Group assignment
      const groupName = survey.assigned_roles;
      
      // Get group info
      const groupQuery = `
        SELECT g.Name, g.Email, g.Year, g.Department
        FROM student_groups g
        JOIN student_groups_info i ON g.GroupID = i.GroupID
        WHERE i.GroupName = ? AND i.staffmail = ?
      `;
      db.query(groupQuery, [groupName, staffEmail], (groupErr, groupResult) => {
        if (groupErr) {
          console.error('Database error:', groupErr);
          return res.status(500).json({ error: 'Database error' });
        }
        totalStudents = groupResult.length;

        // Get completed students
        const completedQuery = `
          SELECT COUNT(DISTINCT student_email) as count 
          FROM survey_submissions 
          WHERE survey_title = ?
        `;
        db.query(completedQuery, [survey.survey_title], (completedErr, completedResult) => {
          if (completedErr) {
            console.error('Database error:', completedErr);
            return res.status(500).json({ error: 'Database error' });
          }
          completedStudents = completedResult[0].count;

          // Get pending students
          const pendingQuery = `
            SELECT g.Name as student_name, g.Email as student_email, '' as student_rollno
            FROM student_groups g
            JOIN student_groups_info i ON g.GroupID = i.GroupID
            WHERE i.GroupName = ? AND i.staffmail = ?
            AND g.Email NOT IN (
              SELECT student_email 
              FROM survey_submissions 
              WHERE survey_title = ?
            )
          `;
          db.query(pendingQuery, [groupName, staffEmail, survey.survey_title], (pendingErr, pendingResult) => {
            if (pendingErr) {
              console.error('Database error:', pendingErr);
              return res.status(500).json({ error: 'Database error' });
            }
            pendingStudents = pendingResult;
            handlePendingResults();
          });
        });
      });
    }
  });
});
app.get("/get-survey-responses/:surveyTitle", verifyToken, (req, res) => {
  const { surveyTitle } = req.params;
  const staffEmail = req.user.email;

  const permissionQuery = "SELECT assigned_roles FROM permissions WHERE survey_title = ?";

  db.query(permissionQuery, [surveyTitle], (err, permissionResults) => {
    if (err) return res.status(500).json({ error: "Database error", details: err.message });

    if (!permissionResults || permissionResults.length === 0) {
      return res.status(404).json({ error: "Survey not found or not authorized" });
    }

    const assignToRoles = permissionResults[0].assigned_roles;
    let baseQuery, baseParams;

    if (assignToRoles.startsWith("Year:")) {
      baseQuery = "SELECT Name, Rollno, Email, Year, Department FROM studentdetails WHERE Year = ?";
      baseParams = [assignToRoles.replace("Year:", "").trim()];
    } else if (assignToRoles.startsWith("Department:")) {
      baseQuery = "SELECT Name, Rollno, Email, Year, Department FROM studentdetails WHERE Department = ?";
      baseParams = [assignToRoles.replace("Department:", "").trim()];
    } else {
      baseQuery = `
        SELECT sg.Name, sg.Rollno, sg.Email, sg.Year, sg.Department 
        FROM student_groups sg
        JOIN student_groups_info sgi ON sg.GroupID = sgi.GroupID
        WHERE sgi.GroupName = ? AND sgi.staffmail = ?
      `;
      baseParams = [assignToRoles, staffEmail];
    }

    db.query(baseQuery, baseParams, (err, allStudents) => {
      if (err) return res.status(500).json({ error: "Database error", details: err.message });

      const completedQuery = "SELECT DISTINCT student_email FROM survey_responses WHERE survey_title = ?";
      db.query(completedQuery, [surveyTitle], (err, completedResults) => {
        if (err) return res.status(500).json({ error: "Database error", details: err.message });

        const completedEmails = new Set(completedResults.map((s) => s.student_email));

        res.json({
          totalStudents: allStudents.length,
          completedCount: completedEmails.size,
          pendingCount: allStudents.length - completedEmails.size,
          students: allStudents.map((s) => ({
            name: s.Name,
            rollno: s.Rollno, // Added Roll No field
            email: s.Email,
            year: s.Year,
            department: s.Department,
            role: "Student",
            status: completedEmails.has(s.Email) ? "completed" : "pending",
          })),
          assignToRoles,
        });
      });
    });
  });
});
// app.get('/get-mentee-surveys', verifyToken, async (req, res) => {
//   try {
//     const mentorEmail = req.user.email;
//     const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
//     // First, get all mentees of this mentor
//     const menteesQuery = `
//       SELECT mentee_email 
//       FROM mentor_mentee 
//       WHERE mentor_email = ?
//     `;
    
//     const mentees = await new Promise((resolve, reject) => {
//       db.query(menteesQuery, [mentorEmail], (err, results) => {
//         if (err) reject(err);
//         else resolve(results.map(m => m.mentee_email));
//       });
//     });
    
//     if (mentees.length === 0) {
//       return res.json({ live: [], completed: [] });
//     }
    
//     // Get surveys assigned to these mentees (either directly or via year/department/group)
//     const surveysQuery = `
//       SELECT DISTINCT 
//         p.*,
//         CASE
//           WHEN p.end_date < ? THEN 'completed'
//           ELSE 'live'
//         END AS status
//       FROM permissions p
//       WHERE 
//         -- Surveys assigned directly to mentees via year
//         (p.assigned_roles LIKE 'Year:%' AND EXISTS (
//           SELECT 1 FROM studentdetails s 
//           WHERE s.Year = REPLACE(p.assigned_roles, 'Year:', '') 
//           AND s.Email IN (?)
//         ))
//         OR
//         -- Surveys assigned directly to mentees via department
//         (p.assigned_roles LIKE 'Department:%' AND EXISTS (
//           SELECT 1 FROM studentdetails s 
//           WHERE s.Department = REPLACE(p.assigned_roles, 'Department:', '') 
//           AND s.Email IN (?)
//         ))
//         OR
//         -- Surveys assigned to groups that include mentees
//         (NOT p.assigned_roles LIKE 'Year:%' 
//          AND NOT p.assigned_roles LIKE 'Department:%'
//          AND EXISTS (
//           SELECT 1 FROM student_groups sg
//           JOIN student_groups_info sgi ON sg.GroupID = sgi.GroupID
//           WHERE sgi.GroupName = p.assigned_roles
//           AND sg.Email IN (?)
//         ))
//       ORDER BY p.end_date DESC
//     `;
    
//     const allSurveys = await new Promise((resolve, reject) => {
//       db.query(surveysQuery, [currentDate, mentees, mentees, mentees], (err, results) => {
//         if (err) reject(err);
//         else resolve(results);
//       });
//     });
    
//     // Separate into live and completed surveys
//     const response = {
//       live: allSurveys.filter(s => s.status === 'live'),
//       completed: allSurveys.filter(s => s.status === 'completed')
//     };
    
//     res.json(response);
//   } catch (error) {
//     console.error('Error fetching mentee surveys:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

app.get('/get-mentee-surveys', verifyToken, async (req, res) => {
  try {
    const mentorEmail = req.user.email;
    const currentDateTime = new Date(); // Current date and time
    
    // First, get all mentees of this mentor
    const menteesQuery = `
      SELECT mentee_email 
      FROM mentor_mentee 
      WHERE mentor_email = ?
    `;
    
    const mentees = await new Promise((resolve, reject) => {
      db.query(menteesQuery, [mentorEmail], (err, results) => {
        if (err) reject(err);
        else resolve(results.map(m => m.mentee_email));
      });
    });
    
    if (mentees.length === 0) {
      return res.json({ live: [], completed: [] });
    }
    
    // Get all surveys assigned to these mentees
    const surveysQuery = `
      SELECT DISTINCT 
        p.*
      FROM permissions p
      WHERE 
        -- Surveys assigned directly to mentees via year
        (p.assigned_roles LIKE 'Year:%' AND EXISTS (
          SELECT 1 FROM studentdetails s 
          WHERE s.Year = REPLACE(p.assigned_roles, 'Year:', '') 
          AND s.Email IN (?)
        ))
        OR
        -- Surveys assigned directly to mentees via department
        (p.assigned_roles LIKE 'Department:%' AND EXISTS (
          SELECT 1 FROM studentdetails s 
          WHERE s.Department = REPLACE(p.assigned_roles, 'Department:', '') 
          AND s.Email IN (?)
        ))
        OR
        -- Surveys assigned to groups that include mentees
        (NOT p.assigned_roles LIKE 'Year:%' 
         AND NOT p.assigned_roles LIKE 'Department:%'
         AND EXISTS (
          SELECT 1 FROM student_groups sg
          JOIN student_groups_info sgi ON sg.GroupID = sgi.GroupID
          WHERE sgi.GroupName = p.assigned_roles
          AND sg.Email IN (?)
        ))
      ORDER BY p.end_date DESC, p.end_time DESC
    `;
    
    const allSurveys = await new Promise((resolve, reject) => {
      db.query(surveysQuery, [mentees, mentees, mentees], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    // Categorize surveys considering both date and time
    const response = {
      live: [],
      completed: []
    };
    
    allSurveys.forEach(survey => {
      const startDate = new Date(survey.start_date);
      const endDate = new Date(survey.end_date);
      
      // Combine date with time for accurate comparison
      const startDateTime = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
        parseInt(survey.start_time.split(':')[0]),
        parseInt(survey.start_time.split(':')[1]),
        parseInt(survey.start_time.split(':')[2] || 0)
      );
      
      const endDateTime = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate(),
        parseInt(survey.end_time.split(':')[0]),
        parseInt(survey.end_time.split(':')[1]),
        parseInt(survey.end_time.split(':')[2] || 0)
      );
      
      if (currentDateTime >= startDateTime && currentDateTime <= endDateTime) {
        response.live.push(survey);
      } else {
        response.completed.push(survey);
      }
    });
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching mentee surveys:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/get-survey-permissions', verifyToken, (req, res) => {
  const { survey_title } = req.query;
  
  const query = `
    SELECT assigned_roles 
    FROM permissions 
    WHERE survey_title = ?
  `;

  db.query(query, [survey_title], (err, results) => {
    if (err) {
      console.error("Error fetching survey permissions:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }
    res.json(results);
  });
});

// New endpoint to get students by year/department
app.get('/get-students-by-criteria', verifyToken, (req, res) => {
  const { year, department } = req.query;
  let query = 'SELECT Email FROM studentdetails WHERE 1=1';
  const params = [];

  if (year) {
    query += ' AND Year = ?';
    params.push(year);
  }
  if (department) {
    query += ' AND Department = ?';
    params.push(department);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error fetching students by criteria:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }
    res.json(results);
  });
});

// New endpoint to get group info by name
app.get('/get-group-info', verifyToken, (req, res) => {
  const { groupName } = req.query;
  
  const query = `
    SELECT GroupID 
    FROM student_groups_info 
    WHERE GroupName = ?
  `;

  db.query(query, [groupName], (err, results) => {
    if (err) {
      console.error("Error fetching group info:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }
    res.json(results);
  });
});

// New endpoint to get group students
app.get('/get-group-students', verifyToken, (req, res) => {
  const { groupId } = req.query;
  
  const query = `
    SELECT Email 
    FROM student_groups 
    WHERE GroupID = ?
  `;

  db.query(query, [groupId], (err, results) => {
    if (err) {
      console.error("Error fetching group students:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }
    res.json(results);
  });
});
app.post('/insert-survey-students', (req, res) => {
  try {
    const { survey_title, start_date, end_date, students } = req.body;
    
    if (!survey_title || !students || !Array.isArray(students)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    // Prepare values for bulk insert
    const values = students.map(email => [
      survey_title,
      email,
      start_date || null,  // Use null if dates are not provided
      end_date || null
    ]);

    // Using INSERT IGNORE to avoid duplicate errors
    db.query(
      `INSERT IGNORE INTO survey_students 
      (survey_title, student_email, start_date, end_date) 
      VALUES ?`,
      [values],
      (err, result) => {
        if (err) {
          console.error('Error inserting survey students:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
        
        res.status(200).json({ 
          message: 'Survey students inserted successfully', 
          affectedRows: result.affectedRows 
        });
      }
    );
  } catch (error) {
    console.error('Error in insert-survey-students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add these endpoints to your existing backend code

// Get unread notifications for student
app.get("/get-notifications", verifyToken, (req, res) => {
  const studentEmail = req.user.email;
  const query = `
    SELECT 
      id, 
      survey_title, 
      start_date, 
      end_date, 
      mark_read,
      DATE(end_date) = CURDATE() as is_last_day
    FROM survey_students
    WHERE student_email = ? AND deleted!=1
    ORDER BY created_at DESC
  `;

  db.query(query, [studentEmail], (err, results) => {
    if (err) {
      console.error("Error fetching notifications:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }
    res.json(results);
  });
});
// Mark notification as read
// Update this endpoint in server.js
app.post("/mark-notification-read", verifyToken, (req, res) => {
  const { notificationId } = req.body;
  const studentEmail = req.user.email;

  // Toggle between read and unread
  const query = `
    UPDATE survey_students 
    SET mark_read = CASE WHEN mark_read = 1 THEN 0 ELSE 1 END
    WHERE id = ? AND student_email = ?
  `;

  db.query(query, [notificationId, studentEmail], (err, result) => {
    if (err) {
      console.error("Error marking notification as read:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }
    res.json({ success: true });
  });
});

// Get notification count
app.get("/notification-count", verifyToken, (req, res) => {
  const studentEmail = req.user.email;

  const query = `
    SELECT COUNT(*) as count 
    FROM survey_students 
    WHERE student_email = ? AND (mark_read IS NULL OR mark_read = 0)
  `;

  db.query(query, [studentEmail], (err, results) => {
    if (err) {
      console.error("Error fetching notification count:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }
    res.json({ count: results[0].count });
  });
});
// Add this to server.js
// Update this endpoint in server.js
app.put("/delete-notification", verifyToken, (req, res) => {
  const { notificationId } = req.body;
  const studentEmail = req.user.email;

  const query = `
    UPDATE survey_students 
    SET deleted = 1
    WHERE id = ? AND student_email = ?
  `;

  db.query(query, [notificationId, studentEmail], (err, result) => {
    if (err) {
      console.error("Error marking notification as deleted:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }
    res.json({ success: true });
  });
});

app.get('/get-pending-mentees', verifyToken, (req, res) => {
  const surveyTitle = req.query.survey_title;
  const mentorEmail = req.user.email;

  db.query(
    'SELECT assigned_roles FROM permissions WHERE survey_title = ?',
    [surveyTitle],
    (err, roleResult) => {
      if (err) return res.status(500).json({ error: 'Error fetching survey data' });
      if (roleResult.length === 0) return res.status(404).json({ error: 'Survey not found' });

      const assignedRole = roleResult[0].assigned_roles;
      let studentQuery = '';
      let queryParams = [];

      if (assignedRole.startsWith('Year:')) {
        const year = assignedRole.split(':')[1];
        studentQuery = 'SELECT Email AS student_email FROM student_groups WHERE Year = ?';
        queryParams = [year];
      } 
      else if (assignedRole.startsWith('Department:')) {
        const department = assignedRole.split(':')[1];
        studentQuery = 'SELECT Email AS student_email FROM student_groups WHERE Department = ?';
        queryParams = [department];
      } 
      else {
        studentQuery = `SELECT sg.Email AS student_email 
          FROM student_groups sg
          JOIN student_groups_info sgi ON sg.GroupID = sgi.GroupID
          WHERE sgi.GroupName = ? AND sgi.staffmail = ?`;
        queryParams = [assignedRole, mentorEmail];
      }

      db.query(studentQuery, queryParams, (err, surveyResults) => {
        if (err) return res.status(500).json({ error: 'Error fetching assigned students' });

        // Modified query to get student details
        db.query(
          `SELECT s.Name, s.Email 
          FROM mentor_mentee m 
          JOIN studentdetails s ON m.mentee_email = s.Email 
          WHERE m.mentor_email = ?`,
          [mentorEmail],
          (err, menteeResults) => {
            if (err) return res.status(500).json({ error: 'Error fetching mentor mentees' });

            const assignedMentees = menteeResults.filter(mentee =>
              surveyResults.some(s => 
                s.student_email.toLowerCase() === mentee.Email.toLowerCase()
              )
            );

            db.query(
              'SELECT student_email FROM survey_submissions WHERE survey_title = ?',
              [surveyTitle],
              (err, submissionResults) => {
                if (err) return res.status(500).json({ error: 'Error fetching submissions' });

                const submittedEmails = submissionResults.map(s => s.student_email.toLowerCase());
                const pendingMentees = assignedMentees.filter(mentee => 
                  !submittedEmails.includes(mentee.Email.toLowerCase())
                );

                const responseData = {
                  total: assignedMentees.length,
                  pending: pendingMentees.length,
                  mentees: pendingMentees.map(mentee => ({
                    name: mentee.Name,
                    email: mentee.Email,
                    id: mentee.Email.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, '')
                  }))
                };

                res.json(responseData);
              }
            );
          }
        );
      });
    }
  );
});
// Get survey completion status
app.get('/get-survey-completion', verifyToken, (req, res) => {
  const { survey_title } = req.query;
  const mentor_email = req.user.email; // Get mentor email from token

  // First get the assigned roles for the survey
  db.query(
    'SELECT assigned_roles FROM permissions WHERE survey_title = ?',
    [survey_title],
    (rolesError, rolesQuery) => {
      if (rolesError) {
        console.error('Error fetching survey roles:', rolesError);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (rolesQuery.length === 0) {
        return res.status(404).json({ error: 'Survey not found' });
      }

      const assigned_roles = rolesQuery[0].assigned_roles;
      let studentEmails = [];

      // Check if assignment is by year/department or group
      if (assigned_roles.includes('Year:') || assigned_roles.includes('Department:')) {
        // Year or Department based assignment
        let filterField, filterValue;
        
        if (assigned_roles.includes('Year:')) {
          filterField = 'year';
          filterValue = assigned_roles.replace('Year:', '').trim();
        } else {
          filterField = 'department';
          filterValue = assigned_roles.replace('Department:', '').trim();
        }

        // Get mentor's mentees in this year/department
        db.query(
          `SELECT sd.email, sd.name, sd.rollno 
           FROM studentdetails sd
           JOIN mentor_mentee mm ON sd.email = mm.mentee_email
           WHERE mm.mentor_email = ? AND sd.${filterField} = ?`,
          [mentor_email, filterValue],
          (menteesError, menteesQuery) => {
            if (menteesError) {
              console.error('Error fetching mentees:', menteesError);
              return res.status(500).json({ error: 'Internal server error' });
            }

            studentEmails = menteesQuery;
            processStudentEmails();
          }
        );
      } else {
        // Group based assignment
        db.query(
          `SELECT sg.Email, sd.name, sd.rollno 
           FROM student_groups sg
           JOIN studentdetails sd ON sg.Email = sd.email
           WHERE sg.Name = ?`,
          [assigned_roles],
          (groupError, groupQuery) => {
            if (groupError) {
              console.error('Error fetching group:', groupError);
              return res.status(500).json({ error: 'Internal server error' });
            }

            studentEmails = groupQuery;
            processStudentEmails();
          }
        );
      }

      function processStudentEmails() {
        // Get completed submissions for this survey
        db.query(
          `SELECT student_email FROM survey_submissions 
           WHERE survey_title = ?`,
          [survey_title],
          (completedError, completedQuery) => {
            if (completedError) {
              console.error('Error fetching completed submissions:', completedError);
              return res.status(500).json({ error: 'Internal server error' });
            }

            const completedEmails = completedQuery.map(row => row.student_email);

            // Separate completed and not completed students
            const completedStudents = studentEmails
              .filter(student => completedEmails.includes(student.email))
              .map(student => ({
                name: student.name,
                roll_no: student.rollno,
                role: 'Student',
                email: student.email
              }));

            const notCompletedStudents = studentEmails
              .filter(student => !completedEmails.includes(student.email))
              .map(student => ({
                name: student.name,
                roll_no: student.rollno,
                role: 'Student',
                email: student.email
              }));

            res.json({
              assigned_to: assigned_roles,
              total: studentEmails.length,
              completed: completedStudents.length,
              not_completed: notCompletedStudents.length,
              completed_students: completedStudents || [],
              not_completed_students: notCompletedStudents || []
            });
          }
        );
      }
    }
  );
});
// Add this to your existing routes
app.get('/get-survey-statistics/:surveyTitle', verifyToken, (req, res) => {
  const { surveyTitle } = req.params;
  
  // 1. Get all questions for this survey
  const questionsQuery = 'SELECT * FROM questions WHERE survey_name = ?';
  db.query(questionsQuery, [surveyTitle], (questionsErr, questions) => {
    if (questionsErr) {
      console.error('Error fetching questions:', questionsErr);
      return res.status(500).json({ error: 'Failed to fetch questions' });
    }
    
    if (!questions.length) {
      return res.status(404).json({ error: 'No questions found for this survey' });
    }
    
    // 2. For each question, get options and calculate response percentages
    const results = [];
    let processedQuestions = 0;
    
    if (questions.length === 0) {
      return res.json({
        survey_title: surveyTitle,
        questions: results
      });
    }
    
    questions.forEach((question, index) => {
      if (question.texts) {
        // For text questions, just add the question with no options
        results.push({
          question_text: question.question_text,
          texts: true,
          options: []
        });
        processedQuestions++;
        checkCompletion();
        return;
      }
      
      // Get options for this question
      const optionsQuery = 'SELECT * FROM options WHERE question_id = ?';
      db.query(optionsQuery, [question.id], (optionsErr, options) => {
        if (optionsErr) {
          console.error('Error fetching options:', optionsErr);
          return res.status(500).json({ error: 'Failed to fetch options' });
        }
        
        // Get total responses for this question
        const totalResponsesQuery = 'SELECT COUNT(DISTINCT student_email) as total FROM survey_responses WHERE survey_title = ? AND question_text = ?';
        db.query(totalResponsesQuery, [surveyTitle, question.question_text], (totalErr, totalRes) => {
          if (totalErr) {
            console.error('Error fetching total responses:', totalErr);
            return res.status(500).json({ error: 'Failed to fetch total responses' });
          }
          
          const total = totalRes[0].total || 1; // Avoid division by zero
          const optionsWithPercentage = [];
          
          if (options.length === 0) {
            results.push({
              question_text: question.question_text,
              texts: false,
              options: optionsWithPercentage
            });
            processedQuestions++;
            checkCompletion();
            return;
          }
          
          let processedOptions = 0;
          
          options.forEach((option, optIndex) => {
            const optionCountQuery = 'SELECT COUNT(*) as count FROM survey_responses WHERE survey_title = ? AND question_text = ? AND selected_option = ?';
            db.query(optionCountQuery, [surveyTitle, question.question_text, option.option_text], (countErr, countRes) => {
              if (countErr) {
                console.error('Error fetching option count:', countErr);
                return res.status(500).json({ error: 'Failed to fetch option count' });
              }
              
              const count = countRes[0].count;
              const percentage = Math.round((count / total) * 100);
              
              optionsWithPercentage.push({
                option_text: option.option_text,
                count,
                percentage
              });
              
              processedOptions++;
              if (processedOptions === options.length) {
                results.push({
                  question_text: question.question_text,
                  texts: false,
                  options: optionsWithPercentage
                });
                processedQuestions++;
                checkCompletion();
              }
            });
          });
        });
      });
    });
    
    function checkCompletion() {
      if (processedQuestions === questions.length) {
        res.json({
          survey_title: surveyTitle,
          questions: results
        });
      }
    }
  });
});
// Add this new endpoint to your existing backend code

// Add this to your backend routes
// Add this to your backend routes
app.get('/get-menteesurvey-statistics/:surveyTitle', verifyToken, (req, res) => {
  const { surveyTitle } = req.params;
  
  // First validate the surveyTitle
  if (!surveyTitle || typeof surveyTitle !== 'string') {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid survey title' 
    });
  }

  // Get all questions for this survey
  db.query(
    `SELECT id, question_text, texts FROM questions WHERE survey_name = ?`,
    [surveyTitle],
    (err, questionResults) => {
      if (err) {
        console.error('Error fetching questions:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Error fetching questions',
          error: err.message 
        });
      }

      if (!questionResults || questionResults.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'No questions found for this survey' 
        });
      }

      // Get all completed responses for this survey
      db.query(
        `SELECT student_email FROM survey_responses 
         WHERE survey_title = ? 
         GROUP BY student_email`,
        [surveyTitle],
        (err, responseResults) => {
          if (err) {
            console.error('Error fetching responses:', err);
            return res.status(500).json({ 
              success: false, 
              message: 'Error fetching responses',
              error: err.message 
            });
          }

          const totalCompleted = responseResults.length;
          const results = [];
          let processedQuestions = 0;

          // Process each question
          questionResults.forEach((question, index) => {
            if (question.texts) {
              results[index] = {
                question_text: question.question_text,
                texts: true
              };
              processedQuestions++;
              checkCompletion();
              return;
            }

            // Get options for this question
            db.query(
              `SELECT id, option_text FROM options WHERE question_id = ?`,
              [question.id],
              (err, optionResults) => {
                if (err) {
                  console.error('Error fetching options:', err);
                  return res.status(500).json({ 
                    success: false, 
                    message: 'Error fetching options',
                    error: err.message 
                  });
                }

                const optionsWithStats = [];
                let processedOptions = 0;

                // Process each option
                optionResults.forEach((option, optIndex) => {
                  db.query(
                    `SELECT COUNT(*) as count FROM survey_responses 
                     WHERE survey_title = ? 
                     AND question_text = ? 
                     AND selected_option = ?`,
                    [surveyTitle, question.question_text, option.option_text],
                    (err, countResponse) => {
                      if (err) {
                        console.error('Error counting responses:', err);
                        return res.status(500).json({ 
                          success: false, 
                          message: 'Error counting responses',
                          error: err.message 
                        });
                      }

                      const count = countResponse[0].count;
                      const percentage = totalCompleted > 0 ? Math.round((count / totalCompleted) * 100) : 0;
                      
                      optionsWithStats[optIndex] = {
                        option_text: option.option_text,
                        count: count,
                        percentage: percentage
                      };

                      processedOptions++;
                      if (processedOptions === optionResults.length) {
                        results[index] = {
                          question_text: question.question_text,
                          texts: false,
                          options: optionsWithStats
                        };
                        processedQuestions++;
                        checkCompletion();
                      }
                    }
                  );
                });
              }
            );
          });

          function checkCompletion() {
            if (processedQuestions === questionResults.length) {
              res.json({
                success: true,
                questions: results,
                totalCompleted: totalCompleted
              });
            }
          }
        }
      );
    }
  );
});
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
