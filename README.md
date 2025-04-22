# Budget Builder Example Angular v19.2.8

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.8.

## Dependencies
- Angular v19.2.8
- Tailwind CSS
- Lodash
- RxJS
- TypeScript 5.x

## Features

- Excel-style cell navigation (arrow `Up`, `Down`, `Left`, `Right`, `Tab` keys and `Enter`)
- Monthly subtotals and grand totals
- Dynamic group/category rows
- Start and end months are dynamically changeable
- Press `Enter` at the end of a group row to add a new row
- Right-click on the first column of any row to delete it
- Right-click on any cell: “Apply to all” to copy a value across the same column
- Profit/loss carried to next month

## Prerequisites

- [Node.js](https://nodejs.org/) (v20 or latest LTS recommended)
- [Angular CLI](https://angular.io/cli) v19+

## Installation

### Clone the repository

```bash
git clone https://github.com/YuSuBui/budget-builder-example.git
cd budget-builder-angular
git checkout develop
```

### Install dependencies

```bash
npm install
```

## Run the application locally

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.
