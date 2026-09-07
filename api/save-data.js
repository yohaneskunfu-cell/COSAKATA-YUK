import pool from './db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { type, username, action, title, score, total, percentage, details } = req.body;

  try {
    if (type === 'log') {
      const query = 'INSERT INTO activity_logs (username, action, created_at) VALUES (?, ?, NOW())';
      await pool.execute(query, [username, action]);
      return res.status(200).json({ success: true, message: 'Log saved successfully' });
    } 

    else if (type === 'report') {
      const query = `
        INSERT INTO student_reports (username, title, score, total, percentage, details, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `;
      await pool.execute(query, [username, title, score, total, percentage, JSON.stringify(details)]);
      return res.status(200).json({ success: true, message: 'Report saved successfully' });
    }

    return res.status(400).json({ message: 'Invalid type' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
}