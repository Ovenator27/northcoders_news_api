# Northcoders News API

## Link

https://northcoders-news-03ck.onrender.com/api

## Project summary

An API for the purpose of accessing application data programmatically.

The intention of this project is to mimic the building of a real world backend service (such as Reddit) which should provide this information to the front end architecture.

## Local setup

1. Fork or clone the repo from https://github.com/Ovenator27/northcoders_news_api 
2. Run npm install in the terminal
3. Seed local database using npm run seed
4. Run tests using npm test

## Accessing environment variables:

You will need to create two `.env` files: `.env.test` and `.env.development`.

Into each, add PGDATABASE=, with the correct database name for that environment (see `/db/setup.sql` for the database names). Double check that these `.env` files are `.gitignored`.

## Minimum version requirements

Node.js : v21.6.1
PostgreSQL: v14.10
