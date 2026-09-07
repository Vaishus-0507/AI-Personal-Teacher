import { useState } from 'react'
import './App.css'

function App() {
  const [student, setStudent] = useState({
    name: '',
    id: '',
    class: '10',
    stream: '',
    combination: '',
    math: '',
    science: '',
    english: '',
    social: '',
    hindi: '',
    physics: '',
    chemistry: '',
    biology: '',
    computerScience: '',
    tamil: '',
    economics: '',
    accountancy: '',
    businessStudies: '',
    history: '',
    geography: '',
    politicalScience: ''
  })

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const class10Subjects = [
    { key: 'math', name: 'Mathematics' },
    { key: 'science', name: 'Science' },
    { key: 'english', name: 'English' },
    { key: 'social', name: 'Social Science' },
    { key: 'hindi', name: 'Hindi' }
  ]

  const class12Subjects = {
    Science: {
      PCM: [
        { key: 'physics', name: 'Physics' },
        { key: 'chemistry', name: 'Chemistry' },
        { key: 'math', name: 'Mathematics' },
        { key: 'english', name: 'English' }
      ],
      PCB: [
        { key: 'physics', name: 'Physics' },
        { key: 'chemistry', name: 'Chemistry' },
        { key: 'biology', name: 'Biology' },
        { key: 'english', name: 'English' }
      ],
      PCMB: [
        { key: 'physics', name: 'Physics' },
        { key: 'chemistry', name: 'Chemistry' },
        { key: 'math', name: 'Mathematics' },
        { key: 'biology', name: 'Biology' },
        { key: 'english', name: 'English' }
      ]
    },

    Commerce: [
      { key: 'accountancy', name: 'Accountancy' },
      { key: 'businessStudies', name: 'Business Studies' },
      { key: 'economics', name: 'Economics' },
      { key: 'english', name: 'English' },
      { key: 'math', name: 'Mathematics' }
    ],

    Humanities: [
      { key: 'history', name: 'History' },
      { key: 'geography', name: 'Geography' },
      { key: 'politicalScience', name: 'Political Science' },
      { key: 'english', name: 'English' },
      { key: 'economics', name: 'Economics' }
    ]
  }

  function getSubjects() {
    if (student.class === '10') {
      return class10Subjects
    }

    if (student.stream === 'Science') {
      return class12Subjects.Science[student.combination] || []
    }

    if (student.stream === 'Commerce') {
      return class12Subjects.Commerce
    }

    if (student.stream === 'Humanities') {
      return class12Subjects.Humanities
    }

    return []
  }

  function handleChange(e) {
    const { name, value } = e.target

    setStudent(prev => ({
      ...prev,
      [name]: value
    }))

    if (name === 'class') {
      setStudent(prev => ({
        ...prev,
        stream: '',
        combination: ''
      }))
    }

    if (name === 'stream') {
      setStudent(prev => ({
        ...prev,
        combination: ''
      }))
    }
  }

  function handleMarkChange(e) {
    const { name, value } = e.target

    if (value === '' || (Number(value) >= 0 && Number(value) <= 100)) {
      setStudent(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  async function analyzePerformance(e) {
    e.preventDefault()

    setError('')
    setResult(null)

    if (!student.name.trim()) {
      setError('Please enter your name.')
      return
    }

    if (!student.id.trim()) {
      setError('Please enter your student ID.')
      return
    }

    if (student.class === '12' && !student.stream) {
      setError('Please select your stream.')
      return
    }

    if (
      student.class === '12' &&
      student.stream === 'Science' &&
      !student.combination
    ) {
      setError('Please select your Science combination.')
      return
    }

    const subjects = getSubjects()

    if (subjects.length === 0) {
      setError('Please select your subjects.')
      return
    }

    const missingMarks = subjects.some(
      subject =>
        student[subject.key] === '' ||
        student[subject.key] === undefined
    )

    if (missingMarks) {
      setError('Please enter marks for all subjects.')
      return
    }

    const subjectData = subjects.map(subject => ({
      subject: subject.name,
      score: Number(student[subject.key]),
      maxScore: 100
    }))

    const studentData = {
      studentId: student.id,
      studentName: student.name,
      board: 'CBSE',
      class: Number(student.class),
      term: 'Term 1',
      passMark: 33,
      subjects: subjectData
    }

    setLoading(true)

    try {
      const response = await fetch(
        'https://reasonable-became-edgar-physically.trycloudflare.com/webhook/61244675-6ae6-42aa-9228-60ba21ddf6ad',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(studentData)
        }
      )

      if (!response.ok) {
        throw new Error('Unable to connect to the learning system.')
      }

      const data = await response.json()

      setResult({
        ...data,
        submittedSubjects: subjectData
      })
    } catch (err) {
      setError(
        'Unable to connect to the personalized learning system. Please make sure n8n is running.'
      )
    } finally {
      setLoading(false)
    }
  }

  function getStatus(score) {
    if (score >= 75) return 'strong'
    if (score >= 50) return 'good'
    return 'weak'
  }

  function getStatusText(score) {
    if (score >= 75) return 'Strong'
    if (score >= 50) return 'Good'
    return 'Needs Improvement'
  }

  function getReadinessMessage(score) {
    if (score >= 80) {
      return 'Excellent exam readiness. Keep maintaining your performance.'
    }

    if (score >= 65) {
      return 'Good exam readiness. Focus on your weaker subjects.'
    }

    if (score >= 50) {
      return 'Moderate readiness. Regular practice can improve your score.'
    }

    return 'More preparation is needed. Follow the personalized study plan.'
  }

  function calculateReadiness() {
    if (!result) return 0

    const average = Number(result.overallAverage || 0)

    const weakCount = result.weakSubjects
      ? result.weakSubjects.length
      : 0

    const penalty = weakCount * 3

    return Math.max(
      0,
      Math.min(100, Math.round(average - penalty))
    )
  }

  const subjects = result?.submittedSubjects || []
  const readiness = calculateReadiness()
  const badges = []

if (result) {
  const average = Number(result.overallAverage || 0)

  if (average >= 80) {
    badges.push('🏆 High Achiever')
  }

  if (average >= 60) {
    badges.push('📈 Consistent Learner')
  }

  if (
    result.submittedSubjects &&
    result.submittedSubjects.some(
      subject => Number(subject.score) >= 90
    )
  ) {
    badges.push('⭐ Subject Champion')
  }

  if (
    result.weakSubjects &&
    result.weakSubjects.length > 0
  ) {
    badges.push('💪 Growth Mindset')
  }
}
function downloadStudyPlan() {
  if (!result || !result.studyPlanText) return

  const blob = new Blob(
    [result.studyPlanText],
    { type: 'text/plain;charset=utf-8' }
  )

  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${result.studentName}-Study-Plan.txt`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

  return (
    <div className="app">

      <header className="header">
        <h1>🎓 AI Personal Teacher</h1>
        <p>
          Personalized learning and performance analysis
          for CBSE students
        </p>
      </header>

      <main className="container">

        <section className="hero">
          <h2>Learn Smarter. Improve Faster.</h2>

          <p>
            Enter your academic performance and get a
            personalized analysis, exam readiness score,
            improvement targets and study plan.
          </p>
        </section>

        <section className="card">

          <h2>👨‍🎓 Student Performance</h2>

          <form onSubmit={analyzePerformance}>

            <div className="grid">

              <div>
                <label>Student Name</label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={student.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Student ID</label>

                <input
                  type="text"
                  name="id"
                  placeholder="Enter student ID"
                  value={student.id}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Class</label>

                <select
                  name="class"
                  value={student.class}
                  onChange={handleChange}
                >
                  <option value="10">Class 10</option>
                  <option value="12">Class 12</option>
                </select>
              </div>

              {student.class === '12' && (
                <div>
                  <label>Stream</label>

                  <select
                    name="stream"
                    value={student.stream}
                    onChange={handleChange}
                  >
                    <option value="">Select Stream</option>
                    <option value="Science">Science</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Humanities">
                      Humanities
                    </option>
                  </select>
                </div>
              )}

              {student.class === '12' &&
                student.stream === 'Science' && (
                  <div>
                    <label>Science Combination</label>

                    <select
                      name="combination"
                      value={student.combination}
                      onChange={handleChange}
                    >
                      <option value="">
                        Select Combination
                      </option>
                      <option value="PCM">PCM</option>
                      <option value="PCB">PCB</option>
                      <option value="PCMB">PCMB</option>
                    </select>
                  </div>
                )}

            </div>

            <h3>📚 Subject Marks</h3>

            <p className="helper-text">
              Enter marks out of 100 for each subject.
            </p>

            <div className="grid">

              {getSubjects().map(subject => (
                <div key={subject.key}>

                  <label>{subject.name}</label>

                  <input
                    type="number"
                    name={subject.key}
                    min="0"
                    max="100"
                    placeholder="Marks / 100"
                    value={student[subject.key]}
                    onChange={handleMarkChange}
                  />

                </div>
              ))}

            </div>

            {error && (
              <div
                style={{
                  background: '#fee2e2',
                  color: '#991b1b',
                  padding: '14px',
                  borderRadius: '10px',
                  marginBottom: '18px'
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Analyzing Performance...'
                : '🚀 Analyze My Performance'}
            </button>

          </form>

        </section>

        {result && (
          <section className="card results">

            <h2>✨ Your Personalized Analysis</h2>
            <button
  type="button"
  onClick={downloadStudyPlan}
  style={{
    marginBottom: '20px'
  }}
>
  📥 Download Study Plan
</button>

            <div className="student-info">

              <div>
                <span>Student</span>
                <strong>{result.studentName}</strong>
              </div>

              <div>
                <span>Student ID</span>
                <strong>{result.studentId}</strong>
              </div>

              <div>
                <span>Board</span>
                <strong>{result.board}</strong>
              </div>

              <div>
                <span>Class</span>
                <strong>{result.class}</strong>
              </div>

            </div>

            <div className="average">

              <strong>
                {result.overallAverage}%
              </strong>

              <span>
                Overall Average
              </span>

            </div>

            <div className="readiness-card">

              <div className="readiness-icon">
                🎯
              </div>

              <div className="readiness-content">

                <h3>
                  Exam Readiness Score
                </h3>

                <div className="readiness-score">
                  {readiness}%
                </div>

                <p>
                  {getReadinessMessage(readiness)}
                </p>

              </div>

            </div>

            <div className="result-section">

              <h3>
                📊 Subject-wise Performance
                {badges.length > 0 && (
  <div className="result-section">

    <h3>
      🏆 Your Achievements
    </h3>

    <div className="target-grid">

      {badges.map((badge, index) => (
        <div
          className="target-card"
          key={index}
        >
          <h4>
            {badge}
          </h4>

          <p>
            Keep learning and improving!
          </p>
        </div>
      ))}

    </div>

  </div>
)}
              </h3>

              <div className="performance-list">

                {subjects.map((subject, index) => {

                  const status =
                    getStatus(subject.score)

                  return (
                    <div
                      className="performance-row"
                      key={index}
                    >

                      <div className="subject-name">
                        {subject.subject}
                      </div>

                      <div className="score">
                        {subject.score}/100
                      </div>

                      <div
                        className={`status ${status}`}
                      >
                        {getStatusText(
                          subject.score
                        )}
                      </div>

                      <div className="performance-bar-container">

                        <div className="performance-bar">

                          <div
                            className={`performance-fill ${status}`}
                            style={{
                              width: `${subject.score}%`
                            }}
                          />

                        </div>

                        <div className="performance-percentage">
                          {subject.score}%
                        </div>

                      </div>

                    </div>
                  )
                })}

              </div>

            </div>

            {result.weakSubjects &&
              result.weakSubjects.length > 0 && (

                <div className="result-section">

                  <h3>
                    🎯 Areas That Need Improvement
                  </h3>

                  {result.weakSubjects.map(
                    (subject, index) => (
                      <div
                        className="subject"
                        key={index}
                      >
                        <span>{subject}</span>
                        <span>Focus More</span>
                      </div>
                    )
                  )}

                </div>
              )}

            {result.analysis &&
              result.analysis.focusSubjects &&
              result.analysis.focusSubjects.length > 0 && (

                <div className="result-section">

                  <h3>
                    🚀 Personalized Improvement Targets
                  </h3>

                  <div className="target-grid">

                    {result.analysis.focusSubjects.map(
                      (item, index) => (

                        <div
                          className="target-card"
                          key={index}
                        >

                          <h4>
                            {item.subject}
                          </h4>

                          <div className="target-score">
                            Target: {item.targetImprovement}
                          </div>

                          <p>
                            {item.reason}
                          </p>

                          {item.recommendedTopics &&
                            item.recommendedTopics.length > 0 && (
                              <>
                                <strong>
                                  Recommended:
                                </strong>

                                <ul>
                                  {item.recommendedTopics.map(
                                    (topic, i) => (
                                      <li key={i}>
                                        {topic}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </>
                            )}

                        </div>

                      )
                    )}

                  </div>

                </div>
              )}

            {result.analysis &&
              result.analysis.summary && (

                <div className="plan">

                  <h3>
                    💡 Personalized Performance
                    Insight
                  </h3>

                  <p>
                    {result.analysis.summary}
                  </p>

                </div>
              )}

            {result.studyPlanText && (

              <div className="plan">

                <h3>
                  📚 Your Personalized Study Plan
                </h3>

                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'inherit',
                    lineHeight: '1.7'
                  }}
                >
                  {result.studyPlanText}
                </pre>

              </div>
            )}

            {result.analysis &&
              result.analysis.motivationalNote && (

                <div className="motivation">

                  <h3>
                    💪 Keep Going!
                  </h3>

                  <p>
                    {result.analysis.motivationalNote}
                  </p>

                </div>
              )}

          </section>
        )}

      </main>

    </div>
  )
}

export default App