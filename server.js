import express from 'express';

const app = express();
const port = 8000;

app.use(express.static('.'))
// express.static(path.join(__dirname, 'public'));

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})
