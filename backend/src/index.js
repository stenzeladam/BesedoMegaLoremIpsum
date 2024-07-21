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

// Function to generate a random 3-character code for the country code
function generateRandomCode() {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let counter = 0;
    while (counter < 3) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
      counter += 1;
    }
    return result;
}

// Function to check if the generated country code already exists in the database.
function codeExists(code) {
    pool.query(
        `SELECT 1 FROM world.country WHERE Code = ?`,
        [code],
        (err) => {
            if (err) {
                return false;
            }
            else {
                return true;
            }
        }
    );
}

function insertCountry(cityName, district, population, country, region) {
    const newCode = generateRandomCode();
    while(codeExists(newCode)) {
        newCode = generateRandomCode();
    } 
    // Country code is unique, insert the country
    pool.query(
        `INSERT INTO world.country (Code, Name, Region) VALUES (?, ?, ?)`,
        [newCode, country, region],
        (err) => {
            if (err) {
                console.error(err);
                return;
            }
            // Insert the city
            pool.query(
                `INSERT INTO world.city (Name, CountryCode, District, Population) VALUES (?, ?, ?, ?)`,
                [cityName, newCode, district, population],
                (err) => {
                    if (err) {
                        console.error(err);
                        returnstatus(500).send('500 Error: Internal Server Error');
                        return;
                    }
                    return;
                }
            );
        }
    );
}

app.post('/api/cities/add', (req, res) => {
    const { cityName, district, population, country, region } = req.body;

    if (!cityName || !district || !population || !country || !region) {
        return res.status(400).send({ message: '400 Error: Incomplete data' });
    }

    try {
        insertCountry(cityName, district, population, country, region);
        res.status(200).send({ message: 'status 200: Successfully added data' });
        return;
    } catch (error) {
        console.error('Error adding the entry: ', error);
        res.status(500).send({ message: '500 Error: Internal server error, could not add data' });
        return;
    }
});


app.put('/api/cities/edit', async (req, res) => {
    const { 
        cityID: cityID,
        cityName: cityName, 
        district: district, 
        population: population, 
        country: country, 
        region: region 
      } = req.body;
    if (!cityID || !cityName || !district || !population || !country || !region) {
        return res.status(400).send('400 Bad Request: Incomplete data');
    }
    try {
        pool.query(
            `SELECT world.city.CountryCode FROM world.city WHERE world.city.ID = ?`,
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
                    `UPDATE world.city
                    SET world.city.Name = ?, world.city.District = ?, world.city.Population = ?,
                    WHERE world.city.ID = ?;`,
                    [cityName, district, population, cityID],
                    (err, arr ) => {
                        if (err) {
                            console.error(err);
                            res.status(500).send('501 Error: Internal Server Error');
                            return;
                        }
                        res.status(200).send(arr, 'Data updated successfully');
                        console.log('200 OK');
                    }
                )
            }
        );
    } catch (error) {
        console.error('Error updating city and country:', error);
        res.status(500).send('500 Internal Server Error: Could not update city and country');
    }
});

app.delete('/api/cities/delete', async (req, res) => {
    const { selected } = req.body;
    if (!selected) {
        return res.status(400).send({ message: '400 Error: No selection to delete' });
    }

    try {
        for (let i = 0; i < selected.length; i++) {
            let id = selected[i];
            pool.query(
                `DELETE FROM world.city WHERE world.city.ID = ?`,
                [id],
                (err) => {
                    if (err) {
                        console.error(err);
                        res.status(500).send({ message: '500 Error: Internal Server Error' });
                        return;
                    }
                }
            )
        }
        res.status(200).send({ message: '200 OK: Successfully deleted selection' });
        console.log('200 OK');
    } catch (error) {
        console.error('Error deleting selection', error);
        res.status(500).send({ message: '500 Error: Internal Server Error' });
        return;
    }
});

app.use((req, res) => {
    res.status(404).send('404 Error: Page Not Found');
});