const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Server!');
});
// Middleware
router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.json());


/*
quiz_id INT AUTO_INCREMENT,
quiz_name VARCHAR(50)  NOT NULL,
quiz_difficulty TINYINT NOT NULL,
quiz_image TINYINT NOT NULL,
category_id INT NOT NULL,
 */

/*
user_id INT,
quiz_id INT,
progress_value DECIMAL(4,0)   NOT NULL,
 */

router.post("/add", async (req, res) => {
    const {quiz_name, quiz_difficulty, quiz_image, category_id} = req.body
    const response = await connection.promise().query('INSERT INTO quiz (quiz_name, quiz_difficulty, quiz_image, category_id) VALUES (?, ?, ?, ?)', [quiz_name, quiz_difficulty, quiz_image, category_id]);
    // for each player, create a progress of 0
    const response2 = await connection.promise().query('SELECT user_id FROM users');
    const users = response2[0]
    for (let i = 0; i < users.length; i++) {
        await connection.promise().query('INSERT INTO progress (user_id, quiz_id, progress_value) VALUES (?, ?, ?)', [users[i].user_id, response[0].insertId, 0]);
    }
    return res.status(200).json(response[0])
})

router.get("/questions/:cat_id/:id_quiz", async (req, res) => {
    const {cat_id, id_quiz} = req.params
    let catnameResponse  = await connection.promise().query('SELECT category_name FROM category WHERE category_id = ?', [cat_id]);
    let catname = catnameResponse [0][0].category_name
    if(catname === "Capture The Flag"){catname="question_ctf"}
    else if(catname === "What Did You Say ?"){catname="question_wdys"}
    else if(catname === "Find The Capital"){catname="question_ftc"}

    const query = `SELECT * FROM ${catname} WHERE quiz_id = ?`;
    const response = await connection.promise().query(query, [parseInt(id_quiz)]);

    return res.status(200).json(response[0]);
})


router.get("/:id_quiz", async (req, res) => {
    const {id_quiz} = req.params
    const response = await connection.promise().query('SELECT * FROM quiz WHERE quiz_id = ?', [id_quiz]);
    return res.status(200).json(response[0][0])
})

router.get("/:id_quiz/:id_user", async (req, res) => {
    const {id_quiz, id_user} = req.params
    const response = await connection.promise().query('SELECT * FROM progress WHERE quiz_id = ? AND user_id = ?', [id_quiz, id_user]);
    return res.status(200).json(response[0][0])
})

router.get("/category/:id_category/:id_user", async (req, res) => {
    const {id_category, id_user} = req.params
    const response = await connection.promise().query('SELECT quiz.quiz_id, quiz.quiz_name, quiz.quiz_difficulty, quiz.quiz_image, progress.progress_value FROM quiz LEFT JOIN progress ON quiz.quiz_id = progress.quiz_id WHERE quiz.category_id = ? AND progress.user_id = ? ORDER BY quiz.quiz_id', [id_category, id_user]);
    return res.status(200).json(response[0])
})

router.post("/progress/reset/:id_user", async (req, res) => {
    const {id_user} = req.params
    const response = await connection.promise().query('SELECT * FROM quiz');
    const quizzes = response[0]
    for (let i = 0; i < quizzes.length; i++) {
        await connection.promise().query('UPDATE progress SET progress_value = ? WHERE quiz_id = ? AND user_id = ?', [0, quizzes[i].quiz_id, id_user]);
    }
    return res.status(200).json(response[0])
})

router.get("/progress/:quiz_id/:user_id", async (req, res) => {
    const {quiz_id, user_id} = req.params
    const response = await connection.promise().query('SELECT * FROM progress WHERE quiz_id = ? AND user_id = ?', [quiz_id, user_id]);
    return res.status(200).json(response[0][0])
})

router.post("/progress/:id_quiz/:id_user", async (req, res) => {
    const {id_quiz, id_user} = req.params
    const {progress_value} = req.body
    const response = await connection.promise().query('UPDATE progress SET progress_value = ? WHERE quiz_id = ? AND user_id = ?', [progress_value, id_quiz, id_user]);
    return res.status(200).json(response[0])
})



module.exports = router

