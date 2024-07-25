const request = require('supertest');
const { app } = require('../src/index');
const mysql = require('mysql2/promise');

// Mock the mysql2/promise module
jest.mock('mysql2/promise', () => {
  const mPool = {
    query: jest.fn(),
    end: jest.fn().mockResolvedValue(),
  };
  return {
    createPool: jest.fn(() => mPool),
    mPool,
  };
});

const { mPool } = require('mysql2/promise');

// Utility function to check if the expected data is a subset of the actual data
const containsSubset = (actual, expected) => {
  return expected.every(expectedItem =>
    actual.some(actualItem =>
      Object.keys(expectedItem).every(key => actualItem[key] === expectedItem[key])
    )
  );
};

describe('API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Ensure the mocked pool is properly closed
    await mPool.end();
  });

  test('GET / should return a welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe('Cities of the World');
  });

  test('GET /api/cities should return an array of cities', async () => {
    const mockCities = [
      { CityID: 1024, CityName: 'Mumbai (Bombay)', CityPopulation: 10500000, CountryName: 'India', District: 'Maharashtra', Region: 'Southern and Central Asia' },
      { CityID: 2331, CityName: 'Seoul', CityPopulation: 9981619, CountryName: 'South Korea', District: 'Seoul', Region: 'Eastern Asia' },
      { CityID: 206, CityName: 'São Paulo', CityPopulation: 9968485, CountryName: 'Brazil', District: 'São Paulo', Region: 'South America' },
      { CityID: 1890, CityName: 'Shanghai', CityPopulation: 9696300, CountryName: 'China', District: 'Shanghai', Region: 'Eastern Asia' },
      { CityID: 939, CityName: 'Jakarta', CityPopulation: 9604900, CountryName: 'Indonesia', District: 'Jakarta Raya', Region: 'Southeast Asia' },
      { CityID: 2822, CityName: 'Karachi', CityPopulation: 9269265, CountryName: 'Pakistan', District: 'Sindh', Region: 'Southern and Central Asia' },
      { CityID: 3357, CityName: 'Istanbul', CityPopulation: 8787958, CountryName: 'Turkey', District: 'Istanbul', Region: 'Middle East' },
      { CityID: 2515, CityName: 'Ciudad de México', CityPopulation: 8591309, CountryName: 'Mexico', District: 'Distrito Federal', Region: 'Central America' },
      { CityID: 3580, CityName: 'Moscow', CityPopulation: 8389200, CountryName: 'Russian Federation', District: 'Moscow (City)', Region: 'Eastern Europe' },
      { CityID: 3793, CityName: 'New York', CityPopulation: 8008278, CountryName: 'United States', District: 'New York', Region: 'North America' },
    ];
    mPool.query.mockResolvedValueOnce([mockCities]);

    const res = await request(app).get('/api/cities');

    console.log('Actual response body:', JSON.stringify(res.body, null, 2));
    console.log('Expected:', JSON.stringify(mockCities, null, 2));

    // Check if each expected item is in the actual response
    const isSubset = containsSubset(res.body, mockCities);

    // Additional logging for debugging
    if (!isSubset) {
      console.log('Subset check failed. Checking for detailed mismatches:');
      mockCities.forEach(expectedItem => {
        if (!res.body.some(actualItem =>
          Object.keys(expectedItem).every(key => actualItem[key] === expectedItem[key])
        )) {
          console.log('Missing item in actual response:', expectedItem);
        }
      });

      // Log the actual data that was returned
      console.log('Returned data:', JSON.stringify(res.body, null, 2));
    }

    expect(isSubset).toBe(true);
  });

  test('POST /api/cities/add should add a new city and country', async () => {
    const newCity = {
      cityName: 'New City',
      district: 'New District',
      population: 500000,
      country: 'New Country',
      region: 'New Region'
    };

    // Mock the insertion of a new city and country
    mPool.query.mockResolvedValueOnce([{ insertId: 1000 }]); // Mock country insertion
    mPool.query.mockResolvedValueOnce([{ insertId: 4148 }]); // Mock city insertion

    const res = await request(app).post('/api/cities/add').send(newCity);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('status 200: Successfully added data');
  });

  test('PUT /api/cities/edit should update an existing city and country', async () => {
    const updatedCity = {
      CityID: 3333,
      CityName: 'Updated City',
      District: 'Updated District',
      CityPopulation: 600000,
      CountryName: 'Updated Country',
      Region: 'Updated Region'
    };

    mPool.query.mockResolvedValueOnce([[{ '1': 1 }]]); // Mock isCountryInDatabase (country exists)
    mPool.query.mockResolvedValueOnce([{}]); // Mock update query

    const res = await request(app).put('/api/cities/edit').send(updatedCity);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('200 OK: Successfully edited');
  });

  test('DELETE /api/cities/delete should delete selected cities', async () => {
    const deleteRequest = {
      selected: [3333, 2317, 2912]
    };

    mPool.query.mockResolvedValue([{}]); // Mock delete query

    const res = await request(app).delete('/api/cities/delete').send(deleteRequest);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('200 OK: Successfully deleted selection');
  });
});
