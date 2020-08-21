const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());


app.use('/coaches', require('./routes/coaches'));
app.use('/clients', require('./routes/clients'));
app.use('/exercises', require('./routes/exercises'));
app.use('/trainings', require('./routes/trainings'));
app.use('/history', require('./routes/history'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));