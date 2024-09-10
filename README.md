## Introduction
Website to display, edit, add, & delete cities with their information.

## Prerequisites
- Make sure that you have `Node` & `MySQL` installed. 
- The project includes a dump file called `world.sql`, running the contents of it in MySQL workbench would get you up and running quickly.
    
    If you do not have MySQL workbench, you could copy the contents of the file and paste them in the MySQL shell.
    ```
    mysql -u root -p
    ```
- Make sure to include a `.env` file inside the backend folder structured as the following:

    ```
    DB_HOST=<DB_HOST>
    DB_USER=<DB_USER>
    DB_PASSWORD=<DB_PASSWORD>
    DB_NAME=<DB_NAME>
    ```

- Install the required packages in both the backend and frontend folders.
    
    npm install

## Getting started
After the previous setup steps you should be good to go, just start the backend and then the frontend server.

- Starting backend server
    
    ```
    npm run dev
    ```
- Starting frontend server
    ```
    npm start
    ```