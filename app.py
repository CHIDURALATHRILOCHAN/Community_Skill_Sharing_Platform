from flask import Flask, render_template, request, redirect, url_for, session, g, flash
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'your_secret_key'
app.database = "instance/community_skill_sharing.db"

def connect_db():
    return sqlite3.connect(app.database)

@app.before_request
def before_request():
    g.db = connect_db()

@app.teardown_request
def teardown_request(exception):
    if hasattr(g, 'db'):
        g.db.close()

@app.route('/')
def index():
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        cursor = g.db.execute('SELECT id, username, password FROM users WHERE username = ?', (username,))
        user = cursor.fetchone()
        if user and check_password_hash(user[2], password):
            session['user_id'] = user[0]
            flash('Login successful!', 'success')
            return redirect(url_for('home'))
        else:
            flash('Invalid credentials. Please try again.', 'error')
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = generate_password_hash(request.form['password'])

        # Check if username already exists
        existing_user = g.db.execute('SELECT id FROM users WHERE username = ?', (username,)).fetchone()
        if existing_user:
            flash('Username already exists. Please choose a different one.', 'error')
            return render_template('register.html')

        try:
            g.db.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, password))
            g.db.commit()
            flash('Registration successful! Please log in.', 'success')
            return redirect(url_for('login'))
        except sqlite3.IntegrityError:
            flash('An error occurred while creating your account. Please try again later.', 'error')
    return render_template('register.html')

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    flash('You have been logged out.', 'info')
    return redirect(url_for('index'))

@app.route('/home')
def home():
    if 'user_id' in session:
        return render_template('home.html')
    return redirect(url_for('login'))

@app.route('/skill_search', methods=['GET', 'POST'])
def skill_search():
    if 'user_id' in session:
        if request.method == 'POST':
            skill_name = request.form['skill_name']
            cursor = g.db.execute('SELECT username, skill_name, experience_years, description, contact_info FROM skills JOIN users ON skills.user_id = users.id WHERE skill_name LIKE ?', ('%' + skill_name + '%',))
            skills = cursor.fetchall()

            # Create a set to keep track of seen (username, skill_name) pairs
            seen = set()
            unique_skills = []
            for skill in skills:
                user_skill_pair = (skill[0], skill[1])  # (username, skill_name)
                if user_skill_pair not in seen:
                    unique_skills.append(skill)
                    seen.add(user_skill_pair)

            return render_template('skill_search.html', skills=unique_skills)
        return render_template('skill_search.html', skills=[])
    return redirect(url_for('login'))


@app.route('/skill_upload', methods=['GET', 'POST'])
def skill_upload():
    if 'user_id' in session:
        if request.method == 'POST':
            skill_name = request.form['skill_name']
            experience_years = request.form['experience_years']
            description = request.form['description']
            contact_info = request.form['contact_info']

            # Prevent duplicate form submission by checking if the skill already exists
            existing_skill = g.db.execute('SELECT id FROM skills WHERE user_id = ? AND skill_name = ? AND description = ?', 
                                          (session['user_id'], skill_name, description)).fetchone()
            if existing_skill:
                flash('Skill already exists in your profile.', 'error')
                return render_template('skill_upload.html')

            try:
                g.db.execute('INSERT INTO skills (user_id, skill_name, experience_years, description, contact_info) VALUES (?, ?, ?, ?, ?)',
                             (session['user_id'], skill_name, experience_years, description, contact_info))
                g.db.commit()
                flash('Skill uploaded successfully!', 'success')
                return redirect(url_for('home'))
            except sqlite3.OperationalError as e:
                flash(f"Database error: {e}", 'error')
        return render_template('skill_upload.html')
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)
