require('dotenv').config();
const express = require('express'); // Import Express.js framework
const { createPool } = require('mysql2') // Destructuring createPool method from mysql2 module
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Comment the following lines regarding the port for unit tests
const port = process.env.PORT || 3000;
app.listen(port, () => {         
    console.log(`Listening on port ${port}`);
});

// create a MySQL connection pool
// credentials in an .env file
const pool = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

app.get('/', (req, res) => {
    res.send('Cities of the World');
});

// Route to get all cities from the database
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
         ORDER BY world.city.Population DESC;`, (err, citiesArray) => {
        if (err) {
            console.error(err);
            return res.status(500).send('500 Error: Internal Server Error');
        }
        res.send(citiesArray);
    });
});

// Utility function to generate a random country code
function generateRandomCode() {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 3; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Utility function to check if a country code exists in the database
function codeExists(code) {
    if (!code) {
        return Promise.resolve(false);
    }
    return new Promise((resolve, reject) => {
        pool.query(
            `SELECT 1 FROM world.country WHERE Code = ?`,
            [code],
            (err, result) => {
                if (err) {
                    console.error(err);
                    return reject(false);
                }
                resolve(result.length > 0);
            }
        );
    });
}

// Function to insert a new country and city into the database
async function insertCountry(cityName, district, population, country, region) {
    let newCode = generateRandomCode();
    let checkExists = await codeExists(newCode);
    let i = 0;
    while (checkExists && i < 100) {
        newCode = generateRandomCode();
        checkExists = await codeExists(newCode);
        i++;
    }
    pool.query(
        `INSERT INTO world.country (Code, Name, Region) VALUES (?, ?, ?)`,
        [newCode, country, region],
        (err) => {
            if (err) {
                console.error(err);
                return;
            }
            pool.query(
                `INSERT INTO world.city (Name, CountryCode, District, Population) VALUES (?, ?, ?, ?)`,
                [cityName, newCode, district, population],
                (err) => {
                    if (err) {
                        console.error(err);
                    }
                }
            );
        }
    );
}

// Route to add a new city and country
app.post('/api/cities/add', async (req, res) => {
    const { cityName, district, population, country, region } = req.body;

    if (!cityName || !district || !population || !country || !region) {
        return res.status(400).send({ message: '400 Error: Incomplete data' });
    }

    try {
        await insertCountry(cityName, district, population, country, region);
        res.status(200).send({ message: 'status 200: Successfully added data' });
    } catch (error) {
        console.error('Error adding the entry: ', error);
        if (!res.headersSent) {
            res.status(500).send({ message: '500 Error: Internal server error, could not add data' });
        }
    }
});

// Utility function to check if a country is already in the database
function isCountryInDatabase(country) {
    if (!country) {
        return false;
    }
    return new Promise((resolve, reject) => {
        pool.query(
            `SELECT 1 FROM world.country WHERE Name = ?`,
            [country],
            (err, result) => {
                if (err) {
                    console.error(err);
                    return reject(false);
                }
                resolve(result.length > 0);
            }
        );
    });
}

// Route to update an existing city and country or add a new one if the country does not exist
app.put('/api/cities/edit', async (req, res) => {
    const {
        CityID,
        CityName,
        District,
        CityPopulation,
        CountryName,
        Region
    } = req.body;
    if (!CityID || !CityName || !District || !CityPopulation || !CountryName || !Region) {
        return res.status(400).send('400 Bad Request: Incomplete data');
    }
    try {
        const exists = await isCountryInDatabase(CountryName);
        if (exists) {
            pool.query(`
                UPDATE world.city 
                JOIN world.country 
                ON world.city.CountryCode = world.country.Code
                SET 
                    world.city.Name = ?,
                    world.city.District = ?,
                    world.city.Population = ?,
                    world.country.Name = ?,
                    world.country.Region = ?
                WHERE 
                    world.city.ID = ?;`,
                [CityName, District, CityPopulation, CountryName, Region, CityID],
                (err) => {
                    if (err) {
                        console.error(err);
                        if (!res.headersSent) {
                            res.status(500).send({ message: '500 Error: Internal Server Error' });
                        }
                    } else {
                        res.status(200).send({ message: '200 OK: Successfully edited' });
                    }
                });
        } else {
            let newCode = generateRandomCode();
            let checkExists = await codeExists(newCode);
            let i = 0;
            while (checkExists && i < 100) {
                newCode = generateRandomCode();
                checkExists = await codeExists(newCode);
                i++;
            }
            try {
                await insertCountry(CityName, District, CityPopulation, CountryName, Region);
                deleteRowByCityID(CityID);
                res.status(200).send({ message: 'status 200: Successfully edited/replaced data' });
            } catch (error) {
                console.error('Error adding the entry: ', error);
                if (!res.headersSent) {
                    res.status(500).send({ message: '500 Error: Internal server error, could not add data' });
                }
            }
        }
    } catch (error) {
        console.error('Error updating city and country:', error);
        if (!res.headersSent) {
            res.status(500).send('500 Internal Server Error: Could not update city and country');
        }
    }
});

// Function to delete a city by its ID
async function deleteRowByCityID(id) {
    if (!id) {
        throw new Error("Undefined id");
    }

    return new Promise((resolve, reject) => {
        pool.query(
            `DELETE FROM world.city WHERE world.city.ID = ?`,
            [id],
            (err, results) => {
                if (err) {
                    console.error('Error deleting city:', err);
                    return reject(err); 
                }
                resolve(results); 
            }
        );
    });
}

// Route to delete selected cities
app.delete('/api/cities/delete', async (req, res) => {
    const { selected } = req.body;

    if (!selected || !Array.isArray(selected) || selected.length === 0) {
        return res.status(400).send({ message: '400 Error: No selection to delete' });
    }

    try {
        // Create a list of promises for the delete operations
        const deletePromises = selected.map(id => deleteRowByCityID(id));

        // Wait for all delete operations to complete
        await Promise.all(deletePromises);

        res.status(200).send({ message: '200 OK: Successfully deleted selection' });
    } catch (error) {
        console.error('Error deleting selection:', error);
        res.status(500).send({ message: '500 Error: Internal Server Error' });
    }
});

// Catch-all route for handling 404 errors
app.use((req, res) => {
    res.status(404).send('404 Error: Page Not Found');
});

// For testing purposes.
const shutdown = async () => {
    try {
        await pool.end();
        console.log('MySQL connection pool closed.');
    } catch (err) {
        console.error('Error closing MySQL connection pool:', err);
    }
};


// Handle termination signals to gracefully shut down the server
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);


// Export app and pool for testing purposes
module.exports = { app, pool };