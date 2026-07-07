import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import categoriesRouter from './routes/categories';
import employeeRouter from './routes/employee';
import feedbackRouter from './routes/feedback';
import { startOutboxWorker } from './worker';

dotenv.config();

// Start the background worker for FMS integration
startOutboxWorker();

const app = express();
const port = process.env.PORT || 8000;

const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Voice Box API is running', version: '1.0.0' });
});

app.use('/categories', categoriesRouter);
app.use('/employee', employeeRouter);
app.use('/feedback', feedbackRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
