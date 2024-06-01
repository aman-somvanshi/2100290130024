const express = require('express');
const axios = require('axios');
const app = express();

let storedNumbers = [];

function calculateAverage(numbers) {
    if (numbers.length === 0) {
        return 0;
    }
    const sum = numbers.reduce((total, num) => total + num, 0);
    return sum / numbers.length;
}

app.get('/numbers/:numberid', async (req, res) => {
    try {
        const numberId = req.params.numberid;
        const validNumberIds = ['p', 'f', 'e', 'r'];
        if (!validNumberIds.includes(numberId)) {
            return res.status(400).json({ error: 'Invalid numberId. Expected values: "p", "f", "e", "r"' });
        }

        let testServerUrl;

        switch(numberId) {
            case 'p':
                testServerUrl = `http://20.244.56.144/test/primes`;
                break;
            case 'f':
                testServerUrl = `http://20.244.56.144/test/fibo`;
                break;
            case 'e':
                testServerUrl = `http://20.244.56.144/test/even`;
                break;
            case 'r':
                testServerUrl = `http://20.244.56.144/test/rand`;
                break;
            default:
                // Handle default case if needed
                break;
        }

        const response = await axios.get(testServerUrl);

        const numbers = response.data.numbers;

        storedNumbers = [...new Set([...storedNumbers, ...numbers])];

        const windowSize = 10;
        if (storedNumbers.length > windowSize) {
            storedNumbers = storedNumbers.slice(-windowSize);
        }
        const average = calculateAverage(storedNumbers);

        const responseData = {
            windowPrevState: storedNumbers.slice(0, -numbers.length),
            windowCurrState: storedNumbers,
            numbers: numbers,
            avg: average.toFixed(2)
        };

        res.json(responseData);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
