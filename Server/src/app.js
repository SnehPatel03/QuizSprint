import express from 'express';
import 'dotenv/config';
const app = express();
const PORT = process.env.PORT || 3000;
// middleware
app.use(express.json());
// simple GET route
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Server is running'
    });
});
// start server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
