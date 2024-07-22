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
                if (result.length < 1) {
                    resolve(false); // country code is not found
                }
                resolve(true); // country code is found
            }
        )
    }
)}

async function insertCountry(cityName, district, population, country, region) {

    let i = 0; // for max iterations in while loop
    const newCode = generateRandomCode();
    let checkExists = await codeExists(newCode);
    while(checkExists && i < 100) {
        newCode = generateRandomCode();
        checkExists = await codeExists(newCode);
        i++;
    } 
    // Country code is unique, insert the country
    pool.query(
        `INSERT INTO world.country (Code, Name, Region) VALUES (?, ?, ?)`,
        [newCode, country, region],
        (err, result) => {
            if (err) {
                console.error(err);
                return;
            }
            // Insert the city
            pool.query(
                `INSERT INTO world.city (Name, CountryCode, District, Population) VALUES (?, ?, ?, ?)`,
                [cityName, newCode, district, population],
                (err, result2) => {
                    if (err) {
                        console.error(err);
                    }
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
    } catch (error) {
        console.error('Error adding the entry: ', error);
        res.status(500).send({ message: '500 Error: Internal server error, could not add data' });
    }
});

function isCountryInDatabase(country) {
    if (!country) {
      return (false);
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
          if (result.length > 0) {
            resolve(true); // country is found
          } 
          else {
            resolve(false); // country is not found
          }
        }
      );
    });
}
  

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
            //update the table
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
                        res.status(500).send({ message: '500 Error: Internal Server Error' });
                    }
                    else {
                        res.status(200).send({ message: '200 OK: Successfully edited' })
                    }
                })
        }
        else {
            let newCode = generateRandomCode(); // first, generate a new unique country code for this country
            let checkExists = await codeExists(newCode);
            let i = 0
            while(checkExists && i < 100) { // max iterations of 100
                newCode = generateRandomCode(); // generate until you get a country code that doesn't already exist
                checkExists = await codeExists(newCode);
                i++;
            }
            // Now that there is a unique country code, add the country and country code to the world.country table
            try {
                insertCountry(CityName, District, CityPopulation, CountryName, Region);
                deleteRowByCityID(CityID); // delete the old entry, as the new one will replace it
                res.status(200).send({ message: 'status 200: Successfully edited/replaced data' });
            } catch (error) {
                console.error('Error adding the entry: ', error);
                res.status(500).send({ message: '500 Error: Internal server error, could not add data' });
            }
        }
    } catch (error) {
        console.error('Error updating city and country:', error);
        res.status(500).send('500 Internal Server Error: Could not update city and country');
    }
});

function deleteRowByCityID (id) {
    if (!id) {
        console.log("Error 500: Undefined id")
        return;
    }
    try {
        pool.query(
            `DELETE FROM world.city WHERE world.city.ID = ?`,
            [id],
            (err) => {
                if (err) {
                    console.error(err);
                    return;
                }
            }
        )
    } catch (error) {
        console.error('Error deleting selection', error);
        return;
    }
}

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