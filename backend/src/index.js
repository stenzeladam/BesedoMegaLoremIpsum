require('dotenv').config();
const express = require('express'); // Import Express.js framework
const { createPool } = require('mysql2') // Destructuring createPool method from mysql2 module
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
}); // Start the server and log port info

// create a MySQL connection pool
// credentials in an .env file
const pool = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Route for the root URL
app.get('/', (req, res) => {
    res.send('Cities of the World')
});

// Route to fetch cities from the database
app.get('/api/cities', (req, res) => {
    pool.query(
        `SELECT 
            world.city.ID AS CityID, 
            world.city.Name AS CityName,
            world.city.District,
            world.city.Population AS CityPopulation,
            world.country.Name AS CountryName,
            world.country.Region
         FROM world.city
         JOIN world.country
         ON world.city.CountryCode = world.country.Code
         order by world.city.Population DESC;`, (err, citiesArray) => {
        if (err) {
            console.error(err);
            res.status(500).send('500 Error: Internal Server Error');
            return;
        }
        res.send(citiesArray); //send the fetched cities data as a response
        console.log('200 OK');
    });
});

app.post('/api/cities/add', (req, res) => {
    const { 
        cityName: cityName, 
        district: district, 
        population: population, 
        country: country, 
        region: region 
      } = req.body;
      if (!cityName || !district || !population || !country || !region) {
        return res.status(400).send('400 Bad Request: Incomplete data');
      }
    
    pool.query(
        `SELECT Code FROM world.country WHERE Name = ?`,
        [country],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('500 Error: Internal Server Error');
            }
            if (result.length === 0) {
                return res.status(404).send('404 Not Found: Country not found');
            }
            const countryCode = result[0].Code;
            pool.query(
                `INSERT INTO world.city (Name, CountryCode, District, Population)
                VALUES (?, ?, ?, ?)`,
                [cityName, countryCode, district, population],
                (err, arr) => {
                    if (err) {
                        console.error(err);
                        res.status(500).send('500 Error: Internal Server Error');
                        return;
                    }
                    res.send(arr);
                    console.log('200 OK');
                }
            )  
        }
    );
});

app.post('/api/cities/check-id', (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).send('400 Bad Request: ID is required');
    }

    pool.query(
        `SELECT ID FROM world.city WHERE ID = ?`, // Parameterized query to avoid SQL injection
        [id], // Parameters array
        (err, resultArray) => {
            if (err) {
                console.error(err);
                return res.status(500).send('500 Error: Internal Server Error');
            }

            if (resultArray.length > 0) {
                // Entry exists
                return res.status(200).send({ exists: true });
            } else {
                // No entry found
                return res.status(200).send({ exists: false });
            }
        }
    );
});

app.use((req, res) => {
    res.status(404).send('404 Error: Page Not Found');
});